# PRD: Valyra (Autonomous M&A Agent Marketplace)

**Author:** alhadad
**Date:** December 10, 2025
**Status:** Hackathon MVP Phase
**Version:** 2.0 (Revised)

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
* **Differentiation:** Unlike *Flippa* or *Acquire.com* which are Web2 listings requiring manual negotiation and expensive escrow, **Valyra** uses AI Agents to negotiate and Smart Contracts to settle transactions instantly using IDRX (Rupiah Stablecoin) with near-zero fees.

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
* **Agent Autonomy:** AI successfully generates a Valuation Report without human input.
* **Cost Efficiency:** Gas fees per acquisition transaction <$0.10.
* **Dispute Rate:** <5% of transactions result in disputes (post-MVP target).

### Qualitative Objectives
* **User Trust:** Users feel safe depositing funds into the smart contract.
* **Simplicity:** The interface should feel like an e-commerce checkout, not a complex DeFi protocol.

---

## Strategic Alignment
**Valyra** leverages **Base L2** for speed and low cost, essential for retail users. It integrates **IDRX** to localize the experience for Indonesian users (removing FX risk). It showcases **Coinbase AgentKit**, aligning with Coinbase's push into AI x Crypto.

## Risk Mitigation
* **Risk:** AI Hallucination (giving wrong valuation).
    * *Mitigation:* AI provides a *range* and cites data sources; disclaimer that final decision is human.
* **Risk:** Smart Contract Bugs (funds stuck).
    * *Mitigation:* Use standard OpenZeppelin patterns for the Escrow contract; keep logic simple.
* **Risk:** "Lemon" Assets (Business is fake).
    * *Mitigation:* Multi-layer verification system (see Ownership Verification section) + on-chain reputation system for sellers.
* **Risk:** Disputed Transactions.
    * *Mitigation:* Time-locked escrow with dispute window + arbitration mechanism (see Dispute Resolution section).

---

## Features

### Core Features
1.  **AI Valuation Agent (Seller Side):** Analyzes inputted revenue metrics and suggests a listing price based on market multiples.
2.  **On-Chain Escrow Vault:** A Smart Contract that holds the Buyer's IDRX and only releases it when transfer conditions are met.
3.  **Automated Due Diligence:** AI scans provided URLs and documents to flag inconsistencies.
4.  **Ownership Verification System:** Multi-step verification to confirm seller actually owns the asset.
5.  **Secure Credential Handover:** Encrypted vault for safe transfer of business credentials.
6.  **Dispute Resolution Mechanism:** Time-locked escrow with arbitration for contested transactions.

### User Benefits
* **Instant Liquidity:** Sellers get paid immediately upon confirmed handover.
* **Zero-Trust Security:** Buyers never send money directly to strangers; the code protects the funds.
* **Local Currency:** Usage of IDRX means no mental math for Indonesian users.
* **Verified Assets:** Buyers can trust that listed assets have been verified.
* **Dispute Protection:** Both parties have recourse if something goes wrong.

### Technical Specifications
* **Blockchain:** Base Mainnet.
* **AI Framework:** Coinbase AgentKit (LangChain/Python) + OpenAI GPT-4.
* **Payment:** IDRX (ERC-20).

### Feature Prioritization (MoSCoW)
* **Must Have:** Wallet Connect, Listing Form, Escrow Smart Contract, IDRX Payment, Basic Ownership Verification.
* **Should Have:** AI Valuation logic, Chat interface with Agent, Dispute Resolution, Credential Handover Vault.
* **Could Have:** Reputation System (Soulbound Tokens), Post-Transaction Support, Advanced Analytics.
* **Won't Have (MVP):** Legal document generation (PDFs), Mobile App, Multi-currency support.

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
| Revenue Screenshot | ✅ | Stripe/Payment processor dashboard |
| Analytics Screenshot | ✅ | Google Analytics or similar |
| Bank Statement | ⬜ | Recent 3 months (optional) |
| Expense Breakdown | ⬜ | Spreadsheet of costs |

---

## Ownership Verification System

### Verification Levels

#### Level 1: Basic (Required for Listing)
* ✅ Email domain match verification
* ✅ WAL ownership (business website accessible)

#### Level 2: Standard (Required for Sales >$5,000)
* ✅ **DNS TXT Record Verification:** Seller adds `valyra-verify=<unique_code>` to domain DNS
* ✅ **Registrar Screenshot:** Proof of domain registrar access
* ✅ **Business Email Verification:** Confirm access via @businessdomain.com email

#### Level 3: Enhanced (Required for Sales >$20,000)
* ✅ **Revenue Platform OAuth:** Connect Stripe, Paddle, or Gumroad for real-time revenue verification
* ✅ **Analytics OAuth:** Connect Google Analytics for traffic verification
* ✅ **Code Repository Access:** Temporary read access to verify codebase ownership

### Verification Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Submit URL    │───▶│  DNS TXT Check  │───▶│  OAuth Connect  │
│   + Business    │    │  (Automated)    │    │  (User Action)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Verified Badge │◀───│   AI Analysis   │
                       │  on Listing     │    │   + Report      │
                       └─────────────────┘    └─────────────────┘
```

---

## Credential Handover Process

### Secure Vault Architecture

The credential handover uses **asymmetric encryption** to ensure only the buyer can access credentials after payment confirmation.

### Handover Checklist
| Item | Description | Required |
|------|-------------|----------|
| Domain Registrar | Access to transfer domain | ✅ |
| Hosting/Server | Server credentials or transfer | ✅ |
| Source Code | Repository access (GitHub, GitLab) | ✅ |
| Payment Processor | Stripe/Paddle account transfer | ✅ |
| Email/Support | Customer support email access | ⬜ |
| Social Accounts | Login credentials | ⬜ |
| Analytics | Google Analytics property transfer | ⬜ |
| Documentation | Technical docs, SOPs | ⬜ |

### Handover Flow
1. **Pre-Escrow:** Seller prepares credential package (encrypted with buyer's public key)
2. **Escrow Locked:** Buyer deposits IDRX into smart contract
3. **Credential Upload:** Seller uploads encrypted credentials to Valyra vault
4. **Handover Initiation:** Buyer confirms receipt of encrypted package
5. **Verification Period:** 72-hour window for buyer to verify access
6. **Release or Dispute:** Buyer confirms ✅ → Funds released | Buyer disputes ❌ → Arbitration triggered

### Security Measures
* Credentials encrypted with buyer's wallet public key
* Credentials **never** stored in plaintext
* Auto-delete from vault after 30 days post-transaction
* Two-factor confirmation for large transfers (>$10,000)

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
1. **Dispute Filed:** Buyer submits dispute with evidence (screenshots, logs)
2. **Seller Response:** Seller has 48 hours to respond with counter-evidence
3. **AI Pre-Analysis:** Valyra AI reviews evidence and suggests resolution
4. **Arbitration (if needed):** 
   - MVP: Manual review by Valyra team
   - Future: DAO-based arbitration with staked arbiters
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

---

## Communication & Negotiation

### Communication Channels

#### 1. AI-Mediated Chat (Primary)
* Buyer and seller communicate through Valyra AI agent
* AI handles initial negotiation, FAQ, and due diligence questions
* Reduces friction and filters out low-quality inquiries

#### 2. Direct Messaging (Unlocked After Intent)
* Available after buyer makes an offer or deposits escrow
* All messages logged for dispute resolution
* No external contact info sharing allowed

### Negotiation Flow
```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  Browse    │───▶│  AI Q&A    │───▶│   Offer    │───▶│   Direct   │
│  Listing   │    │  Inquiry   │    │  Submitted │    │   Chat     │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
```

### Message Guidelines
* No sharing of external contact info (auto-moderated)
* All conversations stored for 90 days
* Users can report inappropriate messages

---

## Buyer Qualification

### Qualification Requirements

#### Before Browsing
* ✅ Wallet connected (Coinbase Wallet / MetaMask)
* ✅ Wallet on Base network

#### Before Making Offer
* ✅ **Proof of Funds:** Wallet balance ≥ 10% of offer amount (verified on-chain)
* ✅ **Profile Completion:** Basic profile information filled

#### Before Escrow Deposit
* ✅ **Sufficient Balance:** Wallet balance ≥ offer amount + gas fees
* ✅ **Acceptance of Terms:** Terms & conditions signed

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

## User Experience

### User Interface (UI) Design
* **Style:** "Clean Professional" (Stripe-like). White background, crisp fonts, "Base Blue" accents.
* **Key Component:** The "Agent Chat" window where the negotiation happens.
* **Design System:** Consistent component library for buttons, cards, forms.

### Responsive Design
* **Desktop First (MVP):** Optimized for 1024px+ screens
* **Tablet Support:** Readable and functional on tablets
* **Mobile (Post-MVP):** Native-like PWA experience planned

### User Journey

#### Seller Journey
1.  **Connect:** Connect Coinbase Wallet / MetaMask
2.  **Verify:** Complete ownership verification (DNS, OAuth)
3.  **List:** Fill listing form with all required fields
4.  **AI Review:** Valyra AI scans and proposes price: "Based on $1k MRR, I suggest listing at $30k."
5.  **Publish:** Listing goes live after AI approval
6.  **Negotiate:** Respond to buyer inquiries via AI chat
7.  **Accept Offer:** Accept buyer's offer, escrow initiated
8.  **Handover:** Upload credentials to encrypted vault
9.  **Complete:** Receive IDRX after buyer confirms

#### Buyer Journey
1.  **Connect:** Connect wallet
2.  **Browse:** Explore verified listings with filters
3.  **Inquire:** Ask questions via AI agent
4.  **Offer:** Submit offer with proof of funds
5.  **Negotiate:** Direct chat with seller (if unlocked)
6.  **Deposit:** Lock IDRX in escrow smart contract
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

### Disclaimers
* **Not Financial Advice:** Valyra AI valuations are estimates, not financial advice
* **No Guarantee:** Valyra does not guarantee accuracy of seller-provided data
* **User Responsibility:** Users responsible for tax compliance in their jurisdiction

### Terms of Service Highlights
* Users must be 18+ years old
* No illegal businesses or content allowed
* Valyra reserves right to delist suspicious assets
* Dispute resolution is binding within the platform

### Geographic Scope
* **MVP Focus:** Indonesia (IDRX-based)
* **Future:** Southeast Asia expansion

### Tax Considerations
* Users responsible for reporting income/capital gains
* Transaction history exportable for tax purposes
* Platform does not withhold taxes

---

## Milestones

### Development Phases
1.  **Phase 1: Contracts (Dec 10 - Dec 20):** Write and test Solidity Escrow contracts on Base Sepolia.
2.  **Phase 2: Agents (Dec 21 - Jan 10):** Configure Coinbase AgentKit to interact with the wallet and contract.
3.  **Phase 3: Frontend (Jan 11 - Jan 25):** Build Next.js UI and integrate OnchainKit.
4.  **Phase 4: Polish (Jan 26 - Jan 31):** UI cleanup, IDRX Mainnet testing, Demo Video production.

### Critical Path
* Smart Contract Security -> Agent Wallet Integration -> Frontend Connection.

---

## Technical Requirements

### Tech Stack
* **Frontend:** Next.js, Tailwind CSS, OnchainKit (Base).
* **Backend/AI:** Python (FastAPI), Coinbase AgentKit (CDP SDK), OpenAI API.
* **Smart Contracts:** Solidity, Hardhat.
* **Encryption:** Web3 wallet-based asymmetric encryption for credential vault.
* **Indexing:** The Graph (optional) or simple RPC calls.

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
│  • Listing Interface                                            │
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
│  • Valuation     │ └────────────────┘ │ • Reputation.sol       │
└──────────────────┘                     │ • IDRX Integration     │
                                         └────────────────────────┘
```

### Security Measures
* **Contract:** Functions `withdraw` and `release` must have strict `onlyOwner` or `onlyBuyer` modifiers.
* **Data:** Business credentials are **never** stored on-chain in plaintext.
* **Encryption:** Asymmetric encryption using buyer's wallet public key.
* **Vault:** Auto-purge of credentials after 30 days.
* **Audit:** Contract audit before mainnet deployment (post-hackathon).

### Integration Requirements
* **IDRX Contract Address:** Must whitelist the official IDRX token address on Base.
* **Coinbase CDP API Keys:** Required for AgentKit functionality.
* **OAuth Providers:** Stripe, Google Analytics for verification (optional for MVP).

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| **MRR** | Monthly Recurring Revenue |
| **IDRX** | Indonesian Rupiah Stablecoin on Base |
| **Escrow** | Smart contract holding funds during transaction |
| **SBT** | Soulbound Token (non-transferable NFT) |
| **AgentKit** | Coinbase's AI agent framework for crypto |

### Related Documents
* Technical Architecture Document (TBD)
* Smart Contract Specification (TBD)
* Design System Guidelines (TBD)

---

**Changelog:**
* **v2.0 (Dec 10, 2025):** Added Listing Schema, Ownership Verification, Credential Handover, Dispute Resolution, Communication, Buyer Qualification, Reputation System, Post-Transaction Support, Legal & Compliance sections. Enhanced risk mitigation and user journey details.
* **v1.0 (Dec 10, 2025):** Initial PRD draft.