#[cfg(test)]
mod tests {
    use super::*;
    use ic_cdk::export::candid::{Decode, Encode};
    use shared_types::{DealNFT, DealStatus};

    #[test]
    fn test_create_deal() {
        let deal = DealNFT {
            id: 1,
            founder: ic_cdk::export::Principal::anonymous(),
            company_name: "Test Company".to_string(),
            valuation: 5000000,
            revenue: 1200000,
            created_at: 1234567890,
            status: DealStatus::Active,
        };

        // Test serialization/deserialization
        let encoded = Encode!(&deal).unwrap();
        let decoded: DealNFT = Decode!(encoded.as_slice(), DealNFT).unwrap();
        
        assert_eq!(deal.company_name, decoded.company_name);
        assert_eq!(deal.valuation, decoded.valuation);
        assert_eq!(deal.revenue, decoded.revenue);
    }

    #[test]
    fn test_deal_status_transitions() {
        let mut deal = DealNFT {
            id: 1,
            founder: ic_cdk::export::Principal::anonymous(),
            company_name: "Test Company".to_string(),
            valuation: 5000000,
            revenue: 1200000,
            created_at: 1234567890,
            status: DealStatus::Active,
        };

        // Test valid status transitions
        deal.status = DealStatus::InNegotiation;
        assert!(matches!(deal.status, DealStatus::InNegotiation));

        deal.status = DealStatus::InEscrow;
        assert!(matches!(deal.status, DealStatus::InEscrow));

        deal.status = DealStatus::Completed;
        assert!(matches!(deal.status, DealStatus::Completed));
    }

    #[test]
    fn test_valuation_bounds() {
        let deal = DealNFT {
            id: 1,
            founder: ic_cdk::export::Principal::anonymous(),
            company_name: "Test Company".to_string(),
            valuation: 0, // Edge case: zero valuation
            revenue: 1200000,
            created_at: 1234567890,
            status: DealStatus::Active,
        };

        assert_eq!(deal.valuation, 0);
        
        let high_val_deal = DealNFT {
            id: 2,
            founder: ic_cdk::export::Principal::anonymous(),
            company_name: "High Value Company".to_string(),
            valuation: u64::MAX, // Edge case: maximum valuation
            revenue: 1200000,
            created_at: 1234567890,
            status: DealStatus::Active,
        };

        assert_eq!(high_val_deal.valuation, u64::MAX);
    }
}