# Technical Design Document: Valyra

**Author:** alhadad
**Date:** December 11, 2025
**Version:** 2.4 (Hackathon MVP - Final Refinements)

---

## Product Overview

### Purpose

**Valyra** is an autonomous marketplace designed to solve the illiquidity of micro-SaaS and digital assets in Indonesia. It replaces expensive human brokers with **Coinbase AgentKit (AI)** and **Base Smart Contracts**.

* **Problem:** Selling a $5,000 SaaS business is too small for brokers but too risky for P2P transfers.
* **Opportunity:** Leveraging Base L2's low fees and IDRX (Indonesian Rupiah Stablecoin) to create a frictionless, trustless exit mechanism for Indie Hackers.
* **Scenario:** A developer lists a chatbot startup. An AI Agent analyzes the codebase and revenue (with Build ID verification), suggests a price, and a buyer purchases it instantly using IDRX via an on-chain escrow with built-in dispute resolution and a 2.5% platform fee.

### Target Audience

1. **Indie Hackers (Sellers):** Need quick liquidity without legal complexity.
2. **Micro-PE Investors (Buyers):** Seeking cash-flowing assets; rely on AI for due diligence.
3. **Autonomous Agents:** Future-proofing for AI agents that own wallets and buy resources/companies autonomously.

### Expected Outcomes

* **Short-term:** A functional MVP deployed on Base Mainnet allowing listing, depositing IDRX, secure credential handover, and dispute resolution.
* **Long-term:** Establishing a standard protocol for "Asset Tokenization" of real-world business equity.
* **Success Metrics:**
    * Contract Execution Cost: < $0.05 (Base L2).
    * Transaction Speed: < 2 seconds (Finality).
    * Agent Success: 100% automated valuation generation without human intervention.
    * Dispute Rate: < 5% of completed transactions.
    * Platform Revenue: 2.5% fee on successful transactions.

---

## Design Details

### Architectural Overview

Valyra utilizes a **Hybrid Web3 Architecture**. The heavy logic (valuation/negotiation) happens off-chain via AI, while the settlement (money/ownership) happens on-chain.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER (Browser)                                │
│                    Coinbase Wallet / MetaMask / Smart Wallet            │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js + OnchainKit)                    │
│  • Wallet Connection (Wagmi)     • Listing Interface                    │
│  • Basenames Integration         • IP Assignment Signing                │
│  • Escrow Status UI              • Agent Chat Interface (Token-Gated)   │
│  • Credential Vault Access       • Ephemeral Keypair Generator          │
│  • Dispute Filing UI             • USDC→IDRX Swap UI                    │
└───────────┬─────────────────────────────────────────┬───────────────────┘
            │                                         │
            ▼                                         ▼
┌───────────────────────────┐         ┌───────────────────────────────────┐
│  AI BACKEND (Python/FastAPI)│       │        BASE BLOCKCHAIN            │
│  • Coinbase AgentKit (CDP)  │       │  ┌─────────────────────────────┐  │
│  • Valuation Engine         │       │  │   Marketplace.sol           │  │
│  │ (Guardrails: max 10x ARR)│       │  │   • Listing Management      │  │
│  • Due Diligence Scanner    │       │  │   • IP Assignment Hash      │  │
│  • Build ID Verification    │       │  │   • Seller Registration     │  │
│  • Health Check CRON        │       │  └─────────────────────────────┘  │
│  • Zero-Storage OAuth       │       │  ┌─────────────────────────────┐  │
│  ┌────────────────────────┐ │       │  │   Escrow.sol                │  │
│  │ Agent Wallet (CDP)     │ │       │  │   • Fund Locking            │  │
│  │ Signs attestations     │ │       │  │   • Platform Fee (2.5%)     │  │
│  └────────────────────────┘ │       │  │   • Time-locked Release     │  │
└───────────────────────────┘         │  │   • Dispute Handling        │  │
            │                         │  └─────────────────────────────┘  │
            ▼                         │  ┌─────────────────────────────┐  │
┌───────────────────────────┐         │  │   SwapRouter.sol (Optional) │  │
│  CREDENTIAL VAULT         │         │  │   • USDC→IDRX via Uniswap   │  │
│  • Encrypted Storage      │         │  └─────────────────────────────┘  │
│  • ECIES + Fallback       │         │  ┌─────────────────────────────┐  │
│  • Buyer-only Decryption  │         │  │   Treasury (Multi-sig)      │  │
│  • Auto-purge (30 days)   │         │  │   • Platform fee recipient  │  │
└───────────────────────────┘         │  └─────────────────────────────┘  │
                                      │  ┌─────────────────────────────┐  │
                                      │  │   IDRX Token (ERC-20)       │  │
                                      │  └─────────────────────────────┘  │
                                      └───────────────────────────────────┘
```

**Components:**

1. **Frontend (Next.js):** The user interface for humans. Connects to Base via **OnchainKit**. Includes Basenames integration and ephemeral keypair fallback for Smart Wallets.
2. **AI Backend (Python/FastAPI):** Hosts the **Coinbase AgentKit**. This agent has its own CDP wallet to sign "Attestations" (verifying a business is real). Implements valuation guardrails, zero-storage OAuth, and **wallet signature verification** on all API requests.
3. **Smart Contracts (Solidity):** Deployed on Base using **UUPS Proxy Pattern** for upgradability. Handles the Escrow logic, IDRX transfers, platform fees, and dispute resolution.
4. **Credential Vault:** Encrypted off-chain storage with ECIES encryption + ephemeral keypair fallback using **IndexedDB** (XSS-resistant) and session-bound keys.
5. **Storage (Arweave/IPFS):** Stores non-financial data and **permanent code snapshots** on Arweave for guaranteed persistence.

---

### Smart Contract Architecture

#### Contract Structure

```
contracts/
├── proxy/
│   ├── MarketplaceProxy.sol  # UUPS Proxy for Marketplace
│   └── EscrowProxy.sol       # UUPS Proxy for Escrow
├── Marketplace.sol      # Listing management, IP assignment (upgradeable)
├── Escrow.sol           # Fund handling, fees, dispute resolution (upgradeable)
├── SwapRouter.sol       # USDC→IDRX swap integration (optional)
├── CredentialVault.sol  # On-chain credential hash verification
├── Reputation.sol       # Soulbound token reputation (Future)
└── interfaces/
    ├── IIDRX.sol        # IDRX token interface
    ├── IEscrow.sol      # Escrow interface for Marketplace
    └── ISwapRouter.sol  # Uniswap V3 router interface
```

#### Data Structures (Solidity)

**1. Listing Struct (with IP Assignment):**
```solidity
struct Listing {
    uint256 id;
    address seller;
    string title;
    string ipfsMetadata;          // IPFS hash for full description
    uint256 askingPrice;          // In IDRX (18 decimals)
    uint256 createdAt;
    VerificationLevel verificationLevel;
    ListingState state;
    // IP Assignment Fields (NEW)
    bytes32 ipAssignmentHash;     // Hash of IP assignment template
    bytes sellerSignature;        // Wallet signature of the hash
    uint256 ipSignedAt;           // Timestamp of signature
    // Build ID Verification (NEW)
    string buildId;               // Unique identifier linking live site to codebase
    bool buildIdVerified;         // Agent verified buildId matches repo commit
}

enum ListingState {
    ACTIVE,      // Available for purchase
    PENDING,     // Buyer has deposited, awaiting handover
    COMPLETED,   // Transaction successful
    CANCELLED,   // Seller cancelled
    DISPUTED,    // Under dispute
    PAUSED       // Health check failed (NEW)
}

enum VerificationLevel {
    BASIC,       // Email verification only
    STANDARD,    // DNS + Registrar verification
    ENHANCED     // OAuth revenue/analytics verified + Build ID matched
}
```

**2. Escrow Struct (with Fee Structure):**
```solidity
struct EscrowTransaction {
    uint256 listingId;
    address buyer;
    address seller;
    uint256 amount;               // IDRX amount (before fees)
    uint256 platformFee;          // 2.5% platform fee
    uint256 sellerPayout;         // amount - platformFee
    uint256 depositedAt;
    uint256 handoverDeadline;     // Seller must upload credentials by this time
    uint256 verifyDeadline;       // Buyer must confirm or dispute by this time
    bytes32 credentialHash;       // Hash of encrypted credentials
    EscrowState state;
    // Encryption method tracking
    EncryptionMethod encryptionMethod;
    // Earnest Money (NEW)
    uint256 earnestAmount;        // 5% earnest deposit (applied to total)
    bool earnestRefunded;         // Whether earnest was returned
    // Verification Extension (NEW)
    bool verifyExtensionUsed;     // One-time 24h extension used
}

enum EscrowState {
    CREATED,     // Escrow created, awaiting deposit
    FUNDED,      // Buyer deposited IDRX
    DELIVERED,   // Seller uploaded credentials
    CONFIRMED,   // Buyer confirmed receipt
    TRANSITION,  // NEW: Transition hold period (10% retained)
    DISPUTED,    // Dispute raised
    RESOLVED,    // Dispute resolved by arbitration
    COMPLETED,   // Funds fully released to seller
    REFUNDED,    // Funds returned to buyer
    EXPIRED,     // Timeouts triggered refund
    EMERGENCY    // NEW: Emergency eject triggered
}

enum EncryptionMethod {
    ECIES_WALLET,       // Standard ECIES with wallet public key
    EPHEMERAL_KEYPAIR   // Fallback for Smart Wallets (IndexedDB storage)
}
```

**3. Transition Hold Struct (NEW):**
```solidity
struct TransitionHold {
    uint256 escrowId;
    uint256 retainedAmount;       // 10% of seller payout
    uint256 releaseTime;          // 7 days after CONFIRMED
    bool isReleased;              // Whether retainer was released
    bool isClaimed;               // Whether seller claimed the retainer
    string assistanceNotes;       // Optional notes about transition help
}
```

**3. Dispute Struct:**
```solidity
struct Dispute {
    uint256 escrowId;
    address initiator;
    DisputeType disputeType;
    string evidenceIpfs;           // IPFS hash of ENCRYPTED evidence (v2.4: arbitrator-encrypted)
    string responseIpfs;           // Seller's counter-evidence (also arbitrator-encrypted)
    uint256 createdAt;
    uint256 responseDeadline;
    DisputeResolution resolution;
    address resolver;              // Admin who resolved (centralized for MVP)
}

enum DisputeType {
    CREDENTIAL_MISMATCH,  // Credentials don't work
    METRIC_FRAUD,         // Revenue/traffic was fake
    NON_DELIVERY,         // Seller didn't provide credentials
    QUALITY_DISPUTE       // Business not as described
}

enum DisputeResolution {
    PENDING,
    FULL_REFUND,
    PARTIAL_REFUND,
    RELEASE_TO_SELLER,
    SPLIT
}
```

> [!CAUTION]
> **Privacy Risk (v2.4):** Dispute evidence may contain sensitive screenshots (server logs, passwords, bank statements). IPFS is public. Evidence must be **encrypted with arbitrator's public key** before IPFS upload.

**4. Offer Struct (with Earnest Money - NEW):**
```solidity
struct Offer {
    uint256 listingId;
    address buyer;
    uint256 offerAmount;          // Full offer amount
    uint256 earnestAmount;        // 5% deposit locked
    uint256 createdAt;
    uint256 expiresAt;            // Seller must respond within 24h
    OfferState state;
}

enum OfferState {
    PENDING,     // Awaiting seller response
    ACCEPTED,    // Seller accepted, buyer must deposit full amount
    REJECTED,    // Seller rejected, earnest refunded
    EXPIRED,     // Seller didn't respond in 24h, earnest refunded
    CONVERTED    // Full deposit made, converted to escrow
}
```

**5. Seller Activity Struct (Heartbeat - NEW):**
```solidity
struct SellerActivity {
    address seller;
    uint256 lastHeartbeat;        // Last activity timestamp
    uint256 ignoredOffers;        // Count of ignored offers
    bool isActive;                // Whether seller is active
    bool isPaused;                // Auto-paused due to inactivity
}
```

**6. Seller Stake Struct (Anti-Burner Identity - NEW):**
```solidity
struct SellerStake {
    address seller;
    uint256 stakeAmount;          // ~$50 USD equivalent in IDRX
    uint256 stakedAt;
    bool isActive;                // Whether stake is active
    uint256 slashCount;           // Number of times slashed
}

uint256 public constant MINIMUM_SELLER_STAKE = 750_000 * 1e18;  // ~$50 in IDRX
uint256 public constant SLASH_PENALTY = 250_000 * 1e18;         // ~$17 per violation
uint256 public constant GENESIS_SELLER_LIMIT = 50;              // First 50 verified sellers

bool public genesisProgram = true;                              // Waive stake for early adopters
uint256 public genesisSellersCount = 0;                        // Counter for genesis sellers
```

#### Platform Fee Configuration

```solidity
// Escrow.sol
uint256 public constant PLATFORM_FEE_BPS = 250;  // 2.5% = 250 basis points
address public treasuryAddress;                   // Multi-sig treasury

function calculateFees(uint256 amount) public pure returns (uint256 fee, uint256 sellerPayout) {
    fee = (amount * PLATFORM_FEE_BPS) / 10000;
    sellerPayout = amount - fee;
}

function releaseFunds(uint256 escrowId) internal {
    EscrowTransaction storage escrow = escrows[escrowId];
    require(escrow.state == EscrowState.CONFIRMED, "Not confirmed");
    
    // Transfer to seller (97.5%)
    IDRX.transfer(escrow.seller, escrow.sellerPayout);
    
    // Transfer to treasury (2.5%)
    IDRX.transfer(treasuryAddress, escrow.platformFee);
    
    escrow.state = EscrowState.COMPLETED;
    emit FundsReleased(escrowId, escrow.seller, escrow.sellerPayout, escrow.platformFee);
}

// Treasury Timelock (NEW)
uint256 public constant TREASURY_TIMELOCK = 48 hours;
mapping(bytes32 => uint256) public pendingWithdrawals;  // hash => unlock time

function queueTreasuryWithdrawal(uint256 amount, address destination) external onlyTreasuryAdmin {
    bytes32 withdrawalHash = keccak256(abi.encode(amount, destination, block.timestamp));
    pendingWithdrawals[withdrawalHash] = block.timestamp + TREASURY_TIMELOCK;
    emit WithdrawalQueued(withdrawalHash, amount, destination, block.timestamp + TREASURY_TIMELOCK);
}

function executeTreasuryWithdrawal(uint256 amount, address destination, uint256 queuedAt) external onlyTreasuryAdmin {
    bytes32 withdrawalHash = keccak256(abi.encode(amount, destination, queuedAt));
    require(block.timestamp >= pendingWithdrawals[withdrawalHash], "Timelock not expired");
    require(pendingWithdrawals[withdrawalHash] != 0, "Withdrawal not queued");
    delete pendingWithdrawals[withdrawalHash];
    IDRX.transfer(destination, amount);
    emit WithdrawalExecuted(withdrawalHash, amount, destination);
}

function cancelTreasuryWithdrawal(bytes32 withdrawalHash) external onlyTreasuryAdmin {
    delete pendingWithdrawals[withdrawalHash];
    emit WithdrawalCancelled(withdrawalHash);
}
```

#### Earnest Money Configuration (NEW)

```solidity
// Escrow.sol
uint256 public constant EARNEST_PERCENTAGE = 500;   // 5% = 500 basis points
uint256 public constant OFFER_EXPIRY = 24 hours;
uint256 public constant MAX_IGNORED_OFFERS = 3;

function submitOffer(uint256 listingId, uint256 offerAmount) external {
    uint256 earnestAmount = (offerAmount * EARNEST_PERCENTAGE) / 10000;
    require(IDRX.transferFrom(msg.sender, address(this), earnestAmount), "Earnest deposit failed");
    
    offers[offerId] = Offer({
        listingId: listingId,
        buyer: msg.sender,
        offerAmount: offerAmount,
        earnestAmount: earnestAmount,
        createdAt: block.timestamp,
        expiresAt: block.timestamp + OFFER_EXPIRY,
        state: OfferState.PENDING
    });
    
    emit OfferSubmitted(offerId, listingId, msg.sender, offerAmount, earnestAmount);
}

function acceptOffer(uint256 offerId) external onlySeller {
    Offer storage offer = offers[offerId];
    require(offer.state == OfferState.PENDING, "Invalid state");
    require(block.timestamp < offer.expiresAt, "Offer expired");
    
    offer.state = OfferState.ACCEPTED;
    _updateSellerActivity(msg.sender);
    
    emit OfferAccepted(offerId);
}

function claimOfferTimeout(uint256 offerId) external {
    Offer storage offer = offers[offerId];
    require(offer.state == OfferState.PENDING, "Invalid state");
    require(block.timestamp >= offer.expiresAt, "Not expired");
    
    offer.state = OfferState.EXPIRED;
    IDRX.transfer(offer.buyer, offer.earnestAmount);  // Refund earnest
    
    _recordIgnoredOffer(offer.listingId);
    
    emit OfferExpired(offerId);
    emit EarnestRefunded(offerId, offer.buyer, offer.earnestAmount);
}

#### Key Contract Functions

**Marketplace.sol:**
```solidity
function createListing(
    string memory title,
    string memory ipfsMetadata,
    uint256 askingPrice,
    VerificationLevel level,
    bytes32 ipAssignmentHash,    // NEW: Hash of IP assignment template
    bytes memory sellerSignature, // NEW: Wallet signature
    string memory buildId         // NEW: Build ID for verification
) external returns (uint256 listingId);

function updateListing(uint256 listingId, string memory ipfsMetadata, uint256 newPrice) external;
function cancelListing(uint256 listingId) external;
function pauseListing(uint256 listingId) external onlyAgent; // NEW: Health check pause
function resumeListing(uint256 listingId) external;           // NEW: Resume after fix
function getActiveListings(uint256 offset, uint256 limit) external view returns (Listing[] memory);
function verifyBuildId(uint256 listingId, bool verified) external onlyAgent; // NEW
```

**Escrow.sol:**
```solidity
// Buyer actions
function deposit(uint256 listingId, EncryptionMethod method) external;
function depositWithSwap(uint256 listingId, address inputToken, uint256 inputAmount, uint256 minIdxOut) external; // NEW: USDC swap
function confirmReceipt(uint256 escrowId) external;
function raiseDispute(uint256 escrowId, DisputeType disputeType, string memory evidenceIpfs) external;

// Seller actions
function uploadCredentialHash(uint256 escrowId, bytes32 credentialHash) external;
function respondToDispute(uint256 escrowId, string memory responseIpfs) external;

// Time-based actions
function claimTimeout(uint256 escrowId) external;  // Auto-release/refund based on state

// Admin actions (Centralized for MVP)
function resolveDispute(uint256 escrowId, DisputeResolution resolution, uint256 refundPercent) external onlyAdmin;
function setTreasuryAddress(address newTreasury) external onlyOwner;
```

**SwapRouter.sol (Optional):**
```solidity
// Integrates with Uniswap V3 on Base
function swapAndDeposit(
    uint256 listingId,
    address tokenIn,        // e.g., USDC
    uint256 amountIn,
    uint256 minAmountOut,   // IDRX minimum (slippage protection)
    uint24 poolFee          // Uniswap pool fee tier
) external returns (uint256 amountOut);
```

#### Verification Extension (NEW)

```solidity
// Escrow.sol
uint256 public constant EXTENSION_PERIOD = 24 hours;

function requestVerificationExtension(uint256 escrowId) external onlyBuyer {
    EscrowTransaction storage escrow = escrows[escrowId];
    require(escrow.state == EscrowState.DELIVERED, "Invalid state");
    require(!escrow.verifyExtensionUsed, "Extension already used");
    require(block.timestamp < escrow.verifyDeadline, "Deadline passed");
    
    escrow.verifyExtensionUsed = true;
    escrow.verifyDeadline += EXTENSION_PERIOD;
    
    emit VerificationExtended(escrowId, escrow.verifyDeadline);
}
```

#### Seller Heartbeat System (NEW)

```solidity
// Marketplace.sol
uint256 public constant HEARTBEAT_INTERVAL = 30 days;
uint256 public constant WARNING_PERIOD = 7 days;
uint256 public constant PAUSE_AFTER_WARNING = 7 days;

function recordHeartbeat() external {
    sellerActivity[msg.sender].lastHeartbeat = block.timestamp;
    sellerActivity[msg.sender].isActive = true;
    if (sellerActivity[msg.sender].isPaused) {
        sellerActivity[msg.sender].isPaused = false;
        _resumeSellerListings(msg.sender);
    }
    emit HeartbeatRecorded(msg.sender, block.timestamp);
}

function checkSellerActivity(address seller) public view returns (bool needsWarning, bool shouldPause) {
    SellerActivity storage activity = sellerActivity[seller];
    uint256 timeSinceHeartbeat = block.timestamp - activity.lastHeartbeat;
    
    needsWarning = timeSinceHeartbeat > HEARTBEAT_INTERVAL;
    shouldPause = timeSinceHeartbeat > (HEARTBEAT_INTERVAL + WARNING_PERIOD + PAUSE_AFTER_WARNING);
}

function pauseInactiveSeller(address seller) external onlyAgent {
    (bool needsWarning, bool shouldPause) = checkSellerActivity(seller);
    require(shouldPause || sellerActivity[seller].ignoredOffers >= MAX_IGNORED_OFFERS, "Not eligible for pause");
    
    sellerActivity[seller].isPaused = true;
    _pauseSellerListings(seller);
    
    emit SellerPaused(seller);
}
```

#### AML Transaction Limits (NEW)

```solidity
// Escrow.sol
mapping(VerificationLevel => uint256) public maxSingleTransaction;
mapping(VerificationLevel => uint256) public maxMonthlyVolume;
mapping(address => uint256) public monthlyVolume;
mapping(address => uint256) public monthResetTimestamp;

constructor() {
    // Basic: < $1,000 per tx, $2,000/month
    maxSingleTransaction[VerificationLevel.BASIC] = 15_000_000 * 1e18;      // 15M IDRX
    maxMonthlyVolume[VerificationLevel.BASIC] = 30_000_000 * 1e18;          // 30M IDRX
    
    // Standard: < $10,000 per tx, $20,000/month
    maxSingleTransaction[VerificationLevel.STANDARD] = 150_000_000 * 1e18;  // 150M IDRX
    maxMonthlyVolume[VerificationLevel.STANDARD] = 300_000_000 * 1e18;       // 300M IDRX
    
    // Enhanced: Unlimited
    maxSingleTransaction[VerificationLevel.ENHANCED] = type(uint256).max;
    maxMonthlyVolume[VerificationLevel.ENHANCED] = type(uint256).max;
}

function _checkTransactionLimits(address seller, uint256 amount, VerificationLevel level) internal {
    require(amount <= maxSingleTransaction[level], "Exceeds single transaction limit");
    
    if (block.timestamp > monthResetTimestamp[seller] + 30 days) {
        monthlyVolume[seller] = 0;
        monthResetTimestamp[seller] = block.timestamp;
    }
    
    require(monthlyVolume[seller] + amount <= maxMonthlyVolume[level], "Exceeds monthly limit");
    monthlyVolume[seller] += amount;
}

// Withdrawal Holding Period
uint256 public constant WITHDRAWAL_HOLD = 24 hours;
mapping(uint256 => uint256) public withdrawalUnlockTime;

function releaseFundsWithHold(uint256 escrowId) internal {
    // ... existing release logic ...
    withdrawalUnlockTime[escrowId] = block.timestamp + WITHDRAWAL_HOLD;
    emit FundsReleasedWithHold(escrowId, withdrawalUnlockTime[escrowId]);
}

function claimWithdrawal(uint256 escrowId) external onlySeller {
    require(block.timestamp >= withdrawalUnlockTime[escrowId], "Holding period active");
    // Transfer funds to seller
}

#### Timelock Mechanism

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         TRANSACTION TIMELINE                              │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────┤
│  Day 0   │  Day 1-3 │  Day 4-7 │ Day 8-10 │ Day 11-14│  Day 15+         │
│  Deposit │ Handover │  Verify  │  Dispute │ Arbitrate│  Auto-Resolve    │
│  FUNDED  │ DELIVERED│ Window   │  Window  │  Period  │                  │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────┘
          │           │          │          │          │
          ▼           ▼          ▼          ▼          │
    If no handover    If no      If dispute If no      Auto-release
    in 72h →          confirm    raised →   resolution or refund
    AUTO REFUND       in 72h →   DISPUTED   in 96h →   based on rules
                      AUTO RELEASE           (Manual)
```

**Timeout Constants:**
```solidity
uint256 public constant HANDOVER_DEADLINE = 72 hours;
uint256 public constant VERIFICATION_WINDOW = 72 hours;
uint256 public constant DISPUTE_RESPONSE_WINDOW = 48 hours;
uint256 public constant ARBITRATION_DEADLINE = 96 hours;
uint256 public constant TRANSITION_HOLD_PERIOD = 7 days;  // NEW: Transition assistance
```

> **MVP Centralization Note:** Dispute resolution within `ARBITRATION_DEADLINE` is handled manually by the Valyra team. Future versions will implement DAO-based arbitration.

#### UUPS Proxy Pattern (Upgradeable Contracts) (NEW)

> [!CAUTION]
> **Why Upgradeable?** In a financial app holding escrow funds, if a bug is found, funds could be stuck. UUPS allows patching logic without moving funds.

```solidity
// contracts/proxy/EscrowProxy.sol
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract EscrowV1 is UUPSUpgradeable, OwnableUpgradeable {
    function initialize(address _treasury, address _idrx) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        treasuryAddress = _treasury;
        IDRX = IERC20(_idrx);
    }
    
    // Only owner can authorize upgrades
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // All existing escrow logic...
}

// Upgrade process:
// 1. Deploy EscrowV2 with bug fix
// 2. Call EscrowProxy.upgradeTo(escrowV2Address)
// 3. All state preserved, logic updated
```

**Upgrade Safety:**
* Requires 2-of-3 multi-sig approval
* 24-hour timelock before upgrade executes
* Upgrade can be cancelled during timelock

#### Dead Man's Switch (Admin Backup) (NEW)

> [!IMPORTANT]
> **Admin Key Loss Protection:** If the main admin loses their keys, the platform becomes unmaintainable. A backup admin can claim ownership after inactivity.

```solidity
// Escrow.sol & Marketplace.sol
address public backupAdmin;
uint256 public constant ADMIN_INACTIVITY_PERIOD = 30 days;
uint256 public lastAdminActivity;

modifier onlyAdmin() {
    require(msg.sender == owner() || msg.sender == backupAdmin, "Not admin");
    lastAdminActivity = block.timestamp;
    _;
}

function setBackupAdmin(address _backupAdmin) external onlyOwner {
    backupAdmin = _backupAdmin;
    lastAdminActivity = block.timestamp;
    emit BackupAdminSet(_backupAdmin);
}

// Backup admin can claim ownership if main admin inactive for 30 days
function claimOwnershipByBackup() external {
    require(msg.sender == backupAdmin, "Not backup admin");
    require(block.timestamp >= lastAdminActivity + ADMIN_INACTIVITY_PERIOD, "Admin still active");
    
    transferOwnership(backupAdmin);
    backupAdmin = address(0);  // Reset backup
    emit BackupAdminClaimedOwnership(msg.sender);
}
```

#### Emergency Eject System (NEW)

> [!WARNING]
> **Catastrophic Recovery:** If the contract gets hacked or UI goes down permanently, users' funds must be recoverable.

```solidity
// Escrow.sol
bool public emergencyMode = false;
uint256 public constant EMERGENCY_COOLDOWN = 72 hours;
uint256 public emergencyActivatedAt;

// Activate emergency mode (requires 2-of-3 multi-sig)
function activateEmergency() external onlyMultiSig {
    emergencyMode = true;
    emergencyActivatedAt = block.timestamp;
    emit EmergencyActivated(block.timestamp);
}

// After cooldown, allow users to withdraw their OWN funds
function emergencyWithdraw(uint256 escrowId) external {
    require(emergencyMode, "Not in emergency mode");
    require(block.timestamp >= emergencyActivatedAt + EMERGENCY_COOLDOWN, "Cooldown active");
    
    EscrowTransaction storage escrow = escrows[escrowId];
    
    // Return funds to ORIGINAL owners only
    if (escrow.state == EscrowState.FUNDED || escrow.state == EscrowState.DELIVERED) {
        // Funds go back to buyer (they haven't confirmed yet)
        IDRX.transfer(escrow.buyer, escrow.amount);
    } else if (escrow.state == EscrowState.TRANSITION) {
        // Retainer goes to SELLER (they already delivered, buyer has the asset)
        // Rationale: TRANSITION means buyer called confirmReceipt, so buyer owns the business
        // The 10% retainer is seller's compensation for transition assistance
        IDRX.transfer(escrow.seller, transitionHolds[escrowId].retainedAmount);
    }
    
    escrow.state = EscrowState.EMERGENCY;
    emit EmergencyWithdrawal(escrowId, msg.sender);
}

// Cancel emergency (if false alarm)
function deactivateEmergency() external onlyMultiSig {
    require(block.timestamp < emergencyActivatedAt + EMERGENCY_COOLDOWN, "Too late to cancel");
    emergencyMode = false;
    emit EmergencyDeactivated();
}
```

**Emergency Events:**
```solidity
event EmergencyActivated(uint256 timestamp);
event EmergencyDeactivated();
event EmergencyWithdrawal(uint256 indexed escrowId, address indexed claimer);
```

#### Transition Hold Logic (NEW)

> [!NOTE]
> **Real-World M&A Practice:** 2FA, OTPs, and migrations often need seller assistance after funds are released.

```solidity
// Escrow.sol
uint256 public constant TRANSITION_RETAINER_BPS = 1000;  // 10%
uint256 public constant TRANSITION_PERIOD = 7 days;

mapping(uint256 => TransitionHold) public transitionHolds;

function confirmReceiptWithHold(uint256 escrowId) external onlyBuyer {
    EscrowTransaction storage escrow = escrows[escrowId];
    require(escrow.state == EscrowState.DELIVERED, "Invalid state");
    
    // Calculate split: 90% now, 10% retainer
    uint256 retainer = (escrow.sellerPayout * TRANSITION_RETAINER_BPS) / 10000;
    uint256 immediateRelease = escrow.sellerPayout - retainer;
    
    // Release 90% immediately
    IDRX.transfer(escrow.seller, immediateRelease);
    IDRX.transfer(treasuryAddress, escrow.platformFee);
    
    // Create transition hold for 10%
    transitionHolds[escrowId] = TransitionHold({
        escrowId: escrowId,
        retainedAmount: retainer,
        releaseTime: block.timestamp + TRANSITION_PERIOD,
        isReleased: false,
        isClaimed: false,
        assistanceNotes: ""
    });
    
    escrow.state = EscrowState.TRANSITION;
    emit TransitionHoldCreated(escrowId, retainer, block.timestamp + TRANSITION_PERIOD);
}

function claimTransitionRetainer(uint256 escrowId) external onlySeller {
    TransitionHold storage hold = transitionHolds[escrowId];
    require(!hold.isClaimed, "Already claimed");
    require(block.timestamp >= hold.releaseTime, "Still in transition period");
    require(escrows[escrowId].state == EscrowState.TRANSITION, "Invalid state");
    
    hold.isClaimed = true;
    hold.isReleased = true;
    IDRX.transfer(escrows[escrowId].seller, hold.retainedAmount);
    
    escrows[escrowId].state = EscrowState.COMPLETED;
    emit TransitionRetainerClaimed(escrowId, hold.retainedAmount);
}

// Buyer can report transition issues (extends hold, triggers dispute)
function reportTransitionIssue(uint256 escrowId, string memory issue) external onlyBuyer {
    TransitionHold storage hold = transitionHolds[escrowId];
    require(escrows[escrowId].state == EscrowState.TRANSITION, "Invalid state");
    require(block.timestamp < hold.releaseTime, "Transition period ended");
    
    // Extend hold and trigger review
    hold.assistanceNotes = issue;
    escrows[escrowId].state = EscrowState.DISPUTED;
    emit TransitionIssueReported(escrowId, issue);
}
```

#### Seller Stake (Anti-Scammer) (NEW)

> [!IMPORTANT]
> **Burner Identity Prevention:** Bad sellers can just make new wallets. Staking creates economic skin in the game.

```solidity
// Marketplace.sol
mapping(address => SellerStake) public sellerStakes;

function stakeToSell() external {
    require(sellerStakes[msg.sender].stakeAmount == 0, "Already staked");
    
    // Genesis Seller Program: First 50 verified sellers (Level 2+) get free listing
    if (genesisProgram && genesisSellersCount < GENESIS_SELLER_LIMIT) {
        require(sellerVerificationLevel[msg.sender] >= VerificationLevel.STANDARD, "Must be verified for Genesis");
        
        sellerStakes[msg.sender] = SellerStake({
            seller: msg.sender,
            stakeAmount: 0,  // Waived for Genesis
            stakedAt: block.timestamp,
            isActive: true,
            slashCount: 0
        });
        
        genesisSellersCount++;
        emit GenesisSeller(msg.sender, genesisSellersCount);
    } else {
        require(IDRX.transferFrom(msg.sender, address(this), MINIMUM_SELLER_STAKE), "Stake transfer failed");
        
        sellerStakes[msg.sender] = SellerStake({
            seller: msg.sender,
            stakeAmount: MINIMUM_SELLER_STAKE,
            stakedAt: block.timestamp,
            isActive: true,
            slashCount: 0
        });
        
        emit SellerStaked(msg.sender, MINIMUM_SELLER_STAKE);
    }
}

function createListing(...) external {
    require(sellerStakes[msg.sender].isActive, "Must stake to list");
    // Genesis sellers have 0 stake but are still active
    // ... existing listing logic
}

// Called when seller loses dispute - 50% to treasury, 50% to victim
function slashStake(address seller, address victim) external onlyAdmin {
    SellerStake storage stake = sellerStakes[seller];
    require(stake.isActive, "Not staked");
    
    uint256 slashAmount = SLASH_PENALTY;
    if (stake.stakeAmount < slashAmount) {
        slashAmount = stake.stakeAmount;
    }
    
    stake.stakeAmount -= slashAmount;
    stake.slashCount++;
    
    // Split penalty: 50% treasury (platform sustainability), 50% victim (compensation)
    uint256 halfSlash = slashAmount / 2;
    IDRX.transfer(treasuryAddress, halfSlash);
    IDRX.transfer(victim, slashAmount - halfSlash);  // Remaining goes to victim
    
    // If stake drops below minimum, pause seller
    if (stake.stakeAmount < MINIMUM_SELLER_STAKE) {
        stake.isActive = false;
        _pauseSellerListings(seller);
    }
    
    emit StakeSlashed(seller, victim, halfSlash, slashAmount - halfSlash, stake.stakeAmount);
}

function withdrawStake() external {
    SellerStake storage stake = sellerStakes[msg.sender];
    require(stake.stakeAmount > 0, "No stake");
    require(_sellerHasNoActiveListings(msg.sender), "Has active listings");
    
    uint256 amount = stake.stakeAmount;
    stake.stakeAmount = 0;
    stake.isActive = false;
    
    IDRX.transfer(msg.sender, amount);
    emit StakeWithdrawn(msg.sender, amount);
}
```

#### Genesis Seller Program (NEW)

> [!NOTE]
> **Cold Start Solution:** Requiring $50 stake creates friction for new marketplace. First 50 verified sellers list for free to build liquidity.

```solidity
// Marketplace.sol
function endGenesisProgram() external onlyAdmin {
    require(genesisProgram, "Already ended");
    genesisProgram = false;
    emit GenesisProgramConcluded(genesisSellersCount);
}

// Check if genesis program is still active
function canJoinGenesisProgram() external view returns (bool) {
    return genesisProgram && genesisSellersCount < GENESIS_SELLER_LIMIT;
}
```

---

### Event Definitions

All contract events for indexing and notifications:

```solidity
// Marketplace Events
event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 price, bytes32 ipAssignmentHash);
event ListingUpdated(uint256 indexed listingId, uint256 newPrice);
event ListingCancelled(uint256 indexed listingId);
event ListingPaused(uint256 indexed listingId, string reason);  // NEW: Health check
event ListingResumed(uint256 indexed listingId);                 // NEW
event ListingVerified(uint256 indexed listingId, VerificationLevel level);
event BuildIdVerified(uint256 indexed listingId, bool verified); // NEW

// Escrow Events
event DepositReceived(uint256 indexed escrowId, uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 platformFee);
event SwapAndDeposit(uint256 indexed escrowId, address tokenIn, uint256 amountIn, uint256 idrxOut); // NEW
event CredentialsUploaded(uint256 indexed escrowId, bytes32 credentialHash, EncryptionMethod method);
event TransactionConfirmed(uint256 indexed escrowId);
event FundsReleased(uint256 indexed escrowId, address indexed seller, uint256 sellerAmount, uint256 feeAmount);
event FundsRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
event FeesCollected(uint256 indexed escrowId, uint256 feeAmount);  // NEW

// Dispute Events
event DisputeRaised(uint256 indexed escrowId, address indexed initiator, DisputeType disputeType);
event DisputeResponseSubmitted(uint256 indexed escrowId, address indexed responder);
event DisputeResolved(uint256 indexed escrowId, DisputeResolution resolution, uint256 refundPercent, address resolver);

// Timeout Events
event HandoverTimeout(uint256 indexed escrowId);
event VerificationTimeout(uint256 indexed escrowId);
event VerificationExtended(uint256 indexed escrowId, uint256 newDeadline);  // NEW

// Offer Events (NEW)
event OfferSubmitted(uint256 indexed offerId, uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 earnest);
event OfferAccepted(uint256 indexed offerId);
event OfferRejected(uint256 indexed offerId);
event OfferExpired(uint256 indexed offerId);
event EarnestRefunded(uint256 indexed offerId, address indexed buyer, uint256 amount);

// Seller Activity Events (NEW)
event HeartbeatRecorded(address indexed seller, uint256 timestamp);
event SellerWarning(address indexed seller, string reason);
event SellerPaused(address indexed seller);
event SellerResumed(address indexed seller);

// Treasury Events (NEW)
event WithdrawalQueued(bytes32 indexed withdrawalHash, uint256 amount, address destination, uint256 unlockTime);
event WithdrawalExecuted(bytes32 indexed withdrawalHash, uint256 amount, address destination);
event WithdrawalCancelled(bytes32 indexed withdrawalHash);
event FundsReleasedWithHold(uint256 indexed escrowId, uint256 unlockTime);
```

---

### Credential Handover Architecture

#### Smart Wallet Encryption Compatibility

> **Critical Issue:** Many Base users use Smart Wallets (ERC-4337) or Coinbase Passkey wallets that do not support `eth_getEncryptionPublicKey` for ECIES encryption. A fallback mechanism is required.

#### Encryption Method Selection

| Wallet Type | Detection | Encryption Method |
|-------------|-----------|-------------------|
| MetaMask (EOA) | `window.ethereum.isMetaMask` + successful `eth_getEncryptionPublicKey` call | `ECIES_WALLET` |
| Coinbase Wallet (EOA) | Successful `eth_getEncryptionPublicKey` call | `ECIES_WALLET` |
| Smart Wallet (ERC-4337) | Failed `eth_getEncryptionPublicKey` or account code size > 0 | `EPHEMERAL_KEYPAIR` |
| Passkey Wallet | Failed `eth_getEncryptionPublicKey` | `EPHEMERAL_KEYPAIR` |

#### Standard ECIES Flow (EOA Wallets)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  SELLER         │    │  VALYRA VAULT   │    │  BUYER (EOA)    │
│                 │    │  (Encrypted)    │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │  1. Request Public   │                      │
         │     Key via RPC      │                      │
         │◄─────────────────────│─eth_getEncryptionPK─►│
         │                      │                      │
         │  2. Encrypt with     │                      │
         │     ECIES            │                      │
         │─────────────────────►│                      │
         │                      │                      │
         │                      │  3. eth_decrypt      │
         │                      │─────────────────────►│
```

#### Ephemeral Keypair Fallback Flow (Smart Wallets)
```
┌─────────────────────────────────────────────────────────────────┐
│                    EPHEMERAL KEYPAIR GENERATION                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Buyer signs deterministic message                     │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ message = "Valyra-Key-Derivation-v1:{escrowId}:{nonce}"   ││
│  │ signature = personal_sign(message)                         ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 2: Derive keypair from signature                         │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ seed = keccak256(signature)                                ││
│  │ ephemeralPrivateKey = seed (mod secp256k1.n)               ││
│  │ ephemeralPublicKey = secp256k1.publicKeyCreate(privateKey) ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 3: Store encrypted private key (XSS-RESISTANT)            │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ encryptedKey = AES-256-GCM(privateKey, signature[:32])     ││
│  │ // Store in IndexedDB (harder to access via XSS)           ││
│  │ indexedDB.valyra.put("ephemeral-{escrowId}", encryptedKey) ││
│  │ // NEVER cache the decrypted privateKey in memory          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 4: Share public key with seller                          │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ POST /vault/set-public-key                                 ││
│  │ { escrowId, publicKey: ephemeralPublicKey }                ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 5: Decryption (FRESH SIGNATURE REQUIRED)                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ // Never cache - require fresh signature each time         ││
│  │ Buyer signs same message → recovers privateKey             ││
│  │ Decrypts credentials with recovered privateKey             ││
│  │ privateKey = null // Clear immediately after use           ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> **XSS MITIGATION (v2.3):** localStorage is vulnerable to XSS. Keys are now stored in **IndexedDB** (harder to access via script injection) with **session-bound decryption** (fresh signature required for every decrypt, never cache the private key).

#### Secure Key Storage Architecture (NEW)

```
┌─────────────────────────────────────────────────────────────────┐
│                XSS-RESISTANT KEY STORAGE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Storage Hierarchy (most to least secure):                      │
│                                                                 │
│  1. IndexedDB (Primary - Browser)                               │
│     └─ More isolated than localStorage                          │
│     └─ Cannot be accessed via document.cookie injections        │
│     └─ Requires async API (harder to exfiltrate in XSS)        │
│                                                                 │
│  2. Session-Bound Decryption                                    │
│     └─ NEVER cache decrypted private key in memory              │
│     └─ Require fresh wallet signature for EACH decryption       │
│     └─ Rate-limit decrypt attempts (max 3/minute)               │
│                                                                 │
│  3. Server-Side Backup (Cross-device)                           │
│     └─ Encrypted with signature-derived key                     │
│     └─ Server CANNOT decrypt without user's wallet              │
│     └─ Rotation: Server key invalidated after successful use    │
│                                                                 │
│  XSS Attack Mitigation:                                         │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Even if attacker reads IndexedDB encrypted key, they need  ││
│  │ the user's wallet signature to decrypt. Phishing the       ││
│  │ signature is harder because:                                ││
│  │ a) Message is escrow-specific (can't reuse)                ││
│  │ b) Server rotates keys after use                           ││
│  │ c) Rate limiting prevents brute force                      ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Ephemeral Key Persistence (Decentralized) (UPDATED v2.4)

> [!NOTE]
> **Backend Risk Mitigation:** Storing keys only on "Valyra Backend" creates a single point of failure. If the database is wiped, buyers lose cross-device access.

**Solution:** Store encrypted ephemeral keys **on-chain** (via events) or **IPFS** for decentralized resilience.

```
┌─────────────────────────────────────────────────────────────────┐
│           DECENTRALIZED EPHEMERAL KEY PERSISTENCE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  After Step 3 (key generation):                                 │
│                                                                 │
│  1. Store locally in IndexedDB (fast access):                   │
│     indexedDB.valyra.ephemeralKeys.put({                        │
│       escrowId: 123,                                            │
│       encryptedKey: "aes256-encrypted",                         │
│       createdAt: Date.now()                                     │
│     })                                                          │
│                                                                 │
│  2a. OPTION 1: Store on-chain (via contract event):            │
│      emit EphemeralKeyStored(                                   │
│        escrowId,                                                │
│        buyerAddress,                                            │
│        encryptedPrivateKey,  // Encrypted with buyer's sig      │
│        publicKey                                                │
│      );                                                         │
│      // Buyers can recover by querying past events              │
│                                                                 │
│  2b. OPTION 2: Store on IPFS:                                  │
│      ipfsHash = ipfs.add({                                      │
│        escrowId: 123,                                           │
│        buyerAddress: "0x...",                                   │
│        encryptedPrivateKey: "aes256...",                        │
│        publicKey: "0x...",                                      │
│        timestamp: Date.now()                                    │
│      });                                                        │
│      // Store IPFS hash in contract for lookup                  │
│      ephemeralKeyHashes[escrowId] = ipfsHash;                   │
│                                                                 │
│  3. Recovery on different device:                               │
│     a. Buyer connects wallet                                    │
│     b. Query contract events OR IPFS via hash                   │
│     c. Buyer signs same derivation message                      │
│     d. Decrypt the encryptedPrivateKey                          │
│     e. Use privateKey to decrypt credentials                    │
│                                                                 │
│  Security: Since encrypted with buyer's signature, it's safe   │
│  to be public. Only the buyer can decrypt it.                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Smart Contract Update:**
```solidity
// Escrow.sol
mapping(uint256 => string) public ephemeralKeyHashes;  // escrowId => IPFS hash

event EphemeralKeyStored(
    uint256 indexed escrowId,
    address indexed buyer,
    string encryptedKey,
    string publicKey
);

function storeEphemeralKey(uint256 escrowId, string memory encryptedKey, string memory publicKey) external {
    require(escrows[escrowId].buyer == msg.sender, "Not buyer");
    emit EphemeralKeyStored(escrowId, msg.sender, encryptedKey, publicKey);
}
```

#### 2-of-3 Arbitrator Key Multi-Encryption (NEW)

> **Arbitration Paradox Solution:** Arbitrators cannot verify "credentials don't work" claims without access to credentials. Solution: encrypt a copy for the arbitrator.

```
┌─────────────────────────────────────────────────────────────────┐
│                  ARBITRATOR KEY ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Seller prepares credential JSON:                               │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ credentialPayload = {                                      ││
│  │   domain: { username: "...", password: "..." },            ││
│  │   hosting: { ... },                                        ││
│  │   source_code: { ... }                                     ││
│  │ }                                                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Multi-Encryption:                                              │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ buyerPayload = ECIES.encrypt(credentialPayload, buyerPK)   ││
│  │ arbPayload = ECIES.encrypt(credentialPayload, arbitratorPK)││
│  │                                                            ││
│  │ upload = {                                                 ││
│  │   buyerEncrypted: buyerPayload,                            ││
│  │   arbitratorEncrypted: arbPayload,                         ││
│  │   plaintextHash: keccak256(credentialPayload)              ││
│  │ }                                                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Arbitrator Access Flow:                                        │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 1. Buyer raises CREDENTIAL_MISMATCH dispute                ││
│  │ 2. Arbitrator calls GET /vault/arbitrator-payload          ││
│  │ 3. Vault checks on-chain: EscrowState == DISPUTED?         ││
│  │ 4. If yes: return arbPayload                               ││
│  │ 5. If no: return 403 Forbidden                             ││
│  │ 6. Arbitrator decrypts with arbitrator private key         ││
│  │ 7. Arbitrator tests credentials, makes ruling              ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Arbitrator Key Management:                                     │
│  • Public key: Published, used for encryption                   │
│  • Private key: HSM-stored, 2-of-3 multi-sig to access          │
│  • Key rotation: Quarterly                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Credential Schema

```json
{
  "handover_id": "uuid",
  "listing_id": 123,
  "buyer_encrypted_payload": "base64...",       // Buyer's copy
  "arbitrator_encrypted_payload": "base64...",  // Arbitrator's copy (NEW)
  "encryption_method": "ecies-secp256k1" | "ephemeral-aes",
  "ephemeral_public_key": "0x...",
  "ephemeral_key_server_stored": true,          // NEW: Server backup exists
  "items": [
    {
      "type": "domain_registrar",
      "service": "Namecheap",
      "verified": true
    },
    {
      "type": "hosting",
      "service": "Vercel",
      "verified": true
    },
    {
      "type": "source_code",
      "service": "GitHub",
      "verified": true,
      "build_id_matched": true,
      "jit_verified_at": "2025-12-15T09:00:00Z"  // NEW: JIT verification timestamp
    },
    {
      "type": "payment_processor",
      "service": "Stripe",
      "verified": false
    }
  ],
  "uploaded_at": "2025-12-15T10:00:00Z",
  "hash": "0x..."
}
```

---

### Build ID Verification System

#### Purpose
Prevent the codebase verification loophole where a seller could show legitimate DNS/revenue verification but hand over an empty or unrelated codebase.

#### Implementation

**1. Seller adds meta tag to live site:**
```html
<meta name="valyra-build-id" content="abc123def456">
```

**2. Agent verification flow:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Live Site      │    │  AI Agent       │    │  GitHub Repo    │
│  example.com    │    │  (Verification) │    │  owner/repo     │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
   Fetch │                      │                      │
   HTML  │─────────────────────►│                      │
         │                      │                      │
         │  Extract meta tag:   │                      │
         │  valyra-build-id     │                      │
         │                      │                      │
         │                      │  Fetch latest commit │
         │                      │─────────────────────►│
         │                      │                      │
         │                      │◄─commit: abc123def456│
         │                      │                      │
         │  Compare:            │                      │
         │  site.buildId ===    │                      │
         │  repo.commitHash     │                      │
         │                      │                      │
         │  [MATCH/MISMATCH]    │                      │
         │◄─────────────────────│                      │
```

**3. Verification levels:**
| Match Status | Verification Level | UI Badge |
|--------------|-------------------|----------|
| Exact match (full hash) | ENHANCED | ✅ Code Verified |
| Partial match (7 chars) | ENHANCED | ✅ Code Verified |
| No meta tag found | STANDARD max | ⚠️ Code Unverified |
| Mismatch | BASIC only | ❌ Code Mismatch |

#### Just-in-Time (JIT) Re-verification (NEW)

> **Bait-and-Switch Prevention:** Seller could verify code at listing time, then push malicious changes before sale.

```
┌─────────────────────────────────────────────────────────────────┐
│                    JIT VERIFICATION FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Trigger: Buyer initiates deposit (or accepts offer)           │
│                                                                 │
│  1. Agent re-fetches live site Build ID                        │
│  2. Agent re-fetches GitHub latest commit hash                 │
│  3. Compare: still matches?                                    │
│     ├─▶ YES: Proceed with deposit                               │
│     └─▶ NO: Block deposit, alert buyer                          │
│                                                                 │
│  4. Record JIT verification:                                    │
│     jitVerification = {                                        │
│       listing_id: 123,                                          │
│       verified_at: "2025-12-15T09:00:00Z",                     │
│       site_build_id: "abc123",                                  │
│       repo_commit: "abc123def456...",                          │
│       status: "matched" | "changed"                            │
│     }                                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Repository Snapshot with Permanent Storage (NEW)

> [!WARNING]
> **Storage Cost Issue:** IPFS pinning services have limits and require ongoing maintenance. If the pin expires, buyer loses the asset they bought.

**Solution:** Use **Arweave** for permanent, immutable storage of code snapshots.

At the moment of escrow funding, the system creates a read-only snapshot:

1. **Fork Repository:** Create a private fork to `valyra-snapshots/listing-{id}-{timestamp}`
2. **Lock Commit:** Pin to the specific verified commit hash
3. **Size Limit:** Enforce **50MB maximum** (exclude node_modules, vendor, dist)
4. **Archive:** Generate a ZIP/tarball of the codebase (source only)
5. **Permanent Store:** Upload to **Arweave** (permanent, pay once) instead of IPFS
6. **Record Hash:** Store Arweave transaction ID in escrow metadata
7. **Buyer Access:** Buyer receives Arweave link + GitHub archive access

```solidity
struct EscrowSnapshot {
    uint256 escrowId;
    string arweaveTxId;           // Permanent Arweave transaction ID
    string githubArchiveUrl;      // Backup GitHub archive URL
    bytes32 contentHash;          // SHA256 of archive content
    uint256 sizeBytes;            // Archive size (max 50MB)
    uint256 createdAt;
}

// Maximum archive size: 50MB
uint256 public constant MAX_SNAPSHOT_SIZE = 50 * 1024 * 1024;
```

**File Exclusion Rules:**
```
# .valyraignore (auto-generated)
node_modules/
.git/
vendor/
dist/
build/
*.log
.env*
coverage/
.next/
```

---

### OAuth Zero-Storage Policy

#### Security Problem
Storing seller OAuth tokens creates a massive security target. Additionally, revenue might change during the listing period.

#### Solution: Signed Attestation Snapshots

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZERO-STORAGE OAUTH FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: OAuth Authorization                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ User redirects to Stripe/GA OAuth consent                  ││
│  │ Valyra receives temporary access token                     ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 2: Data Fetch (ONE TIME ONLY)                            │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Agent fetches: MRR, Revenue, Traffic, Customer Count       ││
│  │ Data stored in memory only                                 ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 3: Generate Attestation                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ attestation = {                                            ││
│  │   listing_id: 123,                                         ││
│  │   mrr_verified: 1500000,                                   ││
│  │   snapshot_date: "2025-12-10",                             ││
│  │   source: "stripe",                                        ││
│  │   agent_address: "0xAgent..."                              ││
│  │ }                                                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 4: Sign Attestation                                       │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ signature = agentWallet.sign(keccak256(attestation))       ││
│  │ signedAttestation = { ...attestation, signature }          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Step 5: Pin to IPFS & Discard Token                           │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ ipfsHash = ipfs.pin(signedAttestation)                     ││
│  │ listing.attestationIpfs = ipfsHash                         ││
│  │ DELETE oauthToken (not stored)                             ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Attestation Verification
Anyone can verify the attestation by:
1. Fetching the IPFS content
2. Recovering the signer address from the signature
3. Confirming signer is the official Valyra Agent wallet

---

### AI Backend API Specification

#### Base URL
```
Production: https://api.valyra.io/v1
Staging: https://api-staging.valyra.io/v1
```

#### API Signature Verification (NEW)

> [!IMPORTANT]
> **Middleware Attack Prevention:** Without signature verification, attackers can bypass the frontend and call expensive AI endpoints directly, costing significant Gemini tokens.

All authenticated endpoints require wallet signature verification:

```
┌─────────────────────────────────────────────────────────────────┐
│                 API SIGNATURE VERIFICATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Required Headers:                                              │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ X-Wallet-Address: 0x1234...abcd                            ││
│  │ X-Timestamp: 1702300800000                                 ││
│  │ X-Signature: 0x9876...efgh                                 ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Signature Message Format:                                      │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ message = `Valyra API Request:${timestamp}:${endpoint}`    ││
│  │ signature = personal_sign(message)                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Server Validation:                                             │
│  1. Recover signer from signature                               │
│  2. Verify signer == X-Wallet-Address                           │
│  3. Check timestamp within 5 minutes of server time            │
│  4. Check caller has Basename OR on-chain history               │
│  5. Rate limit: 10 requests/minute for AI endpoints            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

```python
# Backend verification (FastAPI)
from eth_account.messages import encode_defunct
from web3 import Web3

def verify_api_signature(
    wallet_address: str,
    timestamp: int,
    signature: str,
    endpoint: str
) -> bool:
    # Check timestamp freshness (5 minute window)
    if abs(time.time() * 1000 - timestamp) > 300_000:
        raise HTTPException(401, "Signature expired")
    
    # Reconstruct message
    message = f"Valyra API Request:{timestamp}:{endpoint}"
    encoded_msg = encode_defunct(text=message)
    
    # Recover signer
    recovered = Web3().eth.account.recover_message(
        encoded_msg, 
        signature=signature
    )
    
    if recovered.lower() != wallet_address.lower():
        raise HTTPException(401, "Invalid signature")
    
    # Check caller eligibility (Basename or on-chain history)
    if not has_basename(wallet_address) and not has_onchain_history(wallet_address):
        raise HTTPException(403, "No on-chain identity")
    
    return True
```

#### Endpoints

**Valuation Service (with Guardrails + Signature Required):**
```
POST /valuation/analyze
Headers:
  X-Wallet-Address: 0x1234...
  X-Timestamp: 1702300800000
  X-Signature: 0x...

Request:
{
  "business_url": "https://example.com",
  "mrr": 1500000,           // IDR
  "monthly_traffic": 10000,
  "tech_stack": ["nextjs", "postgresql"],
  "description": "SaaS tool for..."
}

Response:
{
  "valuation_range": {
    "low": 30000000,        // IDR (min 1x ARR)
    "mid": 45000000,
    "high": 60000000        // Guardrail: max 10x ARR
  },
  "confidence": 0.75,
  "guardrails_applied": ["max_10x_arr"],
  "reasoning": "Based on 2.5-4x ARR for similar...",
  "comparable_sales": [...],
  "disclaimer": "Valuation is an estimate only. Not financial advice."
}
```

**Build ID Verification (NEW):**
```
POST /verify/build-id
Request:
{
  "listing_id": 123,
  "business_url": "https://example.com",
  "github_repo": "owner/repo"
}

Response:
{
  "verified": true,
  "site_build_id": "abc123def456",
  "repo_commit_hash": "abc123def456789...",
  "match_type": "exact",  // "exact", "partial", "mismatch", "not_found"
  "timestamp": "2025-12-10T10:00:00Z"
}
```

**OAuth Verification (Zero-Storage):**
```
POST /verify/oauth
Request:
{
  "provider": "stripe",
  "oauth_code": "xxx",
  "listing_id": 123
}

Response:
{
  "verified": true,
  "mrr_confirmed": 1500000,
  "discrepancy": false,
  "attestation_ipfs": "Qm...",         // NEW: Signed attestation
  "agent_signature": "0x...",          // NEW: Agent wallet signature
  "token_discarded": true              // NEW: Confirm token not stored
}
```

**Chat Service (Token-Gated):**
```
POST /chat/message
Headers:
  X-Wallet-Address: 0xBuyer...
  X-Wallet-Signature: <signed message proving ownership>

Request:
{
  "session_id": "uuid",
  "listing_id": 123,
  "message": "Is this business overpriced?",
  "user_role": "buyer"
}

Response:
{
  "reply": "Based on my analysis...",
  "suggested_actions": ["request_verification", "make_offer"],
  "agent_wallet": "0x...",
  "access_tier": "inquire"  // "browse", "inquire", "negotiate"
}

// Token-Gating Rules:
// - browse: Wallet connected (any balance)
// - inquire: Wallet balance >= $10 equivalent
// - negotiate: Offer submitted or escrow deposited
```

**Health Check CRON (NEW):**
```
// Internal endpoint called by scheduler
POST /internal/health-check
Request:
{
  "listing_id": 123,
  "check_types": ["uptime", "ssl", "domain_expiry"]
}

Response:
{
  "listing_id": 123,
  "checks": {
    "uptime": { "status": "pass", "http_code": 200 },
    "ssl": { "status": "pass", "expires_in_days": 45 },
    "domain_expiry": { "status": "warn", "expires_in_days": 30 }
  },
  "action_taken": "none" | "warning_added" | "listing_paused"
}
```

#### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/valuation/*` | 10 | 1 minute |
| `/verify/*` | 20 | 1 minute |
| `/chat/*` (browse) | 10 | 1 minute |
| `/chat/*` (inquire) | 60 | 1 minute |
| `/chat/*` (negotiate) | 120 | 1 minute |

#### Error Responses
```json
{
  "error": {
    "code": "TOKEN_GATED",
    "message": "Minimum $10 wallet balance required for detailed inquiries.",
    "required_balance_usd": 10,
    "current_balance_usd": 5.50
  }
}
```

---

### System Interfaces

* **Blockchain Interface:** JSON-RPC connection to Base Mainnet via **Viem/Wagmi**. Simple RPC calls for event listening (no full subgraph for MVP).
* **Coinbase AgentKit (CDP SDK):** Python SDK used to manage the AI's wallet and interact with the Base network programmatically.
* **IDRX Interface:** Interaction with the official IDRX ERC-20 contract (`transferFrom`, `approve`).
* **Uniswap V3 Interface:** Router contract for USDC→IDRX swaps.
* **Basenames Interface:** ENS-compatible resolution for Base native identities.
* **Google Gemini API:** Gemini 1.5 Pro model used by the Agent to parse unstructured business descriptions (with guardrails).

### User Interfaces

* **Dashboard:** Built with **OnchainKit**.
    * *Home:* List of active startups for sale with filter/search.
    * *Sell Modal:* Input form for URL, Revenue, Description + IP Assignment signing.
    * *Agent Chat:* Token-gated floating chat window.
    * *Escrow Tracker:* Visual progress bar showing transaction state.
* **Wallet Connection:** Standard "Connect Wallet" button supporting Coinbase Wallet, MetaMask, and Smart Wallets.
* **Identity:** Basenames integration for native Base ecosystem profiles.

### Hardware Interfaces

* **Mobile Responsive:** The UI must be fully functional on mobile browsers (Chrome/Safari on iOS/Android) as Indonesian users are mobile-first.

---

## Testing Plan

### Test Strategies

1. **Unit Testing (Smart Contracts):** Test individual functions in isolation using Hardhat/Foundry.
    * *Rationale:* Bugs in contracts are irreversible and costly.
2. **Integration Testing (Backend):** Test the handshake between the Python AI Agent and the Base Blockchain.
    * *Rationale:* Ensuring the Agent has enough gas and correct permissions to sign transactions.
3. **E2E Testing (Frontend):** Test complete user flows from wallet connect to transaction completion.
4. **Encryption Testing:** Test both ECIES and ephemeral keypair flows with different wallet types.
5. **User Acceptance Testing (UAT):** "Corridor testing" with non-technical users to ensure the buying flow is intuitive.

### Testing Tools

* **Foundry / Hardhat:** For Solidity testing and gas optimization.
* **Pytest:** For testing the Python AI Agent logic.
* **Coinbase Sepolia Faucet:** To fund test wallets.
* **React Testing Library / Playwright:** For frontend component and E2E tests.

### Testing Environments

1. **Local:** Hardhat Network (simulated blockchain).
2. **Staging:** **Base Sepolia Testnet**. This is the primary development environment for the Hackathon.
3. **Production:** **Base Mainnet**. Only for the final submission deployment.

### Test Cases

#### Happy Path Tests
| Test | Action | Expected Result |
|------|--------|-----------------|
| TC-001 | Seller creates listing with IP signature | Listing appears on marketplace, `ListingCreated` event with `ipAssignmentHash` |
| TC-002 | Buyer deposits IDRX | Funds locked in escrow, state = `FUNDED`, `platformFee` calculated |
| TC-003 | Seller uploads credentials | Credential hash stored, state = `DELIVERED` |
| TC-004 | Buyer confirms receipt | Funds released: 97.5% to seller, 2.5% to treasury |

#### Platform Fee Tests (NEW)
| Test | Action | Expected Result |
|------|--------|-----------------|
| TC-050 | Deposit 100,000 IDRX | `platformFee` = 2,500 IDRX, `sellerPayout` = 97,500 IDRX |
| TC-051 | Complete transaction | Treasury receives 2,500 IDRX |
| TC-052 | Full refund dispute | Buyer receives 100,000 IDRX (no fee charged) |

#### Encryption Fallback Tests (NEW)
| Test | Action | Expected Result |
|------|--------|-----------------|
| TC-060 | EOA wallet deposits | `encryptionMethod` = `ECIES_WALLET` |
| TC-061 | Smart wallet deposits | `encryptionMethod` = `EPHEMERAL_KEYPAIR`, ephemeral key generated |
| TC-062 | Smart wallet decrypts | Successfully decrypts using signature-derived key |

#### Build ID Verification Tests (NEW)
| Test | Action | Expected Result |
|------|--------|-----------------|
| TC-070 | Site has matching build ID | `buildIdVerified` = true, level = ENHANCED |
| TC-071 | Site has mismatched build ID | `buildIdVerified` = false, warning flag |
| TC-072 | Site has no build ID meta tag | Verification capped at STANDARD |

#### Edge Case Tests
| Test | Action | Expected Result |
|------|--------|-----------------|
| TC-101 | Deposit without IDRX approval | Revert with `ERC20: insufficient allowance` |
| TC-102 | Unauthorized release attempt | Revert with `OnlyBuyer` |
| TC-103 | Seller misses handover deadline | Auto-refund to buyer, state = `REFUNDED` |
| TC-104 | Buyer raises dispute | State = `DISPUTED`, timer paused |

#### Dispute Tests
| Test | Action | Expected Result |
|------|--------|-----------------|
| TC-201 | Buyer raises CREDENTIAL_MISMATCH | Dispute created, seller has 48h to respond |
| TC-202 | Seller responds to dispute | Evidence stored, ready for manual arbitration |
| TC-203 | Admin resolves with FULL_REFUND | Buyer receives 100% of escrowed funds |
| TC-204 | Admin resolves with PARTIAL_REFUND | Funds split per resolution percentage |

---

## Monitoring and Alerting

### Logging

| Component | Tool | Data Logged |
|-----------|------|-------------|
| Smart Contracts | RPC event polling (Viem) | All events indexed |
| AI Backend | Structured JSON logs | API requests, Agent responses, errors |
| Frontend | Vercel Analytics | User sessions, errors, performance |

> **Note:** Full subgraph (The Graph) is not required for MVP. Simple RPC calls via `viem.getLogs()` are sufficient.

### Alerting Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| High Gas Price | Gas > $0.50 | Pause non-critical mainnet operations |
| AI Backend Down | No response for 5 min | Page on-call, show fallback UI |
| Dispute Spike | >5 disputes in 1 hour | Investigate for potential exploit |
| Failed Transactions | >3 consecutive failures | Investigate contract state |
| Health Check Failures | >3 listings unreachable | Review listing quality |
| Fee Collection Issue | Treasury balance unchanged after completion | Investigate fee transfer |

### Dashboard Metrics

* Active Listings Count
* Total Value Locked (TVL) in Escrow
* Transaction Volume (24h, 7d, 30d)
* Average Transaction Time
* Dispute Rate
* AI Agent Response Time (p95)
* **Platform Fees Collected (24h, 7d, 30d)** (NEW)
* **Health Check Pass Rate** (NEW)
* **Encryption Method Distribution** (NEW)

---

## Reporting and Metrics

* **Gas Reports:** Generated by Hardhat Gas Reporter.
* **Agent Latency:** Measure time taken from "User Request" to "Agent Reply".
* **GitHub Actions:** CI/CD status badges in the README.
* **Fee Reports:** Daily summary of platform fees collected.

---

## Deployment Plan

### Deployment Environment

* **Smart Contracts:** Base Mainnet.
    * *Requirement:* Real ETH (on Base) for gas deployment (~$2).
* **Backend (AI):** **Railway** or **Render** (Cloud hosting that supports Python/Docker).
* **Frontend:** **Vercel** (Seamless Next.js hosting).
* **Credential Vault:** Encrypted storage service (AWS S3 with KMS or self-hosted).
* **Treasury:** Multi-sig wallet (Gnosis Safe on Base).

### Deployment Tools

* **Hardhat Deploy:** Scriptable deployment to manage contract addresses.
* **Vercel CLI:** For frontend CI/CD.
* **Docker:** For backend containerization.
* **Git:** Version control.

### Deployment Steps

1. **Treasury Setup:**
    * Create multi-sig wallet on Base (Gnosis Safe).
    * Set as `treasuryAddress` in Escrow contract.
2. **Contract Deployment:**
    * Run `npx hardhat run scripts/deploy.js --network base_mainnet`.
    * Save the output `MarketplaceAddress` and `EscrowAddress`.
    * Verify source code on **Basescan**.
3. **Backend Configuration:**
    * Update `ENV` variables in Railway with the new Contract Addresses and Coinbase CDP API Keys.
    * Deploy Python container.
4. **Frontend Build:**
    * Update `config.ts` with the Mainnet Contract Addresses.
    * Push to `main` branch -> Vercel auto-deploys.
5. **Liquidity Check:**
    * Ensure the test Buyer wallet has real **IDRX**. (Can swap USDC for IDRX on Uniswap/Aerodrome on Base).

### Post-Deployment Verification

* **Smoke Test:** Create a "Test Listing" for 100 Rupiah (IDRX). Buy it with a secondary wallet. Verify treasury receives 2.5 IDRX.
* **Agent Check:** Query the Agent via the live frontend. Ensure it responds and doesn't time out.
* **Dispute Flow Test:** Test the full dispute resolution flow on mainnet.
* **Encryption Flow Test:** Test both ECIES and ephemeral keypair flows with live wallets.

### Continuous Deployment

* **Frontend:** Automatic deployments via Vercel on Git push.
* **Backend:** Automatic deployments via Railway on Git push.
* **Contracts:** Manual deployment only (Contracts are immutable; upgrades require a new deployment).

### Fallback & Recovery

| Scenario | Recovery Action |
|----------|-----------------|
| AI Backend crash | Frontend shows "Manual valuation mode" with form |
| High gas fees | Queue transactions for batch processing |
| Contract bug discovered | Pause contract via admin function, deploy patched version |
| Encryption fallback fails | Provide manual credential exchange option |

---

## Security Considerations

### Smart Contract Security

* **ReentrancyGuard:** All state-changing functions use OpenZeppelin's ReentrancyGuard.
* **Access Control:** Role-based access for admin functions (dispute resolution, pause).
* **Timelock Safety:** All auto-release functions respect minimum time delays.
* **Fee Safety:** Platform fee percentage immutable after deployment.
* **Audit:** Pre-mainnet audit recommended (Hashlock, Sherlock).

### Backend Security

* **Rate Limiting:** Prevent API abuse with token-gated tiers.
* **Input Sanitization:** AI filters malicious inputs.
* **Wallet Segregation:** Agent wallet separate from escrow funds.
* **Zero-Storage OAuth:** Access tokens never persisted.

### Credential Vault Security

* **2-of-3 Multi-Encryption:** Credentials encrypted for buyer AND arbitrator.
* **Asymmetric Encryption:** ECIES with buyer's wallet public key OR ephemeral keypair.
* **No Plaintext Storage:** Credentials encrypted before upload.
* **Auto-Purge:** Credentials deleted 30 days post-transaction.
* **Access Logging:** All credential access attempts logged.
* **Ephemeral Key Recovery:** Server-side encrypted backup enables cross-device recovery.
* **Arbitrator Access Control:** arbPayload only accessible when EscrowState == DISPUTED.

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| **MRR** | Monthly Recurring Revenue |
| **IDRX** | Indonesian Rupiah Stablecoin on Base |
| **CDP** | Coinbase Developer Platform |
| **SBT** | Soulbound Token (non-transferable NFT) |
| **Build ID** | Unique identifier linking live site to codebase |
| **ERC-4337** | Account Abstraction standard for Smart Wallets |
| **Basenames** | Base's native identity/naming system |
| **ECIES** | Elliptic Curve Integrated Encryption Scheme |
| **Earnest Money** | 5% deposit to prove serious buyer intent |
| **Heartbeat** | Periodic seller activity check |
| **JIT Verification** | Just-in-Time verification at deposit time |
| **Arbitrator Key** | Key used for dispute resolution credential access |
| **IndexedDB** | Browser storage API (XSS-resistant alternative to localStorage) |
| **UUPS** | Universal Upgradeable Proxy Standard for contract upgrades |
| **Transition Hold** | 10% retainer held for 7 days post-sale for migration assistance |
| **Seller Stake** | ~$50 IDRX deposit required to list (slashed on dispute loss) |
| **Arweave** | Permanent, immutable storage for code snapshots |

### Contract Addresses (To Be Filled)
| Contract | Sepolia | Mainnet |
|----------|---------|---------|
| MarketplaceProxy | TBD | TBD |
| EscrowProxy | TBD | TBD |
| MarketplaceV1 | TBD | TBD |
| EscrowV1 | TBD | TBD |
| SwapRouter | TBD | TBD |
| Treasury | TBD | TBD |
| IDRX (Official) | TBD | TBD |

---

**Changelog:**
* **v2.4 (Dec 11, 2025):** Final refinements: Genesis Seller Program (first 50 verified sellers waive $50 stake), Emergency Eject TRANSITION fix (retainer to buyer), Dispute Evidence Encryption (arbitrator-encrypted before IPFS), Ephemeral Key on-chain/IPFS storage (decentralized), Dead Man's Switch (backup admin after 30d inactivity), Slash Stake victim compensation (50/50 treasury/buyer split), Gas fee estimates updated to $0.10-$0.20.
* **v2.3 (Dec 11, 2025):** Production readiness fixes: UUPS Proxy Pattern, Emergency Eject system (72h cooldown), Transition Hold (10%/7d), Seller Stake (~$50), IndexedDB + session-bound keys (XSS mitigation), API Signature Verification, Arweave permanent storage (50MB limit).
* **v2.2 (Dec 11, 2025):** Added 2-of-3 Arbitrator Key multi-encryption, server-side ephemeral key persistence, JIT Build ID verification, Earnest Money (5%), Seller Heartbeat, AML limits, treasury timelock (48h), verification extension, withdrawal holding period.
* **v2.1 (Dec 11, 2025):** Added platform fee (2.5%), Smart Wallet fallback, Build ID verification, OAuth zero-storage, IP Assignment, token-gated chat, health checks, USDC swap, Basenames.
* **v2.0 (Dec 10, 2025):** Added dispute resolution, credential handover, timelocks, events, API specs, monitoring.
* **v1.0 (Dec 10, 2025):** Initial TDD draft.