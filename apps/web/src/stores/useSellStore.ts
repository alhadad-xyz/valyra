import { create } from 'zustand';

export type AssetType = 'saas' | 'ecommerce' | 'content' | 'community' | 'other';
export type RevenueTrend = 'growing' | 'stable' | 'declining';
export type VerificationLevel = 'BASIC' | 'STANDARD' | 'ENHANCED';

interface SellState {
    // Wizard Step
    step: number;

    // Basic Info
    title: string;
    description: string;
    websiteUrl: string;
    assetType: AssetType;

    // Included Assets
    includeDomain: boolean;
    includeCode: boolean;
    includeCustomerData: boolean;

    // Tech & Stats (NEW)
    techStack: string[];
    customerCount: string;
    repoUrl: string;

    // Financials
    mrr: string;
    annualRevenue: string;
    monthlyProfit: string;
    monthlyExpenses: string;
    revenueTrend: RevenueTrend;

    // Pricing
    price: string;
    verificationLevel: VerificationLevel;

    // IP Assignment (NEW)
    ipAssignmentHash: string | null;
    sellerSignature: string | null;
    ipSignedAt: number | null;

    // Actions
    setField: (field: keyof SellState, value: any) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
    setListing: (listing: any) => void;
}

export const useSellStore = create<SellState>((set) => ({
    step: 1,

    // Basic Info
    title: '',
    description: '',
    websiteUrl: '',
    assetType: 'saas',

    // Included Assets
    includeDomain: false,
    includeCode: false,
    includeCustomerData: false,

    // Tech & Stats
    techStack: [],
    customerCount: '',
    repoUrl: '',

    // Financials
    mrr: '',
    annualRevenue: '',
    monthlyProfit: '',
    monthlyExpenses: '',
    revenueTrend: 'stable',

    // Pricing
    price: '',
    verificationLevel: 'BASIC',

    // IP Assignment
    ipAssignmentHash: null,
    sellerSignature: null,
    ipSignedAt: null,

    setField: (field, value) => set((state) => ({ ...state, [field]: value })),

    nextStep: () => set((state) => ({ step: state.step + 1 })),

    prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

    reset: () => set({
        step: 1,
        title: '',
        description: '',
        websiteUrl: '',
        assetType: 'saas',
        includeDomain: false,
        includeCode: false,
        includeCustomerData: false,
        techStack: [],
        customerCount: '',
        repoUrl: '',
        mrr: '',
        annualRevenue: '',
        monthlyProfit: '',
        monthlyExpenses: '',
        revenueTrend: 'stable',
        price: '',
        verificationLevel: 'BASIC',
        ipAssignmentHash: null,
        sellerSignature: null,
        ipSignedAt: null
    }),

    setListing: (listing: any) => set({
        // Map listing response to store state
        title: listing.asset_name,
        description: listing.description,
        websiteUrl: listing.business_url,
        assetType: listing.asset_type,

        includeDomain: listing.domain_included,
        includeCode: listing.source_code_included,
        includeCustomerData: listing.customer_data_included,

        techStack: Object.keys(listing.tech_stack || {}),
        customerCount: listing.customer_count?.toString() || '',
        repoUrl: listing.tech_stack?.repo_url || '',

        mrr: listing.mrr?.toString() || '',
        annualRevenue: listing.annual_revenue?.toString() || '',
        monthlyProfit: listing.monthly_profit?.toString() || '',
        monthlyExpenses: listing.monthly_expenses?.toString() || '',
        revenueTrend: listing.revenue_trend || 'stable',

        price: listing.asking_price?.toString() || '',
        verificationLevel: listing.verified_level > 0 ? 'STANDARD' : 'BASIC', // Approximate mapping

        // Preserve IP signature if present
        ipAssignmentHash: listing.ip_assignment_hash,
        sellerSignature: listing.seller_signature,

        step: 1 // Always start at step 1 when editing
    })
}));
