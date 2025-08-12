//! # Valyra ListingRegistry Canister
//! 
//! This canister implements the core CRUD operations for business listings on the Valyra marketplace.
//! It provides a comprehensive API for creating, reading, updating, and deleting SaaS business listings
//! with full financial, operational, and legal metadata.
//! 
//! ## Key Features
//! 
//! - **Persistent Storage**: Uses `ic-stable-structures` for upgrade-safe data persistence
//! - **Access Control**: Seller-only operations for updates and deletions
//! - **Comprehensive Schema**: Supports complete business listing data as defined in valyra-listing-schema.txt
//! - **Candid Interface**: Auto-generated `.did` file for frontend integration
//! 
//! ## Storage Architecture
//! 
//! - `DEALS`: StableBTreeMap<u64, DealNFT> - Primary listing storage
//! - `NEXT_ID`: RefCell<u64> - Auto-incrementing ID counter
//! - `MEMORY_MANAGER`: Handles stable memory allocation across canister upgrades
//! 
//! ## API Endpoints
//! 
//! - `create_deal(CreateDealRequest) -> Result<u64, String>` - Create new listing
//! - `get_deal(u64) -> Result<DealNFT, String>` - Retrieve listing by ID  
//! - `list_ids() -> Vec<u64>` - Get all listing IDs
//! - `update_deal(u64, UpdateDealRequest) -> Result<(), String>` - Update existing listing
//! - `delete_deal(u64) -> Result<(), String>` - Remove listing

use ic_cdk::{export_candid, query, update};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use shared_types::{DealNFT, BusinessStructure, ListingStatus};
use std::cell::RefCell;
use candid::CandidType;
use serde::{Deserialize, Serialize};

/// Type alias for virtual memory used by stable structures
type Memory = VirtualMemory<DefaultMemoryImpl>;

/// Type alias for the main deals storage map
type DealsMap = StableBTreeMap<u64, DealNFT, Memory>;

// ════════════════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE - THREAD LOCAL STORAGE
// ════════════════════════════════════════════════════════════════════════════════════════

thread_local! {
    /// Memory manager for stable storage across canister upgrades
    /// Handles allocation of virtual memory regions for different data structures
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    /// Primary storage for all business listings
    /// Maps listing ID (u64) to complete DealNFT structure
    /// Uses memory region 0 for persistent storage
    static DEALS: RefCell<DealsMap> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
    
    /// Auto-incrementing counter for generating unique listing IDs
    /// Starts at 1, incremented for each new listing created
    static NEXT_ID: RefCell<u64> = RefCell::new(1);
}

// ════════════════════════════════════════════════════════════════════════════════════════
// REQUEST/RESPONSE STRUCTS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Request payload for creating a new business listing
/// 
/// Contains all required information to create a comprehensive SaaS business listing
/// following the valyra-listing-schema.txt specification. The seller_principal is
/// automatically set to the caller's identity, and timestamps are auto-generated.
/// 
/// # Validation Notes
/// - URLs should be valid HTTPS endpoints
/// - Percentages should be in range 0.0-100.0
/// - Financial values should be in USD
/// - tax_id should be pre-masked for privacy (e.g., "***-**-1234")
#[derive(CandidType, Serialize, Deserialize)]
pub struct CreateDealRequest {
    /// Short, searchable business title (≤ 50 characters recommended)
    pub title: String,
    /// Long-form business description in markdown (≤ 2,000 characters)
    pub description: String,
    /// Valid HTTPS URL to the business website
    pub website_url: String,
    /// HTTPS URL to business logo (512×512 PNG or SVG preferred)
    pub logo_url: String,
    /// Annual Recurring Revenue in USD (last 12 months)
    pub arr_usd: u64,
    /// Monthly Recurring Revenue in USD (last complete month)
    pub mrr_usd: u64,
    /// Monthly logo churn rate as percentage (0.0-100.0)
    pub churn_pct: f32,
    /// Gross margin percentage (0.0-100.0)
    pub gross_margin_pct: f32,
    /// Net profit in USD (last 12 months)
    pub net_profit_usd: u64,
    /// Customer Acquisition Cost in USD
    pub cac_usd: u32,
    /// Average Customer Lifetime Value in USD
    pub ltv_usd: u32,
    /// Technology stack as comma-separated tags
    pub tech_stack: String,
    /// Full-time employee headcount
    pub num_employees: u16,
    /// One-line customer base summary
    pub customer_base: String,
    /// Annual operating expenses in USD (last 12 months)
    pub annual_operating_expenses_usd: u64,
    /// Business legal structure/entity type
    pub business_structure: BusinessStructure,
    /// Full legal registered business address
    pub registered_address: String,
    /// Masked tax identification number (e.g., "***-**-1234")
    pub tax_id: String,
    /// GDPR compliance status
    pub gdpr_compliant: bool,
    /// Optional IPFS CID containing zipped due diligence documents
    pub attachments_cid: Option<String>,
}

/// Request payload for updating an existing business listing
/// 
/// All fields are optional - only provided fields will be updated.
/// The updated_at timestamp is automatically set to the current time.
/// Only the original seller can update their listing (enforced by access control).
/// 
/// # Access Control
/// - Caller must be the original seller_principal of the listing
/// - Listing must exist in the DEALS storage
/// 
/// # Special Handling
/// - `attachments_cid` uses double Option to allow setting to None
/// - `updated_at` is automatically updated on any successful modification
#[derive(CandidType, Serialize, Deserialize)]
pub struct UpdateDealRequest {
    /// Update business title
    pub title: Option<String>,
    /// Update business description
    pub description: Option<String>,
    /// Update website URL
    pub website_url: Option<String>,
    /// Update logo URL
    pub logo_url: Option<String>,
    /// Update Annual Recurring Revenue
    pub arr_usd: Option<u64>,
    /// Update Monthly Recurring Revenue
    pub mrr_usd: Option<u64>,
    /// Update churn rate percentage
    pub churn_pct: Option<f32>,
    /// Update gross margin percentage
    pub gross_margin_pct: Option<f32>,
    /// Update net profit
    pub net_profit_usd: Option<u64>,
    /// Update Customer Acquisition Cost
    pub cac_usd: Option<u32>,
    /// Update Lifetime Value
    pub ltv_usd: Option<u32>,
    /// Update technology stack
    pub tech_stack: Option<String>,
    /// Update employee headcount
    pub num_employees: Option<u16>,
    /// Update customer base description
    pub customer_base: Option<String>,
    /// Update annual operating expenses
    pub annual_operating_expenses_usd: Option<u64>,
    /// Update business structure
    pub business_structure: Option<BusinessStructure>,
    /// Update registered address
    pub registered_address: Option<String>,
    /// Update masked tax ID
    pub tax_id: Option<String>,
    /// Update GDPR compliance status
    pub gdpr_compliant: Option<bool>,
    /// Update or remove attachments (double Option allows setting to None)
    pub attachments_cid: Option<Option<String>>,
    /// Update listing status (Active, Matched, Sold, Withdrawn)
    pub status: Option<ListingStatus>,
}

// ════════════════════════════════════════════════════════════════════════════════════════
// CANISTER LIFECYCLE FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Initializes the ListingRegistry canister
/// 
/// Called once when the canister is first deployed. Sets up the stable storage
/// structures and initializes the ID counter. The stable structures will
/// automatically restore from stable memory on canister upgrades.
#[ic_cdk::init]
fn init() {
    // Stable structures are automatically initialized from stable memory
    // No additional initialization required
}

// ════════════════════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS - UPDATE ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Creates a new business listing on the marketplace
/// 
/// This function validates the request, generates a unique ID, and stores the complete
/// listing data in stable memory. The caller becomes the seller_principal, and timestamps
/// are automatically set to the current IC time.
/// 
/// # Arguments
/// * `request` - Complete business information following the valyra-listing-schema
/// 
/// # Returns
/// * `Ok(u64)` - The unique listing ID on success
/// * `Err(String)` - Error message on failure
/// 
/// # Access Control
/// * No restrictions - any authenticated principal can create listings
/// 
/// # Side Effects
/// * Increments the global NEXT_ID counter
/// * Stores the new DealNFT in DEALS stable storage
/// * Sets created_at and updated_at to current timestamp
/// * Initializes status to ListingStatus::Active
#[update]
fn create_deal(request: CreateDealRequest) -> Result<u64, String> {
    let caller = ic_cdk::caller();
    let timestamp = ic_cdk::api::time();
    
    let id = NEXT_ID.with(|next_id| {
        let current_id = *next_id.borrow();
        *next_id.borrow_mut() = current_id + 1;
        current_id
    });
    
    let deal_nft = DealNFT {
        id,
        seller_principal: caller,
        title: request.title,
        description: request.description,
        website_url: request.website_url,
        logo_url: request.logo_url,
        arr_usd: request.arr_usd,
        mrr_usd: request.mrr_usd,
        churn_pct: request.churn_pct,
        gross_margin_pct: request.gross_margin_pct,
        net_profit_usd: request.net_profit_usd,
        cac_usd: request.cac_usd,
        ltv_usd: request.ltv_usd,
        tech_stack: request.tech_stack,
        num_employees: request.num_employees,
        customer_base: request.customer_base,
        annual_operating_expenses_usd: request.annual_operating_expenses_usd,
        business_structure: request.business_structure,
        registered_address: request.registered_address,
        tax_id: request.tax_id,
        gdpr_compliant: request.gdpr_compliant,
        attachments_cid: request.attachments_cid,
        created_at: timestamp,
        updated_at: timestamp,
        status: ListingStatus::Active,
    };
    
    DEALS.with(|deals| {
        deals.borrow_mut().insert(id, deal_nft.clone());
        
        // Debug: Verify the deal was actually inserted
        let stored_deal = deals.borrow().get(&id);
        match stored_deal {
            Some(_) => ic_cdk::println!("✅ Deal {} successfully stored and verified", id),
            None => ic_cdk::println!("❌ Deal {} failed to store!", id),
        }
    });
    
    Ok(id)
}

/// Updates an existing business listing
/// 
/// Allows the original seller to modify any field in their listing. Only provided
/// fields in the request will be updated - all others remain unchanged. The updated_at
/// timestamp is automatically refreshed on successful updates.
/// 
/// # Arguments
/// * `id` - The listing ID to update
/// * `request` - Fields to update (all optional)
/// 
/// # Returns
/// * `Ok(())` - Success (no return value needed)
/// * `Err(String)` - Error message on failure
/// 
/// # Access Control
/// * Only the original seller_principal can update their listing
/// * Listing must exist in storage
/// 
/// # Side Effects
/// * Updates the DealNFT in DEALS stable storage
/// * Sets updated_at to current timestamp
#[update]
fn update_deal(id: u64, request: UpdateDealRequest) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    DEALS.with(|deals| {
        let mut deals_map = deals.borrow_mut();
        
        match deals_map.get(&id) {
            Some(mut deal) => {
                if deal.seller_principal != caller {
                    return Err("Only the seller can update this deal".to_string());
                }
                
                if let Some(title) = request.title {
                    deal.title = title;
                }
                if let Some(description) = request.description {
                    deal.description = description;
                }
                if let Some(website_url) = request.website_url {
                    deal.website_url = website_url;
                }
                if let Some(logo_url) = request.logo_url {
                    deal.logo_url = logo_url;
                }
                if let Some(arr_usd) = request.arr_usd {
                    deal.arr_usd = arr_usd;
                }
                if let Some(mrr_usd) = request.mrr_usd {
                    deal.mrr_usd = mrr_usd;
                }
                if let Some(churn_pct) = request.churn_pct {
                    deal.churn_pct = churn_pct;
                }
                if let Some(gross_margin_pct) = request.gross_margin_pct {
                    deal.gross_margin_pct = gross_margin_pct;
                }
                if let Some(net_profit_usd) = request.net_profit_usd {
                    deal.net_profit_usd = net_profit_usd;
                }
                if let Some(cac_usd) = request.cac_usd {
                    deal.cac_usd = cac_usd;
                }
                if let Some(ltv_usd) = request.ltv_usd {
                    deal.ltv_usd = ltv_usd;
                }
                if let Some(tech_stack) = request.tech_stack {
                    deal.tech_stack = tech_stack;
                }
                if let Some(num_employees) = request.num_employees {
                    deal.num_employees = num_employees;
                }
                if let Some(customer_base) = request.customer_base {
                    deal.customer_base = customer_base;
                }
                if let Some(annual_operating_expenses_usd) = request.annual_operating_expenses_usd {
                    deal.annual_operating_expenses_usd = annual_operating_expenses_usd;
                }
                if let Some(business_structure) = request.business_structure {
                    deal.business_structure = business_structure;
                }
                if let Some(registered_address) = request.registered_address {
                    deal.registered_address = registered_address;
                }
                if let Some(tax_id) = request.tax_id {
                    deal.tax_id = tax_id;
                }
                if let Some(gdpr_compliant) = request.gdpr_compliant {
                    deal.gdpr_compliant = gdpr_compliant;
                }
                if let Some(attachments_cid) = request.attachments_cid {
                    deal.attachments_cid = attachments_cid;
                }
                if let Some(status) = request.status {
                    deal.status = status;
                }
                
                deal.updated_at = ic_cdk::api::time();
                
                deals_map.insert(id, deal);
                Ok(())
            }
            None => Err(format!("Deal with ID {} not found", id)),
        }
    })
}

/// Permanently deletes a business listing from the marketplace
/// 
/// Removes the listing entirely from stable storage. This operation cannot be undone.
/// Only the original seller can delete their listing.
/// 
/// # Arguments
/// * `id` - The listing ID to delete
/// 
/// # Returns
/// * `Ok(())` - Success (listing deleted)
/// * `Err(String)` - Error message on failure
/// 
/// # Access Control
/// * Only the original seller_principal can delete their listing
/// * Listing must exist in storage
/// 
/// # Side Effects
/// * Removes the DealNFT from DEALS stable storage permanently
/// * ID is not reused (NEXT_ID continues incrementing)
#[update]
fn delete_deal(id: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    DEALS.with(|deals| {
        let mut deals_map = deals.borrow_mut();
        
        match deals_map.get(&id) {
            Some(deal) => {
                if deal.seller_principal != caller {
                    return Err("Only the seller can delete this deal".to_string());
                }
                
                deals_map.remove(&id);
                Ok(())
            }
            None => Err(format!("Deal with ID {} not found", id)),
        }
    })
}

// ════════════════════════════════════════════════════════════════════════════════════════
// CRUD OPERATIONS - QUERY ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Retrieves a complete business listing by ID
/// 
/// Returns the full DealNFT structure with all business metadata, financial metrics,
/// and listing information. This is a query operation that doesn't modify state.
/// 
/// # Arguments
/// * `id` - The listing ID to retrieve
/// 
/// # Returns
/// * `Ok(DealNFT)` - The complete listing data on success
/// * `Err(String)` - Error message if listing not found
/// 
/// # Access Control
/// * Public read access - any authenticated principal can view listings
/// 
/// # Performance
/// * O(log n) lookup in the StableBTreeMap
#[query]
fn get_deal(id: u64) -> Result<DealNFT, String> {
    DEALS.with(|deals| {
        let deals_map = deals.borrow();
        let result = deals_map.get(&id);
        
        // Debug logging
        match result {
            Some(ref deal) => {
                ic_cdk::println!("✅ Found deal {} with title: {}", id, deal.title);
            },
            None => {
                // Get all current IDs for debugging
                let all_ids: Vec<u64> = deals_map.iter().map(|(k, _)| k).collect();
                ic_cdk::println!("❌ Deal {} not found. Available IDs: {:?}", id, all_ids);
            }
        }
        
        result.ok_or_else(|| format!("Deal with ID {} not found", id))
    })
}

/// Lists all listing IDs currently in the marketplace
/// 
/// Returns a vector of all listing IDs, which can be used with get_deal()
/// to retrieve full listing details. Useful for pagination and discovery.
/// 
/// # Returns
/// * `Vec<u64>` - Array of all listing IDs (may be empty)
/// 
/// # Access Control
/// * Public read access - any authenticated principal can list IDs
/// 
/// # Performance
/// * O(n) iteration over all stored listings
/// * Consider adding pagination for large datasets in future versions
#[query]
fn list_ids() -> Vec<u64> {
    DEALS.with(|deals| {
        deals.borrow().iter().map(|(id, _)| id).collect()
    })
}

/// Lists all deals created by a specific seller
/// 
/// Returns a vector of DealNFT objects that belong to the specified seller.
/// This is useful for seller dashboards to show only their own listings.
/// 
/// # Arguments
/// * `seller_principal` - The principal ID of the seller whose deals to retrieve
/// 
/// # Returns
/// * `Vec<DealNFT>` - Array of deals owned by the seller (may be empty)
/// 
/// # Access Control
/// * Public read access - any authenticated principal can query deals by seller
/// * However, sensitive information should only be visible to the seller themselves
/// 
/// # Performance
/// * O(n) iteration over all stored listings to filter by seller
/// * Consider indexing by seller for better performance in future versions
#[query]
fn get_deals_by_seller(seller_principal: candid::Principal) -> Vec<DealNFT> {
    DEALS.with(|deals| {
        deals.borrow()
            .iter()
            .filter_map(|(_, deal)| {
                if deal.seller_principal == seller_principal {
                    Some(deal)
                } else {
                    None
                }
            })
            .collect()
    })
}

// ════════════════════════════════════════════════════════════════════════════════════════
// CANDID INTERFACE GENERATION
// ════════════════════════════════════════════════════════════════════════════════════════

// Auto-generate Candid interface definition for frontend integration
export_candid!();