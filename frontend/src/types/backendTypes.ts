// Types that mirror the Rust backend types from shared_types crate
// These ensure type safety between frontend and Internet Computer canisters

export interface Principal {
  toText(): string;
  toString(): string;
}

// Business legal structure types (mirrors Rust enum)
export enum BusinessStructure {
  LLC = 'LLC',
  Corp = 'Corp',
  SoleProp = 'SoleProp',
}

// Listing status types (mirrors Rust enum)
export enum ListingStatus {
  Active = 'Active',
  Matched = 'Matched',
  Sold = 'Sold',
  Withdrawn = 'Withdrawn',
}

// Deal/negotiation status types (mirrors Rust enum)
export enum DealStatus {
  Active = 'Active',
  InNegotiation = 'InNegotiation',
  InEscrow = 'InEscrow',
  Completed = 'Completed',
  Disputed = 'Disputed',
}

// Offer status types (mirrors Rust enum)
export enum OfferStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Countered = 'Countered',
}

// Complete business listing structure (mirrors Rust DealNFT struct)
export interface DealNFT {
  // Core identifiers
  id: bigint;
  seller_principal: Principal;
  
  // Business snapshot fields
  title: string;
  description: string;
  website_url: string;
  logo_url: string;
  
  // Financial metrics fields (in USD)
  arr_usd: bigint; // Annual Recurring Revenue
  mrr_usd: bigint; // Monthly Recurring Revenue
  churn_pct: number; // Monthly churn rate percentage (0.0-100.0)
  gross_margin_pct: number; // Gross margin percentage (0.0-100.0)
  net_profit_usd: bigint; // Net profit (last 12 months)
  cac_usd: number; // Customer Acquisition Cost
  ltv_usd: number; // Customer Lifetime Value
  
  // Operational data fields
  tech_stack: string; // Comma-separated technology tags
  num_employees: number; // Full-time employee headcount
  customer_base: string; // One-line customer base summary
  annual_operating_expenses_usd: bigint; // Annual OpEx
  
  // Legal & compliance fields
  business_structure: BusinessStructure;
  registered_address: string;
  tax_id: string; // Masked format: ***-**-1234
  gdpr_compliant: boolean;
  attachments_cid: string | null; // IPFS CID for due diligence documents
  
  // Listing metadata fields
  created_at: bigint; // Unix timestamp (nanoseconds)
  updated_at: bigint; // Unix timestamp (nanoseconds)
  status: ListingStatus;
}

// Request payload for creating a new listing (mirrors Rust CreateDealRequest)
export interface CreateDealRequest {
  title: string;
  description: string;
  website_url: string;
  logo_url: string;
  arr_usd: bigint;
  mrr_usd: bigint;
  churn_pct: number;
  gross_margin_pct: number;
  net_profit_usd: bigint;
  cac_usd: number;
  ltv_usd: number;
  tech_stack: string;
  num_employees: number;
  customer_base: string;
  annual_operating_expenses_usd: bigint;
  business_structure: BusinessStructure;
  registered_address: string;
  tax_id: string;
  gdpr_compliant: boolean;
  attachments_cid: string | null;
}

// Request payload for updating an existing listing (mirrors Rust UpdateDealRequest)
export interface UpdateDealRequest {
  title?: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  arr_usd?: bigint;
  mrr_usd?: bigint;
  churn_pct?: number;
  gross_margin_pct?: number;
  net_profit_usd?: bigint;
  cac_usd?: number;
  ltv_usd?: number;
  tech_stack?: string;
  num_employees?: number;
  customer_base?: string;
  annual_operating_expenses_usd?: bigint;
  business_structure?: BusinessStructure;
  registered_address?: string;
  tax_id?: string;
  gdpr_compliant?: boolean;
  attachments_cid?: string | null;
  status?: ListingStatus;
}

// Purchase offer structure (mirrors Rust Offer struct)
export interface Offer {
  id: bigint;
  deal_id: bigint;
  buyer: Principal;
  amount: bigint;
  equity_percentage: number;
  milestones: Milestone[];
  created_at: bigint;
  status: OfferStatus;
}

// Payment milestone structure (mirrors Rust Milestone struct)
export interface Milestone {
  description: string;
  amount: bigint;
  deadline: bigint; // Unix timestamp
  completed: boolean;
}

// Vote record for dispute resolution (mirrors Rust VoteRecord struct)
export interface VoteRecord {
  voter: Principal;
  vote: boolean; // true for buyer, false for seller
  timestamp: bigint;
}

// API Response types for better error handling
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// Helper type for canister method results
export type CanisterResult<T> = { Ok: T } | { Err: string };

// Utility types for form handling
export interface ListingFormField {
  name: keyof CreateDealRequest;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'url';
  required: boolean;
  placeholder?: string;
  helperText?: string;
}

// UI-specific listing data for table display
export interface ListingTableRow {
  id: string;
  title: string;
  arr: string; // Formatted currency
  mrr: string; // Formatted currency
  status: ListingStatus;
  employees: number;
  created: string; // Formatted date
  updated: string; // Formatted date;
}