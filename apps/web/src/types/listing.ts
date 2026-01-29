export interface Listing {
    id: string;
    asset_name: string;
    asset_type: string;
    business_url?: string;
    description: string;
    asking_price: number;
    mrr: number;
    annual_revenue: number; // or string
    monthly_profit: number;
    monthly_expenses: number;
    mrr: number;
    annual_revenue: number; // or string
    monthly_profit: number;
    monthly_expenses: number;
    revenue_trend?: string; // enum

    // Asset Inclusions
    domain_included?: boolean;
    source_code_included?: boolean;
    customer_data_included?: boolean;
    customer_count?: number;

    // Status
    status: string;
    verification_status: string;
    verified_level: number;

    // Dates
    created_at: string;
    updated_at: string;

    // Frontend Specific / Optional
    image?: string;
    category?: string; // Mapped from asset_type or separate?
    tech_stack?: any; // Dict
    view_count?: number;
    listing_id?: string; // Sometimes used alias
}
