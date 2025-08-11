use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use ic_stable_structures::Storable;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct DealNFT {
    pub id: u64,
    pub founder: Principal,
    pub company_name: String,
    pub valuation: u64,
    pub revenue: u64,
    pub created_at: u64,
    pub status: DealStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum DealStatus {
    Active,
    InNegotiation,
    InEscrow,
    Completed,
    Disputed,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Offer {
    pub id: u64,
    pub deal_id: u64,
    pub buyer: Principal,
    pub amount: u64,
    pub equity_percentage: f64,
    pub milestones: Vec<Milestone>,
    pub created_at: u64,
    pub status: OfferStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum OfferStatus {
    Pending,
    Accepted,
    Rejected,
    Countered,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Milestone {
    pub description: String,
    pub amount: u64,
    pub deadline: u64,
    pub completed: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct VoteRecord {
    pub voter: Principal,
    pub vote: bool,
    pub timestamp: u64,
}

impl Storable for DealNFT {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = 
        ic_stable_structures::storable::Bound::Bounded { max_size: 2048, is_fixed_size: false };
}

impl Storable for Offer {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        std::borrow::Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: ic_stable_structures::storable::Bound = 
        ic_stable_structures::storable::Bound::Bounded { max_size: 4096, is_fixed_size: false };
}