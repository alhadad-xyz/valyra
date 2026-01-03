# PRD: Valyra (Autonomous M&A Agent Marketplace)

**Author:** alhadad
**Date:** December 11, 2025
**Status:** Hackathon MVP Phase
**Version:** 2.4 (Final Refinements)

---

## Background
The "Creator Economy" and "Indie Hacker" movements in Indonesia have led to an explosion of micro-startups, SaaS tools, and niche e-commerce stores. However, these digital assets are highly illiquid. Selling a business with $2,000 - $50,000 annual revenue is currently a nightmare: it's too small for investment banks/brokers, but too complex for simple peer-to-peer transfers due to trust issues. **Valyra** utilizes the speed of the Base L2 blockchain and the intelligence of Coinbase AgentKit to automate this process, creating a "self-driving" M&A experience.

## Problem Statement
**The Core Problem:** The process of selling a micro-startup is inefficient, expensive, and riddled with trust issues.
* **Quantitative Data:** Traditional business brokers charge 15% success fees and minimum retainers, making them inaccessible for exits under $100k.
* **Qualitative Data:** Buyers on forums (like Facebook Groups or Kaskus) fear scams ("transfer money, get blocked"), while sellers fear giving up credentials without payment.
* **Secondary Issues:** Subjective valuation (sellers overvaluing emotional effort) and lack of standardized due diligence.

## Market Opportunity
* **Trends:** The rise of "Micro-Private Equity" (people buying small profitable SaaS instead of building from scratch).
* **Market Need:** A standardized, trustless rail for exchanging digital business ownership.
* **Differentiation:** Unlike *Flippa* or *Acquire.com* which are Web2 listings requiring manual negotiation and expensive escrow, **Valyra** uses AI Agents to negotiate and Smart Contracts to settle transactions instantly using IDRX (Rupiah Stablecoin) with near-zero fees and a transparent 2.5% platform fee.

## User Personas
1.  **Rian (The Seller - Indie Hacker):**
    * *Needs:* Wants to sell his side-project (SaaS) to fund his next idea. Hates paperwork.
    * *Pain Point:* Doesn't know how to value his business; afraid of tire-kickers.
2.  **Sari (The Buyer - Micro-Investor):**
    * *Needs:* Passive income assets.
    * *Pain Point:* Scared of buying a "fake" business; overwhelmed by technical due diligence.

## Vision Statement
To build the world's first autonomous marketplace where buying a company is as fast, transparent, and secure as buying a token on a DEX, powered by the Base ecosystem.

## Product Origin
The idea originated from the frustration of seeing excellent Indonesian micro-startups die because the founders couldn't find a buyer, while investors sat on capital because they couldn't trust the sellers. We realized that **AI Agents** (for due diligence) + **Smart Contracts** (for escrow) could replace the human broker entirely.

---

## Objectives

### SMART Goals
* **Specific:** Launch a functional MVP on Base Mainnet allowing a user to list a dummy asset and another user to "buy" it using IDRX.
* **Measurable:** Successful integration of Coinbase AgentKit (AI) and IDRX token; <2 seconds transaction confirmation.
* **Achievable:** Focus strictly on "Micro-SaaS" assets to limit scope.
* **Relevant:** Directly addresses the Base Hackathon's "Consumer App" and "Onchain Utility" tracks.
* **Time-bound:** Code complete by January 30, 2026.

### Key Performance Indicators (KPIs)
* **Transaction Success Rate:** 100% execution of the Escrow Smart Contract.
* **AI Valuation Accuracy:** Agent suggestions within ±20% of final sale price.
* **Gas Costs:** **< $0.20 per transaction on Base L2** (conservative estimate to account for congestion).
* **Dispute Rate:** <5% of transactions result in disputes (post-MVP target).
* **Platform Revenue:** 2.5% fee on successful transactions.

### Qualitative Objectives
* **User Trust:** Users feel safe depositing funds into the smart contract.
* **Simplicity:** The interface should feel like an e-commerce checkout, not a complex DeFi protocol.

---

## Strategic Alignment
**Valyra** leverages **Base L2** for speed and low cost, essential for retail users. It integrates **IDRX** to localize the experience for Indonesian users (removing FX risk). It showcases **Coinbase AgentKit**, aligning with Coinbase's push into AI x Crypto. It uses **Basenames** for native Base ecosystem identity integration.

## Risk Mitigation
* **Risk:** AI Hallucination (giving wrong valuation).
    * *Mitigation:* AI provides a *range* and cites data sources; disclaimer that final decision is human. Guardrails prevent valuations above 10x Annual Revenue.
* **Risk:** Smart Contract Bugs (funds stuck).
    * *Mitigation:* Use standard OpenZeppelin patterns for the Escrow contract; keep logic simple.
* **Risk:** "Lemon" Assets (Business is fake).
    * *Mitigation:* Multi-layer verification with **Just-in-Time Build ID verification** (re-verified at deposit time) + repo snapshot at sale.
* **Risk:** Disputed Transactions (Arbitration Paradox).
    * *Mitigation:* **2-of-3 Multi-Encryption** allowing arbitrator to verify credentials during disputes. Manual arbitration by Valyra team for MVP.
* **Risk:** Smart Wallet Encryption Incompatibility.
    * *Mitigation:* Fallback encryption using ephemeral keypairs with **server-side encrypted storage** (not localStorage).
* **Risk:** OAuth Token Security Breach.
    * *Mitigation:* Zero-storage policy - tokens used once for snapshot, then discarded immediately.
* **Risk:** Build ID "Bait-and-Switch".
    * *Mitigation:* JIT verification at deposit + **repo snapshot** to Valyra-controlled mirror.
* **Risk:** Seller Ghosting (inactive sellers).
    * *Mitigation:* **Seller Heartbeat** (30-day activity check) + 24h offer acceptance window.
* **Risk:** Money Laundering (self-wash trading).
    * *Mitigation:* **Tiered transaction limits** for unverified sellers + 24h withdrawal holding period.

---

## Platform Business Model

### Fee Structure
| Fee Type | Rate | Details |
|----------|------|---------|
| **Platform Success Fee** | 2.5% | Deducted from seller payout on successful transaction |
| **Listing Fee** | FREE | No upfront cost to list |
| **Dispute Filing** | FREE | No fee for legitimate disputes |
| **Gas Fees** | ~$0.05 | Paid by user initiating transaction (Base L2) |

### Fee Flow
```
Buyer deposits: 100,000 IDRX
                    │
                    ▼
            ┌───────────────┐
            │  Escrow.sol   │
            └───────┬───────┘
                    │ (on release)
        ┌───────────┴───────────┐
        ▼                       ▼
   Seller: 97,500 IDRX    Treasury: 2,500 IDRX
   (97.5%)                (2.5% fee)
```

### Treasury
* **Address:** Multi-sig wallet controlled by Valyra team
* **Usage:** Platform development, agent hosting costs, legal reserves
* **Transparency:** Fee receipts visible on-chain

---

## Features

### Core Features
1.  **AI Valuation Agent (Seller Side):** Analyzes inputted revenue metrics and suggests a listing price based on market multiples.
2.  **On-Chain Escrow Vault:** A Smart Contract that holds the Buyer's IDRX and only releases it when transfer conditions are met.
3.  **Automated Due Diligence:** AI scans provided URLs and documents to flag inconsistencies.
4.  **Ownership Verification System:** Multi-step verification to confirm seller actually owns the asset.
5.  **Secure Credential Handover:** Encrypted vault for safe transfer of business credentials.
6.  **Dispute Resolution Mechanism:** Time-locked escrow with **manual arbitration (MVP)** for contested transactions.
7.  **Multi-Currency Support:** Auto-swap from USDC to IDRX for buyer convenience.
8.  **IP Assignment:** Digital signature of IP transfer agreement stored on-chain.

### User Benefits
* **Instant Liquidity:** Sellers get paid immediately upon confirmed handover (minus 2.5% platform fee).
* **Zero-Trust Security:** Buyers never send money directly to strangers; the code protects the funds.
* **Local Currency:** Usage of IDRX means no mental math for Indonesian users.
* **Verified Assets:** Buyers can trust that listed assets have been verified with Build ID traceability.
* **Dispute Protection:** Both parties have recourse if something goes wrong.
* **Legal Protection:** On-chain IP assignment provides ownership transfer proof.

### Technical Specifications
* **Blockchain:** Base Mainnet.
* **AI Framework:** Coinbase AgentKit (LangChain/Python) + Google Gemini.
* **Payment:** IDRX (ERC-20), with USDC auto-swap option.
* **Identity:** Basenames for native Base ecosystem profiles.

### Feature Prioritization (MoSCoW)
* **Must Have:** Wallet Connect, Listing Form, Escrow Smart Contract, IDRX Payment, Basic Ownership Verification, Platform Fee (2.5%), Arbitrator Key Encryption.
* **Should Have:** AI Valuation logic, Chat interface with Agent, Dispute Resolution, Credential Handover Vault, IP Assignment Hash, Earnest Money Deposits, Seller Heartbeat.
* **Could Have:** Reputation System (Soulbound Tokens), Post-Transaction Support, USDC Auto-Swap, Gasless Listings (Paymaster), e-Meterai Integration.
* **Won't Have (MVP):** Full legal document generation, Mobile App, Multi-language support, KYC integration.

---

## Listing Schema

### Required Listing Fields

#### Asset Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Asset Name | Text | ✅ | Name of the business/project |
| Asset Type | Enum | ✅ | SaaS, E-commerce, Content Site, Community, Other |
| Business URL | URL | ✅ | Primary website URL |
| Description | Text | ✅ | Detailed description of the business |
| Asking Price | IDRX | ✅ | Listing price in IDRX |
| Tech Stack | Multi-select | ✅ | Technologies used (e.g., Next.js, Python) |
| **Build ID** | Text | ✅ | Unique identifier from deployed codebase (for verification) |

#### Financial Metrics
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Monthly Recurring Revenue (MRR) | Number | ✅ | Current MRR in IDR |
| Annual Revenue | Number | ✅ | Last 12 months revenue |
| Monthly Profit | Number | ✅ | Average monthly profit |
| Monthly Expenses | Number | ✅ | Operating expenses breakdown |
| Revenue Trend | Enum | ✅ | Growing, Stable, Declining |

#### Traffic & Users
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Monthly Active Users | Number | ⬜ | MAU count |
| Monthly Page Views | Number | ⬜ | Traffic volume |
| Traffic Sources | Text | ⬜ | Primary traffic channels |
| Customer Count | Number | ✅ | Paying customers count |

#### Assets Included
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Domain Included | Boolean | ✅ | Is domain transferred? |
| Source Code | Boolean | ✅ | Is codebase included? |
| Customer Data | Boolean | ✅ | Are customer records included? |
| Social Accounts | Boolean | ⬜ | Social media handles |
| Brand Assets | Boolean | ⬜ | Logos, designs, IP |

#### Proof Documents (Upload)
| Document | Required | Description |
|----------|----------|-------------|
| Revenue Screenshot | ✅ | Dashboard screenshot (verified manually) |
| Analytics Screenshot | ✅ | Google Analytics or similar |
| Bank Statement | ⬜ | Recent 3 months (optional) |
| Expense Breakdown | ⬜ | Spreadsheet of costs |

#### Legal Documents
| Document | Required | Description |
|----------|----------|-------------|
| **IP Assignment Agreement** | ✅ | Wallet-signed agreement template (hash stored on-chain) |

---

## Ownership Verification System

### Verification Levels

#### Level 1: Basic (Required for Listing)
* ✅ Email domain match verification
* ✅ Website accessibility check (HTTP 200)

#### Level 2: Standard (Required for Sales >$5,000)
* ✅ **DNS TXT Record Verification:** Seller adds `valyra-verify=<unique_code>` to domain DNS
* ✅ **Registrar Screenshot:** Proof of domain registrar access
* ✅ **Business Email Verification:** Confirm access via @businessdomain.com email

#### Level 3: Enhanced (Required for Sales >$20,000)
* ✅ **Revenue Verification:** Upload verified screenshots (manual verification for MVP).
* ✅ **Analytics OAuth:** Connect Google Analytics for traffic verification
* ✅ **Build ID Verification:** Cross-reference live site `valyra-build-id` meta tag with latest commit hash in GitHub repo
* ✅ **Just-in-Time Re-verification:** Build ID re-checked at deposit time to prevent bait-and-switch
* ✅ **Repo Snapshot:** Code mirrored to read-only Valyra repo at time of sale
* ✅ **Code Repository Access:** Temporary read access to verify codebase ownership

### Build ID Verification Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Live Site      │    │  AI Agent       │    │  GitHub Repo    │
│  <meta name=    │───▶│  Compares       │◀───│  Latest commit  │
│  "valyra-build" │    │  Build ID       │    │  hash           │
│  content="abc"> │    │  === hash?      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ ✅ Code Verified │
                       │ or              │
                       │ ⚠️ Mismatch Flag │
                       └─────────────────┘
```

### Revenue Verification
1. Seller uploads revenue dashboard screenshots
2. Agent scans screenshots for anomalies (OCR)
3. Manual verification by Valyra admin for MVP

---

## Credential Handover Process

### Encryption Architecture

> [!WARNING]
> **Smart Wallet Compatibility Issue:** Many Base users use Smart Wallets (ERC-4337) or Coinbase Passkey wallets that do not expose a stable public key for ECIES encryption via `eth_getEncryptionPublicKey`. A fallback mechanism is required.

### Encryption Fallback Strategy
| Wallet Type | Encryption Method |
|-------------|-------------------|
| MetaMask (EOA) | Standard ECIES with wallet public key |
| Coinbase Wallet (EOA) | Standard ECIES with wallet public key |
| Smart Wallet (ERC-4337) | **Fallback: Ephemeral Keypair** |
| Passkey Wallet | **Fallback: Ephemeral Keypair** |

### Ephemeral Keypair Fallback (with Server-Side Persistence)

> [!CAUTION]
> **localStorage Risk:** Browser-only storage is volatile. If buyer clears cache, switches devices, or browser crashes during 72h verification, they lose access to credentials and funds.

If buyer's wallet does not support `eth_getEncryptionPublicKey`:
1. Frontend generates ephemeral secp256k1 keypair in browser
2. Private key encrypted with buyer's wallet signature (`personal_sign` of known message)
3. Encrypted private key stored **BOTH** in localStorage AND **Valyra Backend/IPFS** (linked to escrowId)
4. Public key sent to seller for credential encryption
5. Buyer can recover key from any device by signing the same message

```
┌─────────────────────────────────────────────────────────────────┐
│                FALLBACK ENCRYPTION FLOW (PERSISTENT)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Buyer signs "Valyra-Key-Derivation-v1:{escrowId}:{nonce}" │
│     └──▶ Signature used as seed for keypair generation         │
│                                                                 │
│  2. Ephemeral keypair generated (secp256k1)                    │
│     └──▶ Private key encrypted with signature                  │
│                                                                 │
│  3. Encrypted key stored in TWO locations:                     │
│     ├──▶ Browser localStorage (fast access)                    │
│     └──▶ Valyra Backend/IPFS (cross-device recovery)           │
│                                                                 │
│  4. Public key shared with seller                              │
│     └──▶ Seller encrypts credentials with this key             │
│                                                                 │
│  5. Recovery: Sign same message on any device                  │
│     └──▶ Fetch encrypted key from backend → decrypt → use      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2-of-3 Arbitrator Key (Multi-Encryption)

> [!IMPORTANT]
> **Arbitration Paradox Solution:** If buyer claims credentials don't work, the arbitrator cannot verify this without access to the encrypted credentials. Solution: encrypt credentials for arbitrator as well.

#### Multi-Encryption Schema
Credentials are encrypted THREE times:
1. **Buyer Key:** Standard decryption for normal flow
2. **Arbitrator Key:** Only accessible if `EscrowState == DISPUTED`
3. **Backup Key (Future):** For recovery scenarios

```
┌─────────────────────────────────────────────────────────────────┐
│                    2-OF-3 MULTI-ENCRYPTION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Seller prepares credentials JSON                              │
│     │                                                           │
│     ├──▶ Encrypt with Buyer's public key → buyerPayload        │
│     │                                                           │
│     └──▶ Encrypt with Arbitrator's public key → arbPayload     │
│          (Arbitrator key is Valyra's designated dispute key)   │
│                                                                 │
│  On Upload:                                                     │
│     credentialPackage = {                                       │
│       buyerEncrypted: buyerPayload,                            │
│       arbitratorEncrypted: arbPayload,  // Only if EscrowState │
│       hash: keccak256(plaintext)        // == DISPUTED         │
│     }                                                           │
│                                                                 │
│  Dispute Flow:                                                  │
│     1. Buyer raises CREDENTIAL_MISMATCH dispute                │
│     2. Arbitrator requests arbPayload from vault               │
│     3. Vault checks EscrowState == DISPUTED on-chain           │
│     4. If valid, returns arbPayload to arbitrator              │
│     5. Arbitrator decrypts and verifies buyer's claim          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Handover Checklist
| Item | Description | Required |
|------|-------------|----------|
| Domain Registrar | Access to transfer domain | ✅ |
| Hosting/Server | Server credentials or transfer | ✅ |
| Source Code | Repository access (GitHub, GitLab) | ✅ |
| Payment Processor | Account transfer credentials | ✅ |
| Email/Support | Customer support email access | ⬜ |
| Social Accounts | Login credentials | ⬜ |
| Analytics | Google Analytics property transfer | ⬜ |
| Documentation | Technical docs, SOPs | ⬜ |

### Handover Flow
1. **Pre-Escrow:** Seller prepares credential package (encrypted with buyer's public key or ephemeral key)
2. **Escrow Locked:** Buyer deposits IDRX into smart contract
3. **Credential Upload:** Seller uploads encrypted credentials to Valyra vault
4. **Handover Initiation:** Buyer confirms receipt of encrypted package
5. **Verification Period:** 72-hour window for buyer to verify access
6. **Release or Dispute:** Buyer confirms ✅ → Funds released (97.5% to seller, 2.5% to treasury) | Buyer disputes ❌ → Arbitration triggered

### Security Measures
* **2-of-3 Multi-Encryption:** Credentials encrypted for buyer AND arbitrator
* Credentials **never** stored in plaintext
* **Server-Side Key Persistence:** Ephemeral keys backed up to server (encrypted)
* Auto-delete from vault after 30 days post-transaction
* Two-factor confirmation for large transfers (>$10,000)
* Arbitrator payload only accessible when `EscrowState == DISPUTED`

---

## IP Assignment & Legal Protection

### The Problem
A blockchain transaction proves *payment*, but does not legally transfer **Copyright** or **Intellectual Property** rights under most jurisdictions. Without a signed agreement, the seller could legally claim they still own the code.

### Solution: On-Chain IP Assignment Hash

#### IP Assignment Agreement Template
A standard IP assignment template is presented to sellers during listing. Key clauses:
* Transfer of all IP rights (code, designs, trademarks)
* Representation that seller owns all transferred assets
* No ongoing royalties or license fees
* Indemnification for IP disputes

#### Signing Flow
1. Seller reviews IP assignment template (Markdown)
2. Seller signs template hash via wallet (`personal_sign`)
3. Signature + template hash stored in `Listing` struct on-chain
4. PDF generated for seller's records (optional download)

#### Smart Contract Storage
```solidity
struct Listing {
    // ... existing fields ...
    bytes32 ipAssignmentHash;     // Hash of IP assignment template
    bytes sellerSignature;         // Wallet signature of the hash
    uint256 signedAt;             // Timestamp of signature
}
```

### Legal Disclaimer
> [!CAUTION]
> Valyra provides a template agreement for convenience. This does not constitute legal advice. Users should consult local legal counsel for complex transactions.

---

## Multi-Currency Support (USDC Auto-Swap)

### The Problem
Most international or crypto-native Indonesian buyers hold **USDC** or **ETH** on Base. Forcing a manual swap on Uniswap before using Valyra adds friction.

### Solution: Integrated Swap Router

#### User Experience
1. Buyer selects payment currency: **IDRX** or **USDC**
2. If USDC selected, UI shows estimated IDRX amount after swap
3. Buyer approves USDC → Router swaps to IDRX → IDRX deposited to Escrow
4. All in one transaction (atomic)

#### Technical Implementation
```
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│  Buyer USDC  │───▶│  Uniswap V3      │───▶│  Escrow      │
│  (approve)   │    │  Router (swap)   │    │  (IDRX)      │
└──────────────┘    └──────────────────┘    └──────────────┘
```

#### Slippage Protection
* Default slippage: 0.5%
* User-configurable up to 3%
* Transaction reverts if slippage exceeded

### MoSCoW Priority
* **Could Have (MVP):** Manual USDC swap with link to Uniswap
* **Should Have (V1.1):** Integrated swap router

---

## Dispute Resolution Mechanism

### Dispute Types
| Type | Description | Resolution Path |
|------|-------------|-----------------|
| **Credential Mismatch** | Credentials don't work or are incomplete | Seller provides correction or partial refund |
| **Metric Fraud** | Reported revenue/traffic was false | Full refund + seller reputation penalty |
| **Non-Delivery** | Seller fails to provide credentials | Automatic refund after timeout |
| **Quality Dispute** | Business not as described | Arbitration required |

### Dispute Timeline
```
┌──────────────────────────────────────────────────────────────────┐
│                        TRANSACTION TIMELINE                       │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│  Day 0   │  Day 1-3 │  Day 4-7 │ Day 8-10 │ Day 11-14│  Day 15+ │
│  Escrow  │ Handover │  Verify  │  Dispute │ Arbitrate│  Resolve │
│  Locked  │  Period  │  Period  │  Window  │  Period  │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Resolution Process

> [!IMPORTANT]
> **MVP Centralization Disclosure:** For the Hackathon MVP, dispute resolution is handled **manually by the Valyra team**. This is a centralized process. Future versions will implement DAO-based arbitration with staked arbiters.

1. **Dispute Filed:** Buyer submits dispute with evidence (screenshots, logs)
2. **Seller Response:** Seller has 48 hours to respond with counter-evidence
3. **AI Pre-Analysis:** Valyra AI reviews evidence and suggests resolution (advisory only)
4. **Manual Arbitration:** Valyra team reviews and makes binding decision
5. **Resolution Execution:** Smart contract executes refund or release based on verdict

### Escrow Smart Contract States
```solidity
enum EscrowState {
    Created,      // Escrow created, awaiting buyer deposit
    Funded,       // Buyer deposited IDRX
    Delivered,    // Seller uploaded credentials
    Confirmed,    // Buyer confirmed receipt
    Disputed,     // Dispute raised
    Resolved,     // Dispute resolved
    Completed,    // Funds released to seller
    Refunded      // Funds returned to buyer
}
```

### Verification Period Extension

> [!NOTE]
> **DNS Propagation Issue:** DNS and server migrations can take 24-48h. If a seller transfers domain on hour 70, buyer may not have time to verify.

#### Extension Rules
* Buyer can request **one-time 24-hour extension** on verification period
* Must be requested before verification deadline expires
* Agent auto-detects incomplete DNS propagation and suggests extension
* Seller notified of extension request

---

## Offer & Earnest Money System

### The Issue
If funds are locked on offer: High friction for buyers making multiple offers.
If funds are NOT locked: Sellers accept offers but buyers ghost (fail to deposit).

### Solution: Earnest Money Deposits

| Stage | Requirement | Details |
|-------|-------------|---------|
| **Browse** | None | Free access to marketplace |
| **Formal Offer** | 5% earnest deposit | Proves serious intent |
| **Offer Accepted** | Full deposit within 24h | Earnest applied to total |
| **Offer Rejected/Expired** | Earnest refunded | Auto-return within 1h |

#### Earnest Money Flow
```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  Browse    │───▶│  5% Earnest│───▶│  Seller    │───▶│  Full      │
│  Listing   │    │  Deposit   │    │  Accepts   │    │  Deposit   │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
                        │                │                  │
                        │                ▼                  │
                        │         ┌────────────┐            │
                        │         │ Seller     │            │
                        │         │ Rejects    │            │
                        │         └─────┬──────┘            │
                        │               │                   │
                        ▼               ▼                   ▼
                  ┌──────────────────────────┐      ┌────────────┐
                  │ Earnest Refunded (auto)  │      │ Escrow     │
                  └──────────────────────────┘      │ Locked     │
                                                    └────────────┘
```

### Seller Acceptance Window
* Seller has **24 hours** to accept/reject offer after earnest deposit
* If no response: Earnest auto-refunded, listing flagged as "Slow Response"
* After 3 ignored offers: Listing auto-paused pending seller verification

## Communication & Negotiation

### Token-Gated AI Chat

> [!NOTE]
> **Tire-Kicker Prevention:** To prevent abuse of the AI Agent (and associated API costs), deep-dive inquiries require proof of funds.

#### Chat Tiers
| Tier | Requirement | Access |
|------|-------------|--------|
| **Browse** | Wallet connected | View listings, basic Q&A |
| **Inquire** | Wallet balance ≥ $10 equivalent | Detailed AI analysis of listing |
| **Negotiate** | Offer submitted or escrow deposited | Direct seller chat, full agent access |

### Communication Channels

#### 1. AI-Mediated Chat (Primary)
* Buyer and seller communicate through Valyra AI agent
* AI handles initial negotiation, FAQ, and due diligence questions
* Token-gated to filter low-quality inquiries

#### 2. Direct Messaging (Unlocked After Intent)
* Available after buyer makes an offer or deposits escrow
* All messages logged for dispute resolution
* No external contact info sharing allowed

> [!NOTE]
> **Web3-Native Messaging (Should Have):** For post-offer direct chat, consider **XMTP** (wallet-to-wallet messaging) instead of storing messages on Valyra servers. This reduces liability and aligns with "Consumer App" track values.

### Negotiation Flow
```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  Browse    │───▶│  AI Q&A    │───▶│   Offer    │───▶│   Direct   │
│  Listing   │    │  (gated)   │    │  Submitted │    │   Chat     │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
```

### Message Guidelines
* No sharing of external contact info (auto-moderated)
* All conversations stored for 90 days (or via XMTP if implemented)
* Users can report inappropriate messages

---

## Buyer Qualification

### Qualification Requirements

#### Before Browsing
* ✅ Wallet connected (Coinbase Wallet / MetaMask)
* ✅ Wallet on Base network

#### Before Making Offer
* ✅ **Proof of Funds:** Wallet balance ≥ 10% of offer amount (verified on-chain)
* ✅ **Basename or Profile:** Basenames identity or basic profile filled

#### Before Escrow Deposit
* ✅ **Sufficient Balance:** Wallet balance ≥ offer amount + gas fees
* ✅ **Acceptance of Terms:** Terms & conditions signed
* ✅ **IP Assignment Acknowledgment:** Buyer acknowledges IP transfer terms

### Buyer Tiers (Future)
| Tier | Requirements | Benefits |
|------|-------------|----------|
| **New** | First-time buyer | Standard access |
| **Verified** | KYC completed + 1 successful purchase | Access to premium listings |
| **Premium** | 3+ successful purchases | Priority support, negotiation credits |

---

## Reputation System

### Reputation Components

#### Seller Score (0-100)
* **Verification Level:** +20 points for Level 3 verification
* **Transaction History:** +10 points per successful sale (max 50)
* **Dispute Rate:** -20 points per lost dispute
* **Response Time:** +10 points for <24h average response
* **Listing Quality:** +10 points for complete listings

#### Buyer Score (0-100)
* **Transaction History:** +10 points per successful purchase (max 50)
* **Dispute Rate:** -20 points per frivolous dispute
* **Payment Speed:** +10 points for prompt payments
* **Communication:** +10 points for professional conduct

### On-Chain Reputation (Future - Soulbound Tokens)
* Non-transferable NFT badge representing reputation
* Metadata includes: total transactions, success rate, verification level
* Visible on Base block explorers

---

## AI Agent Improvements

### Health Check Monitoring
The AI Agent runs a scheduled CRON job to monitor listed businesses:

| Check | Frequency | Action |
|-------|-----------|--------|
| **Site Uptime** | Every 24 hours | Ping business URL, check HTTP 200 |
| **SSL Certificate** | Weekly | Check expiration date |
| **Domain Expiry** | Weekly | WHOIS lookup for expiration |

#### Warning Flags
If a check fails:
1. Add "⚠️ Site Unreachable" badge to listing UI
2. Notify seller via email/notification
3. After 72h of downtime, listing auto-paused
4. Seller must verify site is back up to re-activate

### Valuation Guardrails
* **Maximum:** Never value above 10x Annual Revenue
* **Minimum:** Never value below 1x Annual Revenue (unless specified)
* **Range Required:** Always provide low/mid/high estimates
* **Confidence Score:** 0-100% based on data completeness
* **Citation:** Must cite comparable sales or market data

### Seller Heartbeat System

> [!WARNING]
> **Dead Listing Prevention:** Buyers may deposit for listings where sellers have abandoned the platform.

#### Heartbeat Requirements
| Check | Frequency | Action |
|-------|-----------|--------|
| **Email Verification** | Every 30 days | Click link to confirm active |
| **Wallet Signature** | Optional alternative | Sign message to prove ownership |
| **Offer Response** | Within 24 hours | Accept/reject earnest offers |

#### Heartbeat Failure Flow
1. **Day 30:** Reminder email sent to seller
2. **Day 37:** ⚠️ "Seller Unresponsive" badge added to listing
3. **Day 44:** Listing auto-paused, seller notified
4. **On Deposit:** If deposit made to unresponsive listing:
   * Urgent notification sent (Email + WhatsApp API)
   * Seller has 24h to "Accept" escrow
   * If no response: Auto-refund buyer + listing suspended

---

## Admin & Treasury Security

### Admin Key Management

> [!CAUTION]
> Admin keys can force-refund or release funds. Strict security required.

#### Access Control
| Role | Permissions | Key Type |
|------|-------------|----------|
| **Treasury Admin** | Withdraw fees from treasury | 2-of-3 Multi-sig |
| **Dispute Resolver** | Execute refund/release verdicts | Single EOA (rotated monthly) |
| **Agent Signer** | Sign attestations | CDP Wallet (scope-limited) |
| **Emergency Pause** | Pause all contracts | 2-of-3 Multi-sig |

#### Treasury Timelock
* **Withdrawal Delay:** 48-hour timelock on all treasury withdrawals
* **Monitoring:** All withdrawal requests visible on-chain
* **Cancel Window:** Multi-sig can cancel within 48h

#### Agent Key Scope Limits
* Agent wallet CAN: Sign attestations, verify Build IDs, generate reports
* Agent wallet CANNOT: Withdraw funds, release escrows, resolve disputes
* Key rotation: Monthly rotation of Agent signing keys

---

## Transition Assistance Period (NEW)

### The Problem
After funds are released, the buyer may need seller assistance for 2FA migrations, OTP transfers, DNS propagation, and account handovers. Once the seller has their money, they may become unresponsive.

### Solution: 10% Transition Hold

#### How It Works
1. Buyer confirms receipt of credentials
2. **90% released immediately** to seller
3. **10% held for 7 days** as "transition retainer"
4. During 7 days: Buyer can report issues, triggering dispute
5. After 7 days: Seller claims remaining 10% automatically

#### Transition Hold Schedule
```
Day 0:  Buyer confirms → 90% to seller, 10% retained
Day 1-7: Transition assistance period
  - Buyer can report: "2FA still on seller's phone"
  - Seller incentivized to help (10% at stake)
Day 8:  Seller claims 10% retainer (if no issues)
```

#### What Qualifies as Transition Issue?
| Issue | Action |
|-------|--------|
| 2FA/OTP still on seller devices | Seller must transfer or disable |
| DNS not propagated | Seller must verify registrar settings |
| Third-party logins (Google, etc.) | Seller must de-authorize |
| Customer data not exported | Seller must provide backup |

---

## Seller Stake Requirement (NEW)

### The Problem
Bad actors can create new wallets after losing a dispute, creating "burner identities" with no reputation consequences.

### Solution: Stake to List

#### How It Works
1. **Before listing:** Seller deposits ~$50 USD equivalent in IDRX
2. **During active listing:** Stake locked
3. **On successful sale:** Stake returned
4. **On dispute loss:** Stake slashed (transferred to treasury)
5. **On voluntary delist:** Stake returned after 7-day cooldown

#### Stake Economics
| Event | Stake Impact |
|-------|--------------|
| Deposit to list | Lock ~Rp 750,000 IDRX |
| Successful sale | Full refund |
| Dispute loss (FULL_REFUND) | Slash ~Rp 250,000 (1/3 of stake) |
| Dispute loss (repeat offender) | Slash 100%, ban from platform |
| Voluntary delist (no buyer) | Full refund after 7 days |

#### Why This Works
* **Economic skin in game:** Scammers lose money per attempt
* **Reputation cost:** Multiple slashes = can't afford to list
* **Honest sellers:** Minimal friction, stake always returned

#### Genesis Seller Program (Cold Start Solution) (NEW)

> [!NOTE]
> **Marketplace Liquidity Challenge:** Requiring $50 stake creates friction when there are zero existing listings. First movers are penalized.

**Solution:** First 50 verified sellers (Level 2+) waive the staking requirement entirely.

| Genesis Benefit | Impact |
|-----------------|--------|
| **Free to list** | First 50 verified sellers pay $0 to list |
| **Verification required** | Must have Level 2+ (Standard verification) |
| **Full platform access** | Same features as staked sellers |
| **After 50 sellers** | Program closes, normal $50 stake required |

**Why It Works:**
* Accelerates marketplace liquidity (listings attract buyers)
* Verified sellers only (prevents spam)
* Creates "early adopter" excitement
* Limited window creates urgency

---

## Emergency Recovery System (NEW)

### The Problem
If the contract is hacked or the UI goes down permanently, user funds must be recoverable.

### Solution: Emergency Eject

#### How It Works
1. Multi-sig activates "Emergency Mode"
2. 72-hour cooldown begins (allows time to cancel if false alarm)
3. After cooldown: Users can withdraw their OWN funds directly
4. Funds return to original owners (buyer gets back deposits, seller gets transition holds)

#### Emergency Override Rules
* **Requires:** 2-of-3 multi-sig approval
* **Cannot:** Redirect funds to admin wallets
* **Can only:** Return funds to original transaction parties

---

## Indonesia Compliance Awareness (NEW)

### Bappebti Context

> [!WARNING]
> While Valyra is a hackathon MVP, Indonesian commodity trading regulations (Bappebti) apply to crypto-related trading platforms.

#### Current Approach (MVP)
* **No KYC requirement:** Aligns with Base's permissionless ethos
* **AML limits:** Transaction limits for unverified users mitigate risk
* **Disclaimer:** Clear disclosure that Valyra is not a regulated exchange

#### Future Considerations
* **Registration trigger:** May require Bappebti registration above certain volume
* **KYC integration:** Future versions may integrate with Indonesian e-KYC providers
* **Legal entity:** May require PT (Indonesian company) structure for mainland operations

## User Experience

### User Interface (UI) Design
* **Style:** "Clean Professional" (Stripe-like). White background, crisp fonts, "Base Blue" accents.
* **Key Component:** The "Agent Chat" window where the negotiation happens.
* **Design System:** Consistent component library for buttons, cards, forms.
* **Identity:** Basenames integration for native Base ecosystem profiles.

### Responsive Design
* **Desktop First (MVP):** Optimized for 1024px+ screens
* **Tablet Support:** Readable and functional on tablets
* **Mobile (Post-MVP):** Native-like PWA experience planned

### User Journey

#### Seller Journey
1.  **Connect:** Connect Coinbase Wallet / MetaMask
2.  **Verify:** Complete ownership verification (DNS, OAuth, Build ID)
3.  **List:** Fill listing form with all required fields
4.  **Sign IP:** Wallet-sign IP assignment agreement
5.  **AI Review:** Valyra AI scans (with guardrails) and proposes price
6.  **Publish:** Listing goes live after AI approval
7.  **Negotiate:** Respond to buyer inquiries via AI chat
8.  **Accept Offer:** Accept buyer's offer, escrow initiated
9.  **Handover:** Upload credentials to encrypted vault
10. **Complete:** Receive IDRX (97.5%) after buyer confirms

#### Buyer Journey
1.  **Connect:** Connect wallet
2.  **Browse:** Explore verified listings with filters
3.  **Inquire:** Ask questions via AI agent (token-gated)
4.  **Offer:** Submit offer with proof of funds
5.  **Negotiate:** Direct chat with seller (if unlocked)
6.  **Deposit:** Lock IDRX (or swap from USDC) in escrow smart contract
7.  **Receive:** Access encrypted credentials
8.  **Verify:** 72-hour period to verify all assets
9.  **Confirm:** Release funds to seller (or dispute)

### Usability Testing
* **Method:** "Corridor Testing" with non-crypto friends. Can they complete a "purchase" without asking "What is gas?"?
* **Success Metrics:** <3 clicks to list, <5 clicks to purchase

---

## Post-Transaction Support

### Transition Assistance

#### Included (Free)
* Transaction receipt (on-chain proof)
* IP Assignment certificate (downloadable PDF)
* Handover checklist completion tracker
* Basic documentation access for 30 days

#### Premium (Future)
* 14-day seller support period
* Technical migration assistance
* Customer transition email templates

### Transaction History
* All transactions recorded on-chain
* Dashboard showing past purchases/sales
* Downloadable transaction receipts (PDF)

---

## Legal & Compliance

### AML & Transaction Limits

> [!WARNING]
> **Money Laundering Risk:** Bad actors could list fake assets and "buy" them with illicit funds (self-wash trading).

#### Tiered Transaction Limits
| Verification Level | Max Single Transaction | Month Limit |
|-------------------|------------------------|-------------|
| **Basic** | < $1,000 (15M IDRX) | $2,000/month |
| **Standard** | < $10,000 (150M IDRX) | $20,000/month |
| **Enhanced** | Unlimited | Unlimited |

#### Withdrawal Holding Period
* **24-hour hold** on seller payouts before withdrawal enabled
* Allows time for blacklist checks and suspicious activity review
* Emergency freeze available for flagged transactions

#### Suspicious Activity Flags
* Same wallet as buyer AND seller
* Multiple rapid transactions (>3 per day)
* Listings with no verification + immediate sale
* Wallet linked to known blacklisted addresses

### e-Meterai Integration (Indonesia)

> [!NOTE]
> **Legal Standing:** While wallet signatures are cryptographically valid, Indonesian courts may prefer e-Meterai for absolute enforceability.

#### Implementation
* Transactions > 10 Juta IDR (~$600): Offer optional e-Meterai stamp
* Integration with official e-Meterai provider (Peruri)
* PDF generated with:
  * Transaction hash
  * Timestamp
  * **Designated placeholder space for e-Meterai stamp**
  * QR code for verification

> [!IMPORTANT]
> **MVP Solution (v2.4):** Until full API integration, generate PDF with a **clearly marked placeholder box** for users to manually affix e-Meterai later. This demonstrates legal awareness to Indonesian judges and maintains admissibility for transactions > Rp 5,000,000.

**PDF Template Structure:**
```
┌─────────────────────────────────────────────────┐
│         VALYRA BUSINESS TRANSFER AGREEMENT       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Transaction ID: 0x123...abc                    │
│  Date: 2025-12-11 14:30 WIB                     │
│  Seller: 0xABC... (seller.base.eth)             │
│  Buyer: 0xDEF... (buyer.base.eth)               │
│  Amount: Rp 45,000,000 IDRX                     │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ [RESERVED FOR e-METERAI DIGITAL STAMP]  │   │
│  │                                         │   │
│  │   Please affix Rp 10,000 e-Meterai     │   │
│  │   for legal enforceability              │   │
│  │   (transactions > Rp 5,000,000)         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Blockchain Proof: QR Code [▓▓▓▓▓▓]             │
└─────────────────────────────────────────────────┘
```

#### Cost
* e-Meterai fee: Rp 10,000 (~$0.60)
* Split 50/50 between buyer and seller (optional)

### Disclaimers
* **Not Financial Advice:** Valyra AI valuations are estimates, not financial advice
* **No Guarantee:** Valyra does not guarantee accuracy of seller-provided data
* **User Responsibility:** Users responsible for tax compliance in their jurisdiction
* **IP Template:** IP assignment template is provided for convenience, not legal advice

### Terms of Service Highlights
* Users must be 18+ years old
* No illegal businesses or content allowed
* Valyra reserves right to delist suspicious assets
* Dispute resolution is binding within the platform
* Platform fee (2.5%) is non-refundable on completed transactions

### Geographic Scope
* **MVP Focus:** Indonesia (IDRX-based)
* **Future:** Southeast Asia expansion

### Tax Considerations
* Users responsible for reporting income/capital gains
* Transaction history exportable for tax purposes
* Platform does not withhold taxes
* Platform fees may be deductible as business expense (consult local advisor)

---

## Milestones

### Development Phases
1.  **Phase 1: Contracts (Dec 10 - Dec 20):** Write and test Solidity Escrow contracts on Base Sepolia, including fee mechanism.
2.  **Phase 2: Agents (Dec 21 - Jan 10):** Configure Coinbase AgentKit with guardrails, health checks, and Build ID verification.
3.  **Phase 3: Frontend (Jan 11 - Jan 25):** Build Next.js UI with Basenames, encryption fallback, and IP signing.
4.  **Phase 4: Polish (Jan 26 - Jan 31):** UI cleanup, IDRX Mainnet testing, Demo Video production.

### Critical Path
* Smart Contract Security → Agent Wallet Integration → Encryption Fallback → Frontend Connection.

---

## Technical Requirements

### Tech Stack
* **Frontend:** Next.js, Tailwind CSS, OnchainKit (Base).
* **Backend/AI:** Python (FastAPI), Coinbase AgentKit (CDP SDK), Google Gemini API.
* **Smart Contracts:** Solidity, Hardhat.
* **Encryption:** Wallet-based ECIES + ephemeral keypair fallback for Smart Wallets.
* **Indexing:** Simple RPC calls via Viem (no full subgraph for MVP).
* **Identity:** Basenames for user profiles.

### System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App (Frontend)                       │
│  • Wallet Connection (Wagmi/OnchainKit)                         │
│  • Basenames Integration                                        │
│  • Ephemeral Keypair Generator (fallback)                       │
│  • IP Assignment Signing                                        │
│  • Escrow Interaction                                           │
│  • Chat UI                                                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌────────────────┐ ┌────────────────────────┐
│  Python Server   │ │ Credential     │ │    Base Blockchain     │
│  (FastAPI)       │ │ Vault          │ │                        │
│  • AI Agent      │ │ (Encrypted)    │ │ • Escrow.sol           │
│  • AgentKit      │ │ • Temp Storage │ │ • Marketplace.sol      │
│  • Build ID Check│ └────────────────┘ │ • Reputation.sol       │
│  • Health CRON   │                     │ • IDRX Integration     │
│  • Zero-Storage  │                     │ • Fee Treasury         │
│    OAuth         │                     │                        │
└──────────────────┘                     └────────────────────────┘
```

### Security Measures
* **Contract:** Functions `withdraw` and `release` must have strict `onlyOwner` or `onlyBuyer` modifiers.
* **Data:** Business credentials are **never** stored on-chain in plaintext.
* **Encryption:** ECIES with wallet public key + ephemeral fallback for Smart Wallets.
* **Vault:** Auto-purge of credentials after 30 days.
* **OAuth:** Zero-storage policy - tokens discarded immediately after attestation.
* **Audit:** Contract audit before mainnet deployment (post-hackathon).

### Integration Requirements
* **IDRX Contract Address:** Must whitelist the official IDRX token address on Base.
* **Coinbase CDP API Keys:** Required for AgentKit functionality.
* **OAuth Providers:** Stripe, Google Analytics for verification (zero-storage snapshot only).
* **Basenames:** For native Base identity integration.
* **Uniswap V3 Router:** For USDC→IDRX auto-swap (optional for MVP).
* **Paymaster (ERC-4337):** For gasless listing creation (Could Have).
* **e-Meterai API:** Peruri integration for high-value transactions (Could Have).

---

## Gasless Listings (Account Abstraction)

### The Issue
Sellers (Indie Hackers) might not have ETH on Base to pay gas fees for listing creation, even though listing is free.

### Solution: Paymaster Sponsorship

#### How It Works
1. Seller initiates listing without ETH in wallet
2. Coinbase Paymaster (CDP) sponsors the gas fee
3. Listing is created at zero cost to seller
4. Platform recoups gas cost from 2.5% success fee later

#### Implementation (ERC-4337)
```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  Seller Wallet │───▶│  UserOperation │───▶│  Paymaster     │
│  (No ETH)      │    │  (create list) │    │  (CDP/BASE)    │
└────────────────┘    └────────────────┘    └────────────────┘
                                                   │
                                                   ▼
                                          ┌────────────────┐
                                          │  Gas Sponsored │
                                          │  by Valyra     │
                                          └────────────────┘
```

#### Limits
* **Max sponsored gas per listing:** ~$0.10
* **Max free listings per wallet:** 3
* **After limit:** User pays gas or verifies to increase limit

### MoSCoW Priority
* **Could Have (MVP):** Gasless listing creation
* **Future:** Full account abstraction for all interactions

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| **MRR** | Monthly Recurring Revenue |
| **IDRX** | Indonesian Rupiah Stablecoin on Base |
| **Escrow** | Smart contract holding funds during transaction |
| **SBT** | Soulbound Token (non-transferable NFT) |
| **AgentKit** | Coinbase's AI agent framework for crypto |
| **Build ID** | Unique identifier linking live site to codebase |
| **Basenames** | Base's native identity/naming system |
| **ERC-4337** | Account Abstraction standard for Smart Wallets |
| **Earnest Money** | 5% deposit to prove serious buyer intent |
| **e-Meterai** | Official Indonesian digital stamp duty |
| **Paymaster** | Entity that pays gas fees on behalf of users |
| **JIT Verification** | Just-in-Time verification at deposit time |
| **Transition Hold** | 10% retainer held 7 days for migration assistance |
| **Seller Stake** | ~$50 deposit required to list (slashed on dispute loss) |
| **UUPS Proxy** | Upgradeable contract pattern for bug fixes |
| **Arweave** | Permanent storage for code snapshots |

### Related Documents
* Technical Architecture Document (tdd.md)
* Design System Guidelines (design-spec.md)

---

**Changelog:**
* **v2.4 (Dec 11, 2025):** Final refinements: Genesis Seller Program (first 50 verified sellers waive $50 stake), e-Meterai PDF placeholder for legal enforceability, XMTP integration recommendation for Web3-native messaging, Emergency TRANSITION logic correction (retainer to seller), Gas fee estimates updated to <$0.25 (conservative).
* **v2.3 (Dec 11, 2025):** Production readiness: Transition Hold (10%/7d), Seller Stake (~$50), Emergency Recovery, UUPS upgradability, Bappebti compliance, Arweave storage, XSS mitigation (IndexedDB).
* **v2.2 (Dec 11, 2025):** Arbitrator Key encryption, ephemeral key persistence, JIT Build ID verification, Earnest Money (5%), Seller Heartbeat, Admin timelocks, AML limits, e-Meterai, Gasless listings.
* **v2.1 (Dec 11, 2025):** Platform Fee (2.5%), Smart Wallet fallback, Build ID, OAuth zero-storage, IP Assignment, Token-gated chat, Health checks, USDC swap, Basenames.
* **v2.0 (Dec 10, 2025):** Full feature spec: Listing, Verification, Handover, Disputes, Communication, Reputation.
* **v1.0 (Dec 10, 2025):** Initial PRD draft.