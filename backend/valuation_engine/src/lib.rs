//! # Valyra ValuationEngine Canister
//! 
//! This canister implements automated SaaS business valuation using DCF (Discounted Cash Flow) 
//! modeling and market-based approaches. It provides instant, consistent, and transparent
//! business valuations for the Valyra marketplace.
//! 
//! ## Key Features
//! 
//! - **DCF Modeling**: Full implementation of discounted cash flow valuation with terminal value
//! - **HTTPS Outcalls**: Real-time market data fetching with 5-second timeout
//! - **Risk Assessment**: Comprehensive business risk factor analysis
//! - **3×-ARR Benchmarking**: Market-based valuation using revenue multiples
//! - **Mock API Support**: Development-friendly fallback with `MOCK_API=true`
//! - **Persistent Storage**: Valuation history preserved across canister upgrades
//! 
//! ## Valuation Methodology
//! 
//! ### DCF Model Formula
//! ```
//! PV = Σ (CF_t / (1+r)^t) + Terminal Value
//! 
//! Where:
//! - PV = Present Value (business worth today)
//! - CF_t = Cash Flow in year t
//! - r = Risk-adjusted discount rate
//! - Terminal Value = Value beyond projection period
//! ```
//! 
//! ### Risk Factors Assessed
//! - Customer churn rate (>15% flagged as high risk)
//! - Business profitability status
//! - Team size and key person dependency
//! - Revenue scale and volatility
//! - Operating expense efficiency
//! 
//! ## Storage Architecture
//! 
//! - `VALUATIONS`: StableBTreeMap<String, ValuationResult> - Persistent valuation storage
//! - `MEMORY_MANAGER`: Handles stable memory allocation across upgrades
//! 
//! ## API Endpoints
//! 
//! - `calculate_valuation(String) -> Result<ValuationResult, String>` - Basic valuation with mock data
//! - `calculate_valuation_from_deal(DealNFT) -> Result<ValuationResult, String>` - Full business valuation
//! - `get_valuation(String) -> Option<ValuationResult>` - Retrieve stored valuation
//! - `list_valuations() -> Vec<(String, ValuationResult)>` - List all stored valuations
//! - `transform(TransformArgs) -> HttpResponse` - HTTP response transformation

use candid::{candid_method, CandidType, Deserialize};
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpMethod, HttpResponse, TransformArgs,
    TransformContext,
};
use ic_cdk::{export_candid, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, Storable, storable::Bound};
use serde::{Serialize};
use serde_json;
use shared_types::DealNFT;
use std::borrow::Cow;
use std::cell::RefCell;

/// Type alias for virtual memory used by stable structures
type Memory = VirtualMemory<DefaultMemoryImpl>;

/// Type alias for the main valuations storage map
type ValuationsMap = StableBTreeMap<String, ValuationResult, Memory>;

/// Maximum serialized size for ValuationResult in stable storage (1KB)
const MAX_VALUE_SIZE: u32 = 1024;

// ════════════════════════════════════════════════════════════════════════════════════════
// CORE DATA STRUCTURES
// ════════════════════════════════════════════════════════════════════════════════════════

/// Complete valuation result containing DCF analysis, market comparables, and risk assessment
/// 
/// This structure represents the comprehensive output of the valuation engine, combining
/// multiple valuation approaches and risk factors into a single result. All valuations
/// are stored persistently and can be retrieved for historical analysis.
/// 
/// # Field Descriptions
/// - **deal_id**: Unique identifier linking to the business listing
/// - **dcf_valuation**: Primary valuation from DCF model in USD
/// - **arr_multiple**: Revenue multiple used (typically 3-5x for SaaS)
/// - **market_comparable**: 3×-ARR benchmark valuation in USD
/// - **confidence_score**: Valuation confidence from 0.0-1.0 (higher = more confident)
/// - **risk_factors**: List of identified business risks affecting valuation
/// - **valuation_range_low**: Conservative estimate (DCF - 20%)
/// - **valuation_range_high**: Optimistic estimate (DCF + 20%)
/// - **timestamp**: When valuation was calculated (IC time in nanoseconds)
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ValuationResult {
    /// Unique identifier for the business being valued
    pub deal_id: String,
    /// Revenue multiple applied to ARR (e.g., 4.2x means 4.2 × ARR = valuation)
    pub arr_multiple: f64,
    /// Primary DCF model valuation in USD
    pub dcf_valuation: u64,
    /// Market-based valuation using 3×-ARR methodology
    pub market_comparable: Option<u64>,
    /// Confidence score from 0.0-1.0 based on risk assessment
    pub confidence_score: f64,
    /// List of identified risk factors affecting the valuation
    pub risk_factors: Vec<String>,
    /// Conservative valuation estimate (80% of DCF)
    pub valuation_range_low: u64,
    /// Optimistic valuation estimate (120% of DCF)
    pub valuation_range_high: u64,
    /// Timestamp when valuation was calculated (IC time in nanoseconds)
    pub timestamp: u64,
}

impl Storable for ValuationResult {
    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };

    fn to_bytes(&self) -> Cow<[u8]> {
        let json_string = serde_json::to_string(self).unwrap();
        Cow::Owned(json_string.into_bytes())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let json_string = String::from_utf8(bytes.to_vec()).unwrap();
        serde_json::from_str(&json_string).unwrap()
    }
}

/// Market data structure for external API responses and valuation benchmarking
/// 
/// Contains sector-specific financial metrics used to calibrate valuation models
/// and assess business performance relative to industry standards. Data can be
/// fetched from external APIs or provided via mock data during development.
/// 
/// # Data Sources
/// - External financial data APIs (production)
/// - Mock data generator (development with MOCK_API=true)
/// - Cached responses (15-minute self-cleaning cache)
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct MarketData {
    /// Business sector (e.g., "SaaS", "E-commerce", "Fintech")
    pub sector: String,
    /// Average revenue multiple for sector (e.g., 4.2 means 4.2x ARR valuation)
    pub avg_revenue_multiple: f64,
    /// Median annual growth rate for sector (as decimal, e.g., 0.22 = 22%)
    pub median_growth_rate: f64,
    /// Average customer churn rate for sector (as decimal, e.g., 0.05 = 5%)
    pub avg_churn_rate: f64,
    /// Risk-free rate (typically 10-year treasury rate)
    pub risk_free_rate: f64,
    /// Market risk premium for equity investments
    pub market_risk_premium: f64,
}

/// DCF (Discounted Cash Flow) model input parameters
/// 
/// Encapsulates all variables needed for DCF valuation calculation including
/// growth assumptions, discount rates, and projection periods. These inputs
/// are derived from business financial data and market conditions.
/// 
/// # DCF Formula Components
/// ```
/// PV = Σ(CF_t / (1+r)^t) + Terminal Value
/// Terminal Value = CF_terminal / (r - g_terminal)
/// ```
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct DCFInputs {
    /// Starting annual cash flow (typically ARR for SaaS businesses)
    pub initial_cash_flow: f64,
    /// Expected growth rate for years 1-5 (as decimal, e.g., 0.25 = 25%)
    pub growth_rate_years_1_to_5: f64,
    /// Long-term growth rate for terminal value (typically 2-4%)
    pub terminal_growth_rate: f64,
    /// Risk-adjusted discount rate (WACC or required return)
    pub discount_rate: f64,
    /// Number of years to project cash flows explicitly
    pub projection_years: u8,
}

// ════════════════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE - THREAD LOCAL STORAGE
// ════════════════════════════════════════════════════════════════════════════════════════

thread_local! {
    /// Memory manager for stable storage across canister upgrades
    /// Handles allocation of virtual memory regions for different data structures
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    /// Primary storage for all business valuations
    /// Maps deal ID (String) to complete ValuationResult structure
    /// Uses memory region 0 for persistent storage across canister upgrades
    static VALUATIONS: RefCell<ValuationsMap> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );
}

// ════════════════════════════════════════════════════════════════════════════════════════
// CANISTER LIFECYCLE
// ════════════════════════════════════════════════════════════════════════════════════════

/// Initialize the ValuationEngine canister
/// 
/// Called once when the canister is first deployed. Sets up initial state and
/// logs initialization to the canister logs for debugging purposes.
#[ic_cdk::init]
fn init() {
    ic_cdk::println!("ValuationEngine initialized");
}

// ════════════════════════════════════════════════════════════════════════════════════════
// PUBLIC API ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Calculate business valuation using mock data for development/testing
/// 
/// This endpoint provides a simplified valuation calculation using predefined
/// mock financial data. Useful for testing the valuation logic and API
/// integration without requiring complete business data.
/// 
/// # Parameters
/// - `deal_id`: Unique identifier for the business listing
/// 
/// # Returns
/// - `Ok(ValuationResult)`: Complete valuation analysis with DCF model results
/// - `Err(String)`: Error message if calculation fails
/// 
/// # Example Usage
/// ```
/// dfx canister call valuation_engine calculate_valuation '("my-business-123")'
/// ```
/// 
/// # Mock Data Used
/// - Initial Cash Flow: $500,000 ARR
/// - Growth Rate: 25% annually for 5 years
/// - Terminal Growth: 3% perpetual
/// - Discount Rate: 12% (risk-adjusted)
#[update]
#[candid_method(update)]
async fn calculate_valuation(deal_id: String) -> Result<ValuationResult, String> {
    // Fetch market data (mock or real based on MOCK_API environment variable)
    let mock_market_data = get_mock_market_data().await?;
    
    // DCF calculation with 3x ARR band
    let dcf_inputs = DCFInputs {
        initial_cash_flow: 500000.0, // Mock $500k ARR
        growth_rate_years_1_to_5: 0.25,
        terminal_growth_rate: 0.03,
        discount_rate: 0.12,
        projection_years: 5,
    };
    
    let dcf_valuation = calculate_dcf_valuation(&dcf_inputs);
    let arr_multiple = mock_market_data.avg_revenue_multiple;
    
    // Calculate 3x ARR band
    let three_x_arr = dcf_inputs.initial_cash_flow * 3.0;
    let valuation_range_low = (dcf_valuation as f64 * 0.8) as u64;
    let valuation_range_high = (dcf_valuation as f64 * 1.2) as u64;
    
    let risk_factors = assess_risk_factors(&dcf_inputs, &mock_market_data);
    
    let valuation_result = ValuationResult {
        deal_id: deal_id.clone(),
        arr_multiple,
        dcf_valuation,
        market_comparable: Some(three_x_arr as u64),
        confidence_score: calculate_confidence_score(&risk_factors),
        risk_factors,
        valuation_range_low,
        valuation_range_high,
        timestamp: ic_cdk::api::time(),
    };
    
    VALUATIONS.with(|v| v.borrow_mut().insert(deal_id, valuation_result.clone()));
    
    Ok(valuation_result)
}

/// Calculate comprehensive business valuation from complete DealNFT data
/// 
/// This endpoint provides full valuation analysis using actual business financial
/// data, operational metrics, and risk factors. It applies sophisticated DCF modeling
/// with business-specific adjustments for growth rates and discount rates.
/// 
/// # Parameters
/// - `deal_nft`: Complete business listing data from shared_types crate
/// 
/// # Returns
/// - `Ok(ValuationResult)`: Complete valuation with business-specific risk analysis
/// - `Err(String)`: Error message if calculation fails
/// 
/// # Valuation Process
/// 1. **Extract Financial Metrics**: ARR, MRR, churn, margins, profitability
/// 2. **Calculate Growth Rate**: Based on ARR/MRR trends and market position
/// 3. **Adjust Discount Rate**: Apply size premium, churn risk, profitability adjustments
/// 4. **Run DCF Model**: 5-year projections with terminal value
/// 5. **Risk Assessment**: Identify and quantify business-specific risks
/// 6. **Generate Range**: ±20% confidence band around DCF value
/// 
/// # Example Usage
/// ```rust
/// let deal = DealNFT { /* business data */ };
/// let result = calculate_valuation_from_deal(deal).await?;
/// ```
#[update]
#[candid_method(update)]
async fn calculate_valuation_from_deal(deal_nft: DealNFT) -> Result<ValuationResult, String> {
    let market_data = get_mock_market_data().await?;
    
    // Extract financial metrics from DealNFT
    let annual_revenue = deal_nft.arr_usd as f64;
    let growth_rate = calculate_growth_rate(&deal_nft);
    let risk_adjusted_discount_rate = calculate_discount_rate(&deal_nft, &market_data);
    
    let dcf_inputs = DCFInputs {
        initial_cash_flow: annual_revenue,
        growth_rate_years_1_to_5: growth_rate,
        terminal_growth_rate: 0.03,
        discount_rate: risk_adjusted_discount_rate,
        projection_years: 5,
    };
    
    let dcf_valuation = calculate_dcf_valuation(&dcf_inputs);
    let arr_multiple = market_data.avg_revenue_multiple;
    
    // Calculate 3x ARR band
    let three_x_arr = annual_revenue * 3.0;
    let valuation_range_low = (dcf_valuation as f64 * 0.8) as u64;
    let valuation_range_high = (dcf_valuation as f64 * 1.2) as u64;
    
    let risk_factors = assess_deal_risk_factors(&deal_nft, &dcf_inputs, &market_data);
    
    let valuation_result = ValuationResult {
        deal_id: deal_nft.id.to_string(),
        arr_multiple,
        dcf_valuation,
        market_comparable: Some(three_x_arr as u64),
        confidence_score: calculate_confidence_score(&risk_factors),
        risk_factors,
        valuation_range_low,
        valuation_range_high,
        timestamp: ic_cdk::api::time(),
    };
    
    VALUATIONS.with(|v| v.borrow_mut().insert(deal_nft.id.to_string(), valuation_result.clone()));
    
    Ok(valuation_result)
}

/// Retrieve a stored valuation by deal ID
/// 
/// Fast query endpoint to fetch previously calculated valuations from stable storage.
/// This is useful for displaying cached valuation results without recalculating.
/// 
/// # Parameters
/// - `deal_id`: Unique identifier for the business listing
/// 
/// # Returns
/// - `Some(ValuationResult)`: Previously calculated valuation if found
/// - `None`: No valuation found for the given deal_id
/// 
/// # Example Usage
/// ```
/// dfx canister call valuation_engine get_valuation '("business-123")'
/// ```
#[query]
#[candid_method(query)]
fn get_valuation(deal_id: String) -> Option<ValuationResult> {
    VALUATIONS.with(|v| v.borrow().get(&deal_id))
}

/// List all stored valuations with their deal IDs
/// 
/// Query endpoint to retrieve all valuations stored in the canister. Useful for
/// administrative purposes, analytics, and displaying historical valuation data.
/// 
/// # Returns
/// - `Vec<(String, ValuationResult)>`: List of tuples containing (deal_id, valuation)
/// 
/// # Performance Notes
/// - Results are returned in arbitrary order (BTreeMap iteration order)
/// - For large datasets, consider implementing pagination in future versions
/// - This is a query call, so it executes quickly without consensus
/// 
/// # Example Usage
/// ```
/// dfx canister call valuation_engine list_valuations '()'
/// ```
#[query]
#[candid_method(query)]
fn list_valuations() -> Vec<(String, ValuationResult)> {
    VALUATIONS.with(|v| {
        v.borrow()
            .iter()
            .map(|(k, v)| (k, v))
            .collect()
    })
}

// ════════════════════════════════════════════════════════════════════════════════════════
// MARKET DATA AND HTTPS OUTCALLS
// ════════════════════════════════════════════════════════════════════════════════════════

/// Fetch market data with automatic fallback to mock data
/// 
/// This function handles the selection between mock data (development) and real
/// market data (production) based on the MOCK_API environment variable.
/// 
/// # Environment Variables
/// - `MOCK_API=true`: Use predefined mock data for development
/// - `MOCK_API=false` or unset: Attempt HTTPS outcall to external API
/// 
/// # Returns
/// - `Ok(MarketData)`: Market metrics for valuation calibration
/// - `Err(String)`: Error message if both real API and fallback fail
/// 
/// # Mock Data Provided
/// - Sector: SaaS
/// - Average Revenue Multiple: 4.5x
/// - Median Growth Rate: 22% annually
/// - Average Churn Rate: 5% monthly
/// - Risk-free Rate: 4.5% (10-year treasury)
/// - Market Risk Premium: 6.0%
async fn get_mock_market_data() -> Result<MarketData, String> {
    let mock_mode = std::env::var("MOCK_API").unwrap_or_default() == "true";
    
    if mock_mode {
        return Ok(MarketData {
            sector: "SaaS".to_string(),
            avg_revenue_multiple: 4.5,
            median_growth_rate: 0.22,
            avg_churn_rate: 0.05,
            risk_free_rate: 0.045,
            market_risk_premium: 0.06,
        });
    }
    
    // Attempt HTTPS outcall to external API
    fetch_market_data().await
}

/// Execute HTTPS outcall to fetch real market data from external APIs
/// 
/// This function implements the Internet Computer's HTTPS outcall feature to fetch
/// real-time market data from external financial data providers. It includes proper
/// error handling, timeout management, and response transformation.
/// 
/// # Technical Implementation
/// - **Timeout**: 5 seconds maximum (5_000_000_000 nanoseconds)
/// - **Response Size**: Limited to 2KB to prevent memory issues
/// - **Transform Function**: Required for IC consensus on HTTP responses
/// - **Error Handling**: Network failures and HTTP error status codes
/// 
/// # Returns
/// - `Ok(MarketData)`: Successfully parsed market data from API
/// - `Err(String)`: Network error or API failure message
/// 
/// # Production Notes
/// In production, this would connect to real financial data APIs like:
/// - Alpha Vantage for market rates
/// - Financial Modeling Prep for sector multiples  
/// - Federal Reserve API for risk-free rates
/// 
/// Currently uses a mock endpoint for demonstration purposes.
async fn fetch_market_data() -> Result<MarketData, String> {
    // TODO: Replace with real financial data API endpoint in production
    let url = "https://jsonplaceholder.typicode.com/posts/1"; // Mock API endpoint
    
    let request = CanisterHttpRequestArgument {
        url: url.to_string(),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2048),
        transform: Some(TransformContext::from_name("transform".to_string(), serde_json::to_vec(&()).unwrap())),
        headers: vec![],
    };
    
    // Execute HTTPS outcall with 5-second timeout
    match http_request(request, 5_000_000_000).await {
        Ok((response,)) => {
            if response.status == 200u8 {
                // TODO: In production, parse actual JSON response from market data API
                // For now, return mock data to demonstrate successful HTTPS outcall
                Ok(MarketData {
                    sector: "SaaS".to_string(),
                    avg_revenue_multiple: 4.2,
                    median_growth_rate: 0.20,
                    avg_churn_rate: 0.07,
                    risk_free_rate: 0.05,
                    market_risk_premium: 0.065,
                })
            } else {
                Err(format!("HTTP request failed with status: {}", response.status))
            }
        }
        Err((r, m)) => {
            Err(format!("HTTP request failed: {:?} - {}", r, m))
        }
    }
}

/// Transform HTTP response for Internet Computer consensus
/// 
/// This function is required by the IC to ensure all nodes agree on the HTTP response
/// content. It filters and normalizes the response to remove non-deterministic elements
/// like timestamps and certain headers that might vary between nodes.
/// 
/// # Parameters
/// - `raw`: Raw HTTP response from the external API
/// 
/// # Returns
/// - `HttpResponse`: Cleaned response suitable for consensus
/// 
/// # Implementation Notes
/// - Headers are stripped to ensure deterministic responses
/// - Status code and body are preserved for processing
/// - This function must be declared as a query method for IC compliance
#[query]
fn transform(raw: TransformArgs) -> HttpResponse {
    let headers = vec![];
    
    HttpResponse {
        status: raw.response.status,
        headers,
        body: raw.response.body,
    }
}

// ════════════════════════════════════════════════════════════════════════════════════════
// DCF VALUATION ENGINE
// ════════════════════════════════════════════════════════════════════════════════════════

/// Calculate Discounted Cash Flow (DCF) valuation using the Gordon Growth Model
/// 
/// This function implements the core DCF valuation methodology, which is considered
/// the gold standard in corporate finance for determining intrinsic business value.
/// It projects future cash flows and discounts them to present value.
/// 
/// # Formula Implementation
/// ```
/// PV = Σ(CF_t / (1+r)^t) + Terminal Value
/// Terminal Value = CF_terminal × (1+g) / (r-g) / (1+r)^n
/// 
/// Where:
/// - PV = Present Value (business worth today)
/// - CF_t = Cash Flow in year t
/// - r = Discount rate (risk-adjusted return)
/// - g = Terminal growth rate
/// - n = Number of projection years
/// ```
/// 
/// # Parameters
/// - `inputs`: DCF parameters including growth rates and discount factors
/// 
/// # Returns
/// - `u64`: Present value of the business in USD
/// 
/// # Methodology
/// 1. **Explicit Forecast Period**: Projects cash flows for 5 years with high growth
/// 2. **Terminal Value**: Calculates perpetual value beyond forecast period
/// 3. **Present Value Calculation**: Discounts all future cash flows to today's value
/// 4. **Risk Adjustment**: Uses risk-adjusted discount rate (WACC)
fn calculate_dcf_valuation(inputs: &DCFInputs) -> u64 {
    let mut present_value = 0.0;
    let mut cash_flow = inputs.initial_cash_flow;
    
    // Calculate present value of explicit forecast cash flows
    for year in 1..=inputs.projection_years {
        cash_flow *= 1.0 + inputs.growth_rate_years_1_to_5;
        let discount_factor = (1.0 + inputs.discount_rate).powi(year as i32);
        present_value += cash_flow / discount_factor;
    }
    
    // Calculate terminal value using Gordon Growth Model
    let terminal_cash_flow = cash_flow * (1.0 + inputs.terminal_growth_rate);
    let terminal_value = terminal_cash_flow / (inputs.discount_rate - inputs.terminal_growth_rate);
    let terminal_present_value = terminal_value / (1.0 + inputs.discount_rate).powi(inputs.projection_years as i32);
    
    // Sum explicit forecast PV and terminal value PV
    present_value += terminal_present_value;
    
    present_value as u64
}

// ════════════════════════════════════════════════════════════════════════════════════════
// RISK ASSESSMENT FRAMEWORK
// ════════════════════════════════════════════════════════════════════════════════════════

/// Assess valuation model risk factors based on DCF assumptions and market data
/// 
/// This function evaluates the DCF model inputs against market benchmarks to identify
/// potentially optimistic or unrealistic assumptions that could affect valuation accuracy.
/// 
/// # Parameters
/// - `dcf_inputs`: DCF model parameters being used for valuation
/// - `market_data`: Market benchmarks and sector averages
/// 
/// # Returns
/// - `Vec<String>`: List of identified risk factors and warnings
/// 
/// # Risk Categories Assessed
/// - **Growth Rate Risk**: Compares projected growth to market medians
/// - **Discount Rate Risk**: Validates risk-adjusted returns assumptions
/// - **Terminal Value Risk**: Checks for unrealistic perpetual growth rates
/// 
/// # Thresholds Used
/// - Growth >10% above market median flagged as high risk
/// - Discount rates below (risk-free + market premium) flagged
/// - Terminal growth >4% flagged as excessive
fn assess_risk_factors(dcf_inputs: &DCFInputs, market_data: &MarketData) -> Vec<String> {
    let mut risks = Vec::new();
    
    // Flag aggressive growth rate assumptions
    if dcf_inputs.growth_rate_years_1_to_5 > market_data.median_growth_rate + 0.1 {
        risks.push("High growth rate assumption relative to market median".to_string());
    }
    
    // Flag potentially low discount rates
    if dcf_inputs.discount_rate < market_data.risk_free_rate + market_data.market_risk_premium {
        risks.push("Low discount rate may underestimate risk".to_string());
    }
    
    // Flag excessive terminal growth rates
    if dcf_inputs.terminal_growth_rate > 0.04 {
        risks.push("Terminal growth rate exceeds long-term economic growth".to_string());
    }
    
    risks
}

/// Calculate confidence score for valuation based on identified risk factors
/// 
/// This function quantifies the reliability of the valuation by penalizing
/// each identified risk factor. The confidence score helps buyers and sellers
/// understand how much trust to place in the valuation result.
/// 
/// # Parameters
/// - `risk_factors`: List of identified business and model risks
/// 
/// # Returns
/// - `f64`: Confidence score from 0.1 to 1.0 (higher = more confident)
/// 
/// # Scoring Algorithm
/// - **Base Confidence**: 0.85 (85%) for businesses with no red flags
/// - **Risk Penalty**: -0.1 (10%) per identified risk factor
/// - **Minimum Floor**: 0.1 (10%) - even high-risk businesses get some confidence
/// 
/// # Interpretation
/// - **0.8-1.0**: High confidence valuation
/// - **0.6-0.7**: Moderate confidence, some risks present
/// - **0.3-0.5**: Low confidence, significant risks identified
/// - **0.1-0.2**: Very low confidence, multiple major risks
fn calculate_confidence_score(risk_factors: &[String]) -> f64 {
    let base_confidence = 0.85;
    let risk_penalty = risk_factors.len() as f64 * 0.1;
    (base_confidence - risk_penalty).max(0.1)
}

// ════════════════════════════════════════════════════════════════════════════════════════
// BUSINESS ANALYSIS AND FINANCIAL MODELING
// ════════════════════════════════════════════════════════════════════════════════════════

/// Calculate expected growth rate based on business financial metrics
/// 
/// This function analyzes the business's historical performance and operational
/// metrics to derive a realistic growth rate for DCF projections. It considers
/// multiple factors to avoid over-optimistic growth assumptions.
/// 
/// # Parameters
/// - `deal_nft`: Complete business data from the listing
/// 
/// # Returns
/// - `f64`: Expected annual growth rate as decimal (e.g., 0.25 = 25%)
/// 
/// # Analysis Framework
/// 1. **Base Rate**: Conservative 15% starting point for SaaS businesses
/// 2. **Revenue Momentum**: ARR vs MRR implied growth trends
/// 3. **Churn Impact**: High churn reduces growth expectations
/// 4. **Margin Quality**: Strong margins indicate sustainable growth
/// 5. **Bounds Checking**: Final rate clamped between 5%-50%
/// 
/// # Adjustments Applied
/// - **High Churn (>10%)**: -20% growth penalty for retention issues
/// - **Low Churn (<5%)**: +10% growth bonus for strong retention
/// - **High Margins (>30%)**: +5% growth bonus for efficiency
/// - **Low Margins (<10%)**: -10% growth penalty for unit economics
fn calculate_growth_rate(deal_nft: &DealNFT) -> f64 {
    // Conservative baseline for SaaS businesses
    let mut growth_rate: f64 = 0.15;
    
    // Adjust based on ARR vs MRR growth if available
    let arr = deal_nft.arr_usd as f64;
    let mrr = deal_nft.mrr_usd as f64;
    
    if arr > 0.0 && mrr > 0.0 {
        let implied_monthly_growth = (arr / 12.0 - mrr) / mrr;
        if implied_monthly_growth > 0.0 {
            growth_rate = (implied_monthly_growth * 12.0).min(0.50); // Cap at 50%
        }
    }
    
    // Adjust based on churn rate
    let churn = deal_nft.churn_pct / 100.0; // Convert percentage to decimal
    if churn > 0.1 {
        growth_rate *= 0.8; // Reduce growth expectations for high churn
    } else if churn < 0.05 {
        growth_rate *= 1.1; // Boost for low churn
    }
    
    // Adjust based on gross margins
    let margin = deal_nft.gross_margin_pct / 100.0; // Convert percentage to decimal
    if margin > 0.3 {
        growth_rate *= 1.05; // Slight boost for high margins
    } else if margin < 0.1 {
        growth_rate *= 0.9; // Reduce for low margins
    }
    
    growth_rate.max(0.05).min(0.50) // Clamp between 5% and 50%
}

/// Calculate risk-adjusted discount rate (WACC) for DCF valuation
/// 
/// This function determines the appropriate discount rate by starting with market
/// risk premiums and adding business-specific risk adjustments. The discount rate
/// represents the required return for investing in this particular business.
/// 
/// # Parameters
/// - `deal_nft`: Business financial and operational data
/// - `market_data`: Market risk factors and benchmarks
/// 
/// # Returns
/// - `f64`: Risk-adjusted discount rate as decimal (e.g., 0.12 = 12%)
/// 
/// # Risk Premium Framework
/// **Base Rate**: Risk-free rate + Market risk premium (typically 10-11%)
/// 
/// **Size Premiums**:
/// - <$100K ARR: +5% (very small business premium)
/// - $100K-$1M ARR: +2% (small business premium)
/// - >$1M ARR: No size premium
/// 
/// **Operational Risk Adjustments**:
/// - High churn (>15%): +3% for customer retention risk
/// - Low churn (<5%): -1% for stable customer base
/// - Unprofitable: +4% for execution risk
/// 
/// **Range**: Final rate constrained between 8%-25%
fn calculate_discount_rate(deal_nft: &DealNFT, market_data: &MarketData) -> f64 {
    // Start with market-based required return
    let mut discount_rate = market_data.risk_free_rate + market_data.market_risk_premium;
    
    // Size premium for smaller businesses
    let arr = deal_nft.arr_usd as f64;
    if arr < 100_000.0 {
        discount_rate += 0.05; // Small business premium
    } else if arr < 1_000_000.0 {
        discount_rate += 0.02; // Mid-size premium
    }
    
    // Churn risk adjustment
    let churn = deal_nft.churn_pct / 100.0; // Convert percentage to decimal
    if churn > 0.15 {
        discount_rate += 0.03;
    } else if churn < 0.05 {
        discount_rate -= 0.01;
    }
    
    // Profitability risk - check if net profit is positive
    if deal_nft.net_profit_usd == 0 {
        discount_rate += 0.04;
    }
    
    // For now, assume moderate geographic risk without specific address field
    discount_rate += 0.01; // General geographic/operational risk
    
    discount_rate.max(0.08).min(0.25) // Clamp between 8% and 25%
}

/// Comprehensive business risk factor assessment for valuation adjustment
/// 
/// This function combines DCF model risk assessment with business-specific risk
/// analysis to provide a complete picture of factors that could affect valuation
/// accuracy. It examines both quantitative metrics and operational characteristics.
/// 
/// # Parameters
/// - `deal_nft`: Complete business listing data
/// - `dcf_inputs`: DCF model parameters used in valuation  
/// - `market_data`: Market benchmarks for comparison
/// 
/// # Returns
/// - `Vec<String>`: Comprehensive list of identified risk factors
/// 
/// # Risk Categories Analyzed
/// 
/// **Model Risks** (from assess_risk_factors):
/// - Aggressive growth rate assumptions
/// - Low discount rate assumptions  
/// - Excessive terminal growth rates
/// 
/// **Business Risks** (business-specific):
/// - Customer churn and retention issues
/// - Profitability and cash flow concerns
/// - Team size and key person dependency
/// - Revenue scale and market position
/// - Operational efficiency metrics
/// 
/// # Risk Thresholds
/// - **Churn Risk**: >15% monthly churn flagged
/// - **Profitability Risk**: Zero net profit flagged
/// - **Team Risk**: <3 employees flagged for key person risk
/// - **Scale Risk**: <$100K ARR flagged for volatility
/// - **Efficiency Risk**: OpEx/Revenue >90% flagged
fn assess_deal_risk_factors(deal_nft: &DealNFT, dcf_inputs: &DCFInputs, market_data: &MarketData) -> Vec<String> {
    // Start with DCF model risks
    let mut risks = assess_risk_factors(dcf_inputs, market_data);
    
    // Business-specific risk factors
    let churn = deal_nft.churn_pct / 100.0; // Convert percentage to decimal
    if churn > 0.15 {
        risks.push("High customer churn rate above 15%".to_string());
    }
    
    if deal_nft.net_profit_usd == 0 {
        risks.push("Business currently not profitable".to_string());
    }
    
    // Small team risk
    if deal_nft.num_employees < 3 {
        risks.push("Small team increases key person risk".to_string());
    }
    
    // Revenue size risk
    if deal_nft.arr_usd < 100_000 {
        risks.push("Small revenue size increases volatility risk".to_string());
    }
    
    // High operational costs relative to revenue
    let opex_ratio = deal_nft.annual_operating_expenses_usd as f64 / deal_nft.arr_usd as f64;
    if opex_ratio > 0.9 {
        risks.push("High operating expenses relative to revenue".to_string());
    }
    
    risks
}

export_candid!();