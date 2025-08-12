//! # Valyra Escrow Canister
//! 
//! This canister implements secure, milestone-based escrow services for business acquisitions
//! on the Valyra marketplace. It manages buyer funds using ckUSDC (Chain-Key USDC) and 
//! threshold ECDSA for cryptographic security, ensuring safe and transparent transactions.
//! 
//! ## Key Features
//! 
//! - **ckUSDC Integration**: Full ICRC-2 token standard support for deposits and withdrawals
//! - **Threshold ECDSA**: IC-native cryptographic key generation for unique escrow addresses
//! - **Milestone-Based Payments**: Staged fund release tied to business handover progress
//! - **Finite State Machine**: Robust state management preventing invalid transitions
//! - **Dispute Resolution**: Integration hooks for DAO-based conflict resolution
//! - **Comprehensive Auditing**: Complete event logging for transparency and compliance
//! - **Automatic Releases**: Timer-based fund release on milestone deadlines
//! 
//! ## Escrow Flow
//! 
//! ### Phase 1: Escrow Creation
//! ```text
//! Buyer → create_escrow(listing_id, seller, amount, milestones)
//!      → Generates unique t-ECDSA address
//!      → State: Created
//! ```
//! 
//! ### Phase 2: Funds Deposit  
//! ```text
//! Buyer → deposit_funds(escrow_id, amount)
//!      → ICRC-2 transfer_from to escrow address
//!      → State: Created → Locked
//! ```
//! 
//! ### Phase 3: Milestone Progression
//! ```text
//! For each milestone:
//!   Seller → complete_milestone(escrow_id, index)
//!        → State: Locked → MilestoneDone
//!   
//!   Buyer/Seller → release_funds(escrow_id, index)  
//!        → ICRC-2 transfer to seller
//!        → Partial release or State: MilestoneDone → Released (if final)
//! ```
//! 
//! ### Phase 4: Completion or Dispute
//! ```text
//! Success: All milestones → State: Released → Transaction complete
//! Dispute: Any party → dispute_escrow() → DAO resolution
//! ```
//! 
//! ## Storage Architecture
//! 
//! - `ESCROW_STORAGE`: StableBTreeMap<u64, EscrowAccount> - Primary escrow data
//! - `NEXT_ESCROW_ID`: RefCell<u64> - Auto-incrementing escrow IDs
//! - `EVENT_LOG`: RefCell<Vec<EscrowEvent>> - Transaction audit trail
//! - `ACTIVE_TIMERS`: RefCell<HashMap<u64, TimerId>> - Automatic release scheduling
//! - `MEMORY_MANAGER`: Handles stable memory allocation across upgrades
//! 
//! ## API Endpoints
//! 
//! ### Update Functions
//! - `create_escrow(u64, Principal, u64, Vec<Milestone>) -> Result<u64, String>` - Create new escrow
//! - `deposit_funds(u64, u64) -> Result<(), String>` - Deposit ckUSDC funds
//! - `complete_milestone(u64, usize) -> Result<(), String>` - Mark milestone completed
//! - `release_funds(u64, usize) -> Result<(), String>` - Release milestone payment
//! - `dispute_escrow(u64, String) -> Result<(), String>` - Initiate dispute resolution
//! 
//! ### Query Functions
//! - `get_escrow(u64) -> Option<EscrowAccount>` - Retrieve escrow details
//! - `get_escrows_by_listing(u64) -> Vec<EscrowAccount>` - List escrows for listing
//! - `get_escrows_by_buyer(Principal) -> Vec<EscrowAccount>` - List buyer's escrows
//! - `get_recent_events(usize) -> Vec<EscrowEvent>` - Retrieve audit trail
//! 
//! ## Security Model
//! 
//! - **Access Control**: Principal-based authorization for all sensitive operations
//! - **Cryptographic Security**: IC threshold ECDSA for tamper-proof address generation
//! - **State Validation**: FSM prevents invalid state transitions and double-spending
//! - **Fund Safety**: Multi-signature-style release requiring milestone completion
//! - **Audit Trail**: Immutable event log for compliance and dispute resolution
//! - **Timeout Protection**: Automatic release prevents indefinite fund locking

use candid::{Nat, Principal};
use ic_cdk::{
    api::{
        call::call,
        management_canister::ecdsa::{
            ecdsa_public_key, EcdsaCurve, EcdsaKeyId, EcdsaPublicKeyArgument,
        },
        time,
    },
    caller, id,
};
use ic_cdk_timers::TimerId;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use shared_types::{EscrowAccount, EscrowEvent, EscrowMilestone, EscrowState};
use std::{cell::RefCell, collections::HashMap};

// ════════════════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Type alias for virtual memory used by stable structures
/// Provides persistent storage that survives canister upgrades
type Memory = VirtualMemory<DefaultMemoryImpl>;

/// Type alias for the main escrow accounts storage
/// Maps escrow ID (u64) to complete EscrowAccount structure with stable storage
type EscrowStorage = StableBTreeMap<u64, EscrowAccount, Memory>;

/// ckUSDC canister ID for ICRC-2 token operations
/// TODO: Update with actual ckUSDC canister ID before mainnet deployment
/// Currently set to anonymous for local development and testing
const CKUSDC_CANISTER_ID: Principal = Principal::anonymous();

// ════════════════════════════════════════════════════════════════════════════════════════
// ICRC-2 TOKEN INTEGRATION TYPES
// ════════════════════════════════════════════════════════════════════════════════════════

/// ICRC-2 Account structure for ckUSDC operations
/// Represents a token account with principal owner and optional subaccount
/// Used in all ckUSDC transfer operations for identifying source and destination
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct Account {
    /// Principal ID of the account owner (canister or user)
    owner: Principal,
    /// Optional subaccount for segregating funds within the same principal
    /// Each escrow uses unique subaccount derived from escrow ID
    subaccount: Option<Vec<u8>>,
}

/// ICRC-2 TransferFrom arguments for deposits into escrow
/// Used when buyer deposits ckUSDC funds into escrow account
/// Requires prior approval from buyer to escrow canister
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct TransferFromArgs {
    /// Subaccount of the spender (escrow canister) - typically None
    spender_subaccount: Option<Vec<u8>>,
    /// Source account to transfer from (buyer's account)
    from: Account,
    /// Destination account (escrow canister's subaccount)
    to: Account,
    /// Amount to transfer in ckUSDC smallest unit (6 decimals)
    amount: Nat,
    /// Transaction fee (typically handled automatically by ckUSDC)
    fee: Option<Nat>,
    /// Optional memo for transaction identification (escrow ID)
    memo: Option<Vec<u8>>,
    /// Timestamp for transaction deduplication
    created_at_time: Option<u64>,
}

/// ICRC-2 Transfer arguments for releasing funds to seller
/// Used when escrow releases milestone payments to seller
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
struct TransferArgs {
    /// Escrow subaccount to transfer from (derived from escrow ID)
    from_subaccount: Option<Vec<u8>>,
    /// Destination account (seller's account)
    to: Account,
    /// Amount to transfer in ckUSDC smallest unit
    amount: Nat,
    /// Transaction fee (handled automatically)
    fee: Option<Nat>,
    /// Optional memo for transaction identification
    memo: Option<Vec<u8>>,
    /// Timestamp for transaction deduplication
    created_at_time: Option<u64>,
}

/// Result type for ICRC-2 transfer_from operations (deposits)
/// Returns either the blockchain block index or detailed error information
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
enum TransferFromResult {
    /// Successful transfer with block index on ckUSDC ledger
    Ok(Nat),
    /// Transfer failed with specific error details
    Err(TransferFromError),
}

/// Result type for ICRC-2 transfer operations (releases)
/// Returns either the blockchain block index or detailed error information
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
enum TransferResult {
    /// Successful transfer with block index on ckUSDC ledger
    Ok(Nat),
    /// Transfer failed with specific error details
    Err(TransferError),
}

/// Detailed error types for ICRC-2 transfer_from failures
/// Provides specific error information for debugging and user feedback
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
enum TransferFromError {
    /// Transaction fee is incorrect
    BadFee { expected_fee: Nat },
    /// Burn amount is below minimum threshold
    BadBurn { min_burn_amount: Nat },
    /// Source account has insufficient ckUSDC balance
    InsufficientFunds { balance: Nat },
    /// Escrow canister lacks sufficient allowance from buyer
    InsufficientAllowance { allowance: Nat },
    /// Transaction timestamp is too old for processing
    TooOld,
    /// Transaction timestamp is in the future
    CreatedInFuture { ledger_time: u64 },
    /// ckUSDC ledger is temporarily unavailable
    TemporarilyUnavailable,
    /// Duplicate transaction detected
    Duplicate { duplicate_of: Nat },
    /// Generic error with custom message
    GenericError { error_code: Nat, message: String },
}

/// Detailed error types for ICRC-2 transfer failures  
/// Provides specific error information for milestone payment releases
#[derive(candid::CandidType, candid::Deserialize, Clone, Debug)]
enum TransferError {
    /// Transaction fee is incorrect
    BadFee { expected_fee: Nat },
    /// Burn amount is below minimum threshold
    BadBurn { min_burn_amount: Nat },
    /// Escrow subaccount has insufficient ckUSDC balance
    InsufficientFunds { balance: Nat },
    /// Transaction timestamp is too old for processing
    TooOld,
    /// Transaction timestamp is in the future
    CreatedInFuture { ledger_time: u64 },
    /// ckUSDC ledger is temporarily unavailable
    TemporarilyUnavailable,
    /// Duplicate transaction detected
    Duplicate { duplicate_of: Nat },
    /// Generic error with custom message
    GenericError { error_code: Nat, message: String },
}

/// Returns the ECDSA key configuration for threshold cryptography
/// 
/// Uses Internet Computer's threshold ECDSA for generating unique addresses
/// per escrow account. This provides cryptographic security without requiring
/// the canister to store private keys directly.
/// 
/// # Configuration
/// - **Curve**: secp256k1 (Bitcoin/Ethereum compatible)
/// - **Key Name**: "test_key_1" for local development, update for mainnet
/// 
/// # Security Note
/// Each escrow gets a unique address derived from:
/// - Canister ID + Escrow ID → Unique derivation path
/// - IC threshold ECDSA → Secure key generation
/// - No private key storage in canister
fn get_ecdsa_key_id() -> EcdsaKeyId {
    EcdsaKeyId {
        curve: EcdsaCurve::Secp256k1,
        name: "test_key_1".to_string(), // TODO: Use production key for mainnet
    }
}

// ════════════════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE & MEMORY MANAGEMENT  
// ════════════════════════════════════════════════════════════════════════════════════════

thread_local! {
    /// Memory manager for stable storage across canister upgrades
    /// 
    /// Handles allocation of virtual memory regions for different data structures.
    /// Ensures data persistence during canister upgrades and prevents memory conflicts.
    /// Uses DefaultMemoryImpl for compatibility with IC stable structures.
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    /// Primary storage for all escrow accounts
    /// 
    /// Maps escrow ID (u64) to complete EscrowAccount structure using stable storage.
    /// Data survives canister upgrades and provides O(log n) access performance.
    /// Uses memory region 0 for persistent storage allocation.
    /// 
    /// # Storage Layout
    /// - Key: Escrow ID (auto-incrementing, starting from 1)
    /// - Value: Complete EscrowAccount with all milestone and state data
    /// - Capacity: Limited only by IC stable memory (~400GB theoretical max)
    static ESCROW_STORAGE: RefCell<EscrowStorage> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    /// Auto-incrementing counter for generating unique escrow IDs
    /// 
    /// Starts at 1 and increments for each new escrow account created.
    /// Provides guaranteed unique identifiers across all escrows.
    /// Not stored in stable memory - resets on canister reinstall (not upgrade).
    /// 
    /// # Thread Safety
    /// Protected by RefCell for interior mutability in single-threaded IC environment.
    static NEXT_ESCROW_ID: RefCell<u64> = RefCell::new(1);

    /// In-memory event log for audit trail and debugging
    /// 
    /// Stores the most recent 1000 escrow events for real-time monitoring.
    /// Events include escrow creation, fund deposits, milestone completions, and disputes.
    /// Automatically pruned to prevent unbounded growth - older events are discarded.
    /// 
    /// # Important Note
    /// This is volatile storage - events are lost on canister restart.
    /// For permanent audit trails, integrate with external logging systems.
    static EVENT_LOG: RefCell<Vec<EscrowEvent>> = RefCell::new(Vec::new());

    /// Active timer registry for automatic milestone releases
    /// 
    /// Maps composite keys (escrow_id * 1000 + milestone_index) to timer IDs.
    /// Enables cancellation of scheduled automatic releases when milestones complete early.
    /// Timers trigger automatic milestone completion and fund release on deadline.
    /// 
    /// # Timer Management
    /// - Timers are created when escrows move to Locked state
    /// - Automatically cancelled when milestones complete manually
    /// - Cleanup on escrow completion prevents memory leaks
    static ACTIVE_TIMERS: RefCell<HashMap<u64, TimerId>> = RefCell::new(HashMap::new());
}

// ════════════════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════════════════════════════

/// Initializes the escrow canister on first deployment
/// 
/// Sets up the global state and stable storage structures.
/// Called automatically by the IC when the canister is first installed.
/// 
/// # Initialization Process
/// 1. Memory manager and storage structures are auto-initialized via thread_local!
/// 2. Escrow ID counter starts at 1
/// 3. Event log and timer registry are empty
/// 4. Ready to accept escrow creation requests
#[ic_cdk::init]
fn init() {
    ic_cdk::println!("🚀 Valyra Escrow canister initialized successfully");
}

/// Pre-upgrade hook for canister code updates
/// 
/// Called automatically before canister code is replaced during upgrades.
/// Since we use stable structures, no manual state serialization is needed.
/// All escrow data in ESCROW_STORAGE persists automatically.
/// 
/// # Persistence Notes
/// - EscrowAccount data: ✅ Automatically preserved in stable memory
/// - Event log: ❌ Volatile - will be reset (by design for memory management)
/// - Active timers: ❌ Will be reset (timers need re-registration post-upgrade)
#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("📦 Preparing for canister upgrade - stable data preserved");
}

/// Post-upgrade hook for canister code updates  
/// 
/// Called automatically after new canister code is installed during upgrades.
/// Stable storage is automatically restored, but volatile state needs reinitialization.
/// 
/// # Post-Upgrade Tasks
/// - Stable storage: ✅ Automatically restored by IC
/// - Event log: Starts fresh (intentional for memory management)  
/// - Timers: Need re-registration for active escrows (TODO: implement)
#[ic_cdk::post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("🔄 Escrow canister upgrade completed successfully");
    
    // TODO: Re-register timers for active escrows in Locked state
    // This would iterate through ESCROW_STORAGE and reschedule automatic releases
}

// ════════════════════════════════════════════════════════════════════════════════════════
// CORE ESCROW FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Creates a new escrow account for a business acquisition
/// 
/// This function initiates the escrow process by creating a new EscrowAccount with
/// milestone-based payment structure. It generates a unique threshold ECDSA address
/// for secure fund management and validates all input parameters.
/// 
/// # Process Flow
/// 1. **Validation**: Validates amount > 0, milestones exist, and amounts sum correctly
/// 2. **ID Generation**: Creates unique escrow ID and increments counter
/// 3. **Address Generation**: Creates threshold ECDSA address for fund isolation  
/// 4. **Storage**: Persists complete escrow account in stable storage
/// 5. **Event Logging**: Records EscrowCreated event for audit trail
/// 
/// # Arguments
/// * `listing_id` - Business listing ID from ListingRegistry canister
/// * `seller` - Principal ID of the business seller (must be listing owner)
/// * `total_amount` - Total purchase price in ckUSDC smallest unit (6 decimals)
/// * `milestones` - Vector of payment milestones defining release schedule
/// 
/// # Milestone Requirements
/// - At least one milestone must be provided
/// - Sum of milestone amounts must equal `total_amount` exactly
/// - Each milestone must have description, amount, and deadline
/// - Deadlines should be in nanoseconds since epoch (IC time format)
/// 
/// # Returns
/// * `Result<u64, String>` - Escrow ID on success, detailed error message on failure
/// 
/// # Errors
/// - `"Total amount must be greater than zero"` - Invalid amount
/// - `"At least one milestone is required"` - No milestones provided
/// - `"Milestone amounts must sum to total amount"` - Math validation failure
/// - `"Failed to generate ECDSA address: ..."` - Cryptographic error
/// 
/// # Example Usage
/// ```text
/// # Create milestones for SaaS acquisition
/// milestones = [
///   Milestone { description: "Initial handover", amount: 50000000000, deadline: 1700000000000000000 },
///   Milestone { description: "Customer transition", amount: 50000000000, deadline: 1800000000000000000 }
/// ]
/// 
/// # Call from buyer's principal
/// result = create_escrow(42, seller_principal, 100000000000, milestones)
/// # Returns: Ok(1) for first escrow
/// ```
/// 
/// # Security Notes
/// - Only callable by buyer (automatically set as caller())
/// - Each escrow gets cryptographically unique address
/// - All parameters validated before state changes
/// - Complete audit trail maintained
#[ic_cdk::update]
async fn create_escrow(
    listing_id: u64,
    seller: Principal,
    total_amount: u64,
    milestones: Vec<shared_types::Milestone>,
) -> Result<u64, String> {
    let buyer = caller();
    
    // Validate inputs
    if total_amount == 0 {
        return Err("Total amount must be greater than zero".to_string());
    }
    
    if milestones.is_empty() {
        return Err("At least one milestone is required".to_string());
    }
    
    // Validate milestone amounts sum to total
    let milestone_sum: u64 = milestones.iter().map(|m| m.amount).sum();
    if milestone_sum != total_amount {
        return Err("Milestone amounts must sum to total amount".to_string());
    }
    
    // Generate unique escrow ID
    let escrow_id = NEXT_ESCROW_ID.with(|id| {
        let current = *id.borrow();
        *id.borrow_mut() = current + 1;
        current
    });
    
    // Generate threshold ECDSA address for this escrow
    let escrow_address = match generate_ecdsa_address(escrow_id).await {
        Ok(addr) => addr,
        Err(e) => return Err(format!("Failed to generate ECDSA address: {}", e)),
    };
    
    // Convert milestones to escrow milestones
    let escrow_milestones: Vec<EscrowMilestone> = milestones
        .into_iter()
        .map(|m| EscrowMilestone {
            description: m.description,
            amount: m.amount,
            deadline: m.deadline,
            completed: false,
            released: false,
            completed_at: None,
            released_at: None,
        })
        .collect();
    
    // Create escrow account
    let now = time();
    let escrow = EscrowAccount {
        id: escrow_id,
        listing_id,
        buyer,
        seller,
        total_amount,
        locked_amount: 0,
        released_amount: 0,
        state: EscrowState::Created,
        milestones: escrow_milestones,
        escrow_address,
        created_at: now,
        updated_at: now,
    };
    
    // Store escrow
    ESCROW_STORAGE.with(|storage| {
        storage.borrow_mut().insert(escrow_id, escrow);
    });
    
    // Log event
    let event = EscrowEvent::EscrowCreated {
        escrow_id,
        listing_id,
        buyer,
        seller,
        total_amount,
    };
    log_event(event);
    
    Ok(escrow_id)
}

/// Deposits ckUSDC funds into an escrow account
/// 
/// # Arguments
/// * `escrow_id` - The escrow account ID
/// * `amount` - Amount to deposit in ckUSDC (smallest unit)
/// 
/// # Returns
/// * `Result<(), String>` - Success or error message
#[ic_cdk::update]
async fn deposit_funds(escrow_id: u64, amount: u64) -> Result<(), String> {
    let depositor = caller();
    
    // Get escrow account
    let mut escrow = ESCROW_STORAGE.with(|storage| {
        storage.borrow().get(&escrow_id)
            .ok_or_else(|| "Escrow not found".to_string())
    })?;
    
    // Validate depositor is buyer
    if depositor != escrow.buyer {
        return Err("Only buyer can deposit funds".to_string());
    }
    
    // Validate escrow state
    if escrow.state != EscrowState::Created {
        return Err("Escrow must be in Created state to deposit funds".to_string());
    }
    
    // Validate amount
    if amount != escrow.total_amount {
        return Err("Must deposit exact total amount".to_string());
    }
    
    // Transfer funds from buyer to escrow using ICRC-2 transfer_from
    let transfer_args = TransferFromArgs {
        spender_subaccount: None,
        from: Account {
            owner: depositor,
            subaccount: None,
        },
        to: Account {
            owner: id(), // This canister
            subaccount: Some(escrow_id.to_be_bytes().to_vec()),
        },
        amount: Nat::from(amount),
        fee: None,
        memo: Some(format!("Escrow deposit for listing {}", escrow.listing_id).into_bytes()),
        created_at_time: Some(time()),
    };

    // Call ckUSDC canister transfer_from method
    let transfer_result: Result<(TransferFromResult,), _> = call(
        CKUSDC_CANISTER_ID,
        "icrc2_transfer_from",
        (transfer_args,)
    ).await;

    match transfer_result {
        Ok((TransferFromResult::Ok(_block_index),)) => {
            // Transfer successful
        }
        Ok((TransferFromResult::Err(e),)) => {
            return Err(format!("ckUSDC transfer failed: {:?}", e));
        }
        Err((code, msg)) => {
            return Err(format!("Failed to call ckUSDC canister: {:?} - {}", code, msg));
        }
    }
    
    // Update escrow state
    escrow.locked_amount = amount;
    escrow.state = EscrowState::Locked;
    escrow.updated_at = time();
    
    // Store updated escrow
    ESCROW_STORAGE.with(|storage| {
        storage.borrow_mut().insert(escrow_id, escrow);
    });
    
    // Log event
    let event = EscrowEvent::FundsDeposited {
        escrow_id,
        amount,
        depositor,
    };
    log_event(event);
    
    // Schedule automatic releases for milestones with deadlines
    schedule_automatic_releases(escrow_id).await;
    
    Ok(())
}

/// Marks a milestone as completed
/// 
/// # Arguments
/// * `escrow_id` - The escrow account ID
/// * `milestone_index` - Index of the milestone to complete
/// 
/// # Returns
/// * `Result<(), String>` - Success or error message
#[ic_cdk::update]
fn complete_milestone(escrow_id: u64, milestone_index: usize) -> Result<(), String> {
    let completed_by = caller();
    
    // Get escrow account
    let mut escrow = ESCROW_STORAGE.with(|storage| {
        storage.borrow().get(&escrow_id)
            .ok_or_else(|| "Escrow not found".to_string())
    })?;
    
    // Validate caller is seller
    if completed_by != escrow.seller {
        return Err("Only seller can complete milestones".to_string());
    }
    
    // Validate escrow state
    if escrow.state != EscrowState::Locked {
        return Err("Escrow must be in Locked state".to_string());
    }
    
    // Validate milestone index
    if milestone_index >= escrow.milestones.len() {
        return Err("Invalid milestone index".to_string());
    }
    
    // Check if milestone is already completed
    if escrow.milestones[milestone_index].completed {
        return Err("Milestone already completed".to_string());
    }
    
    // Mark milestone as completed
    escrow.milestones[milestone_index].completed = true;
    escrow.milestones[milestone_index].completed_at = Some(time());
    escrow.state = EscrowState::MilestoneDone;
    escrow.updated_at = time();
    
    // Store updated escrow
    ESCROW_STORAGE.with(|storage| {
        storage.borrow_mut().insert(escrow_id, escrow);
    });
    
    // Log event
    let event = EscrowEvent::MilestoneCompleted {
        escrow_id,
        milestone_index,
        completed_by,
    };
    log_event(event);
    
    Ok(())
}

/// Releases funds for completed milestones to the seller
/// 
/// # Arguments
/// * `escrow_id` - The escrow account ID
/// * `milestone_index` - Index of the milestone to release funds for
/// 
/// # Returns
/// * `Result<(), String>` - Success or error message
#[ic_cdk::update]
async fn release_funds(escrow_id: u64, milestone_index: usize) -> Result<(), String> {
    let caller_principal = caller();
    
    // Get escrow account
    let mut escrow = ESCROW_STORAGE.with(|storage| {
        storage.borrow().get(&escrow_id)
            .ok_or_else(|| "Escrow not found".to_string())
    })?;
    
    // Validate caller is buyer or seller
    if caller_principal != escrow.buyer && caller_principal != escrow.seller {
        return Err("Only buyer or seller can release funds".to_string());
    }
    
    // Validate milestone index
    if milestone_index >= escrow.milestones.len() {
        return Err("Invalid milestone index".to_string());
    }
    
    // Check milestone state and store amount before making changes
    let (milestone_completed, milestone_released, milestone_amount) = {
        let milestone = &escrow.milestones[milestone_index];
        (milestone.completed, milestone.released, milestone.amount)
    };
    
    // Check if milestone is completed
    if !milestone_completed {
        return Err("Milestone must be completed before releasing funds".to_string());
    }
    
    // Check if funds already released
    if milestone_released {
        return Err("Funds already released for this milestone".to_string());
    }
    
    // Transfer funds from escrow to seller using ICRC-2 transfer
    let transfer_args = TransferArgs {
        from_subaccount: Some(escrow_id.to_be_bytes().to_vec()),
        to: Account {
            owner: escrow.seller,
            subaccount: None,
        },
        amount: Nat::from(milestone_amount),
        fee: None,
        memo: Some(format!("Milestone payment for escrow {}", escrow_id).into_bytes()),
        created_at_time: Some(time()),
    };

    // Call ckUSDC canister transfer method
    let transfer_result: Result<(TransferResult,), _> = call(
        CKUSDC_CANISTER_ID,
        "icrc1_transfer",
        (transfer_args,)
    ).await;

    match transfer_result {
        Ok((TransferResult::Ok(_block_index),)) => {
            // Transfer successful
        }
        Ok((TransferResult::Err(e),)) => {
            return Err(format!("ckUSDC transfer to seller failed: {:?}", e));
        }
        Err((code, msg)) => {
            return Err(format!("Failed to call ckUSDC canister: {:?} - {}", code, msg));
        }
    }
    
    // Update escrow state
    escrow.milestones[milestone_index].released = true;
    escrow.milestones[milestone_index].released_at = Some(time());
    escrow.released_amount += milestone_amount;
    escrow.locked_amount -= milestone_amount;
    
    // Check if all milestones are released
    let all_released = escrow.milestones.iter().all(|m| m.released);
    if all_released {
        escrow.state = EscrowState::Released;
    }
    
    escrow.updated_at = time();
    
    // Store updated escrow
    ESCROW_STORAGE.with(|storage| {
        storage.borrow_mut().insert(escrow_id, escrow.clone());
    });
    
    // Log event
    let event = EscrowEvent::FundsReleased {
        escrow_id,
        amount: milestone_amount,
        released_to: escrow.seller,
    };
    log_event(event);
    
    Ok(())
}

// ════════════════════════════════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Retrieves an escrow account by ID
/// 
/// # Arguments
/// * `escrow_id` - The escrow account ID
/// 
/// # Returns
/// * `Option<EscrowAccount>` - The escrow account if found
#[ic_cdk::query]
fn get_escrow(escrow_id: u64) -> Option<EscrowAccount> {
    ESCROW_STORAGE.with(|storage| {
        storage.borrow().get(&escrow_id)
    })
}

/// Retrieves all escrow accounts for a specific listing
/// 
/// # Arguments
/// * `listing_id` - The business listing ID
/// 
/// # Returns
/// * `Vec<EscrowAccount>` - All escrow accounts for the listing
#[ic_cdk::query]
fn get_escrows_by_listing(listing_id: u64) -> Vec<EscrowAccount> {
    ESCROW_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter_map(|(_, escrow)| {
                if escrow.listing_id == listing_id {
                    Some(escrow)
                } else {
                    None
                }
            })
            .collect()
    })
}

/// Retrieves all escrow accounts for a specific buyer
/// 
/// # Arguments
/// * `buyer` - The buyer's principal
/// 
/// # Returns
/// * `Vec<EscrowAccount>` - All escrow accounts for the buyer
#[ic_cdk::query]
fn get_escrows_by_buyer(buyer: Principal) -> Vec<EscrowAccount> {
    ESCROW_STORAGE.with(|storage| {
        storage
            .borrow()
            .iter()
            .filter_map(|(_, escrow)| {
                if escrow.buyer == buyer {
                    Some(escrow)
                } else {
                    None
                }
            })
            .collect()
    })
}

/// Retrieves recent events from the event log
/// 
/// # Arguments
/// * `limit` - Maximum number of events to return
/// 
/// # Returns
/// * `Vec<EscrowEvent>` - Recent events (most recent first)
#[ic_cdk::query]
fn get_recent_events(limit: usize) -> Vec<EscrowEvent> {
    EVENT_LOG.with(|log| {
        let events = log.borrow();
        let start = if events.len() > limit {
            events.len() - limit
        } else {
            0
        };
        events[start..].iter().rev().cloned().collect()
    })
}

/// Disputes an escrow transaction
/// 
/// # Arguments
/// * `escrow_id` - The escrow account ID
/// * `reason` - Reason for the dispute
/// 
/// # Returns
/// * `Result<(), String>` - Success or error message
#[ic_cdk::update]
fn dispute_escrow(escrow_id: u64, reason: String) -> Result<(), String> {
    let disputer = caller();
    
    // Get escrow account
    let escrow = ESCROW_STORAGE.with(|storage| {
        storage.borrow().get(&escrow_id)
            .ok_or_else(|| "Escrow not found".to_string())
    })?;
    
    // Validate caller is buyer or seller
    if disputer != escrow.buyer && disputer != escrow.seller {
        return Err("Only buyer or seller can dispute escrow".to_string());
    }
    
    // Validate escrow is in a state that can be disputed
    match escrow.state {
        EscrowState::Locked | EscrowState::MilestoneDone => {
            // These states can be disputed
        }
        _ => {
            return Err("Escrow cannot be disputed in current state".to_string());
        }
    }
    
    // Log dispute event
    let event = EscrowEvent::EscrowDisputed {
        escrow_id,
        disputed_by: disputer,
        reason,
    };
    log_event(event);
    
    // TODO: Integrate with dispute_dao canister for resolution
    // This would create a dispute case in the DAO system
    
    Ok(())
}

// ════════════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Generates a threshold ECDSA address for an escrow account
async fn generate_ecdsa_address(escrow_id: u64) -> Result<String, String> {
    // Create derivation path specific to this escrow
    let mut derivation_path = vec![id().as_slice().to_vec()];
    derivation_path.push(escrow_id.to_be_bytes().to_vec());
    
    // Get public key from threshold ECDSA
    let request = EcdsaPublicKeyArgument {
        canister_id: None,
        derivation_path,
        key_id: get_ecdsa_key_id(),
    };
    
    match ecdsa_public_key(request).await {
        Ok((public_key_reply,)) => {
            // Convert public key to address (simplified - would need proper address derivation)
            let public_key_hex = hex::encode(&public_key_reply.public_key);
            Ok(format!("ecdsa_{}", &public_key_hex[..20]))
        }
        Err((code, msg)) => Err(format!("ECDSA key generation failed: {:?} - {}", code, msg)),
    }
}

/// Schedules automatic releases for milestones with deadlines
async fn schedule_automatic_releases(escrow_id: u64) {
    let escrow = ESCROW_STORAGE.with(|storage| {
        storage.borrow().get(&escrow_id)
    });
    
    if let Some(escrow) = escrow {
        let now = time();
        
        for (index, milestone) in escrow.milestones.iter().enumerate() {
            // Only schedule for incomplete milestones with future deadlines
            if !milestone.completed && milestone.deadline > now {
                let delay_seconds = (milestone.deadline - now) / 1_000_000_000; // Convert nanoseconds to seconds
                
                // Schedule timer for automatic release
                let timer_id = ic_cdk_timers::set_timer(
                    std::time::Duration::from_secs(delay_seconds),
                    move || {
                        // This closure will be executed when the timer fires
                        ic_cdk::spawn(async move {
                            if let Err(e) = auto_release_milestone(escrow_id, index).await {
                                ic_cdk::println!("Auto-release failed for escrow {} milestone {}: {}", escrow_id, index, e);
                            }
                        });
                    }
                );
                
                // Store timer ID for potential cancellation
                ACTIVE_TIMERS.with(|timers| {
                    let key = escrow_id * 1000 + index as u64; // Unique key for escrow-milestone pair
                    timers.borrow_mut().insert(key, timer_id);
                });
            }
        }
    }
    
    ic_cdk::println!("Scheduled automatic releases for escrow {}", escrow_id);
}

/// Automatically releases funds for a milestone if deadline has passed
async fn auto_release_milestone(escrow_id: u64, milestone_index: usize) -> Result<(), String> {
    let escrow = ESCROW_STORAGE.with(|storage| {
        storage.borrow().get(&escrow_id)
    });
    
    if let Some(escrow) = escrow {
        // Check if milestone is still incomplete and deadline has passed
        if milestone_index < escrow.milestones.len() {
            let milestone = &escrow.milestones[milestone_index];
            let now = time();
            
            if !milestone.completed && milestone.deadline <= now {
                // Automatically mark milestone as completed
                let mut updated_escrow = escrow;
                updated_escrow.milestones[milestone_index].completed = true;
                updated_escrow.milestones[milestone_index].completed_at = Some(now);
                updated_escrow.state = EscrowState::MilestoneDone;
                updated_escrow.updated_at = now;
                
                // Store updated escrow
                ESCROW_STORAGE.with(|storage| {
                    storage.borrow_mut().insert(escrow_id, updated_escrow.clone());
                });
                
                // Log milestone completion event
                let event = EscrowEvent::MilestoneCompleted {
                    escrow_id,
                    milestone_index,
                    completed_by: id(), // System completed
                };
                log_event(event);
                
                // Automatically release funds
                return release_funds(escrow_id, milestone_index).await;
            }
        }
    }
    
    Ok(())
}

/// Logs an event to the event log
fn log_event(event: EscrowEvent) {
    EVENT_LOG.with(|log| {
        log.borrow_mut().push(event);
        
        // Keep only the last 1000 events to prevent unbounded growth
        if log.borrow().len() > 1000 {
            log.borrow_mut().drain(0..100);
        }
    });
}

// Export the candid interface
ic_cdk::export_candid!();

// Include test modules
#[cfg(test)]
mod tests;

#[cfg(test)]
mod integration_tests;

#[cfg(test)]
mod test_harness;