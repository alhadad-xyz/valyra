use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use ic_stable_structures::Storable;

/// Represents a complete business listing on the Valyra marketplace
/// 
/// This struct contains all business metadata, financial metrics, operational data,
/// legal information, and listing status required for a comprehensive SaaS acquisition listing.
/// 
/// # Field Categories:
/// - **Core Identifiers**: `id`, `seller_principal`
/// - **Business Snapshot**: `title`, `description`, `website_url`, `logo_url`
/// - **Financial Metrics**: ARR, MRR, churn, margins, CAC, LTV
/// - **Operational Data**: tech stack, headcount, customer demographics
/// - **Legal & Compliance**: business structure, address, tax info, GDPR compliance
/// - **Listing Metadata**: timestamps and status tracking
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct DealNFT {
    /// Auto-incrementing primary key for the listing
    pub id: u64,
    
    /// Internet Identity principal of the business owner/seller
    pub seller_principal: Principal,
    
    // ════════════════════════════════════════════════════════════════════════════════════════
    // BUSINESS SNAPSHOT FIELDS
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// Short, searchable business title (≤ 50 characters)
    /// Example: "AI-Powered CRM for SMBs"
    pub title: String,
    
    /// Long-form business description in markdown format (≤ 2,000 characters)
    /// Should include value proposition, target market, and key differentiators
    pub description: String,
    
    /// Valid HTTPS URL to the business website
    /// Used for verification and buyer due diligence
    pub website_url: String,
    
    /// HTTPS URL to business logo (512×512 PNG or SVG preferred)
    /// Displayed in listing cards and detail views
    pub logo_url: String,
    
    // ════════════════════════════════════════════════════════════════════════════════════════
    // FINANCIAL METRICS FIELDS
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// Annual Recurring Revenue in USD (last 12 months)
    /// Primary valuation metric for SaaS businesses
    pub arr_usd: u64,
    
    /// Monthly Recurring Revenue in USD (last complete month)
    /// Used to calculate growth rate and momentum
    pub mrr_usd: u64,
    
    /// Monthly logo churn rate as percentage (0.0-100.0)
    /// Key metric for business health and retention
    pub churn_pct: f32,
    
    /// Gross margin percentage (0.0-100.0)
    /// Revenue minus cost of goods sold, critical for profitability analysis
    pub gross_margin_pct: f32,
    
    /// Net profit in USD (last 12 months)
    /// Bottom-line profitability after all expenses
    pub net_profit_usd: u64,
    
    /// Customer Acquisition Cost in USD
    /// Blended CAC across all marketing channels
    pub cac_usd: u32,
    
    /// Average Customer Lifetime Value in USD
    /// Calculated as average revenue per customer / churn rate
    pub ltv_usd: u32,
    
    // ════════════════════════════════════════════════════════════════════════════════════════
    // OPERATIONAL DATA FIELDS
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// Technology stack as comma-separated tags
    /// Example: "Next.js, PostgreSQL, AWS, Stripe"
    pub tech_stack: String,
    
    /// Full-time employee headcount
    /// Includes founders and contractors working >30 hours/week
    pub num_employees: u16,
    
    /// One-line customer base summary
    /// Example: "B2B SaaS companies with 10-500 employees in North America"
    pub customer_base: String,
    
    /// Annual operating expenses in USD (last 12 months)
    /// Total OpEx including salaries, marketing, infrastructure, etc.
    pub annual_operating_expenses_usd: u64,
    
    // ════════════════════════════════════════════════════════════════════════════════════════
    // LEGAL & COMPLIANCE FIELDS
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// Business legal structure/entity type
    pub business_structure: BusinessStructure,
    
    /// Full legal registered business address
    /// Required for legal documentation and verification
    pub registered_address: String,
    
    /// Masked tax identification number
    /// Example: "***-**-1234" (shows only last 4 digits for privacy)
    pub tax_id: String,
    
    /// GDPR compliance status
    /// True if business has implemented GDPR-compliant data handling
    pub gdpr_compliant: bool,
    
    /// Optional IPFS CID containing zipped due diligence documents
    /// May include financial statements, legal docs, customer references
    pub attachments_cid: Option<String>,
    
    // ════════════════════════════════════════════════════════════════════════════════════════
    // LISTING METADATA FIELDS
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// Unix timestamp when listing was created (seconds since epoch)
    pub created_at: u64,
    
    /// Unix timestamp when listing was last modified (seconds since epoch)
    pub updated_at: u64,
    
    /// Current listing status in the marketplace
    pub status: ListingStatus,
}

/// Legal business structure types supported by the platform
/// 
/// These correspond to common business entity types in most jurisdictions,
/// particularly focusing on US business structures.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum BusinessStructure {
    /// Limited Liability Company - most common for small-medium SaaS businesses
    LLC,
    /// Corporation (C-Corp or S-Corp) - typically used by VC-funded companies
    Corp,
    /// Sole Proprietorship - individual owner, unlimited liability
    SoleProp,
}

/// Current status of a business listing in the marketplace
/// 
/// This enum tracks the listing lifecycle from creation to final disposition.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ListingStatus {
    /// Listing is live and accepting buyer interest
    Active,
    /// Buyer and seller have been matched, in negotiation phase
    Matched,
    /// Transaction completed successfully
    Sold,
    /// Seller has withdrawn the listing from the market
    Withdrawn,
}

/// Status of deal/offer negotiations between matched parties
/// 
/// This enum is used for tracking the negotiation process after initial matching.
/// Separate from ListingStatus to allow for multiple concurrent deal negotiations.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum DealStatus {
    /// Deal is active and being negotiated
    Active,
    /// Parties are in active negotiation phase
    InNegotiation,
    /// Funds are held in escrow, awaiting milestone completion
    InEscrow,
    /// Deal completed successfully
    Completed,
    /// Deal is under dispute resolution
    Disputed,
}

/// Represents a formal purchase offer from a buyer to a seller
/// 
/// Offers can include complex deal structures with milestones, earnouts,
/// and staged payments to reduce buyer risk and align incentives.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Offer {
    /// Unique offer identifier
    pub id: u64,
    /// ID of the DealNFT/listing this offer is for
    pub deal_id: u64,
    /// Internet Identity principal of the buyer making the offer
    pub buyer: Principal,
    /// Total offer amount in USD
    pub amount: u64,
    /// Percentage of equity being acquired (0.0-100.0)
    pub equity_percentage: f64,
    /// Payment milestones for staged deal completion
    pub milestones: Vec<Milestone>,
    /// Unix timestamp when offer was created
    pub created_at: u64,
    /// Current status of this offer
    pub status: OfferStatus,
}

/// Status of a specific offer in the negotiation process
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum OfferStatus {
    /// Offer submitted, awaiting seller response
    Pending,
    /// Seller has accepted the offer
    Accepted,
    /// Seller has rejected the offer
    Rejected,
    /// Seller has made a counter-offer
    Countered,
}

/// Represents a payment milestone in a staged acquisition deal
/// 
/// Milestones allow buyers to structure payments based on business performance
/// or completion of specific conditions, reducing acquisition risk.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Milestone {
    /// Human-readable description of what must be completed
    /// Example: "Maintain >95% uptime for 90 days"
    pub description: String,
    /// Payment amount in USD released upon completion
    pub amount: u64,
    /// Unix timestamp deadline for milestone completion
    pub deadline: u64,
    /// Whether this milestone has been completed
    pub completed: bool,
}

/// Record of a vote in the dispute resolution process
/// 
/// Used by the DisputeDAO for decentralized conflict resolution
/// between buyers and sellers when milestone completion is contested.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct VoteRecord {
    /// Principal of the DAO member casting the vote
    pub voter: Principal,
    /// Vote decision: true for buyer, false for seller
    pub vote: bool,
    /// Unix timestamp when vote was cast
    pub timestamp: u64,
}

// ════════════════════════════════════════════════════════════════════════════════════════
// STORABLE IMPLEMENTATIONS FOR IC-STABLE-STRUCTURES
// ════════════════════════════════════════════════════════════════════════════════════════

impl Storable for DealNFT {
    /// Serializes DealNFT to bytes for stable storage
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(candid::encode_one(self).unwrap())
    }

    /// Deserializes DealNFT from bytes stored in stable memory
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    /// Maximum size bound for DealNFT storage (8KB should accommodate all fields)
    /// Increased from 2KB to handle the comprehensive listing schema
    const BOUND: ic_stable_structures::storable::Bound = 
        ic_stable_structures::storable::Bound::Bounded { max_size: 8192, is_fixed_size: false };
}

impl Storable for Offer {
    /// Serializes Offer to bytes for stable storage
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(candid::encode_one(self).unwrap())
    }

    /// Deserializes Offer from bytes stored in stable memory
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    /// Maximum size bound for Offer storage (4KB should accommodate milestones)
    const BOUND: ic_stable_structures::storable::Bound = 
        ic_stable_structures::storable::Bound::Bounded { max_size: 4096, is_fixed_size: false };
}