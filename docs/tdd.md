# Technical Design Document: Valyra

**Author:** [Your Name]
**Date:** December 10, 2025
**Version:** 2.0 (Hackathon MVP - Revised)

---

## Product Overview

### Purpose

**Valyra** is an autonomous marketplace designed to solve the illiquidity of micro-SaaS and digital assets in Indonesia. It replaces expensive human brokers with **Coinbase AgentKit (AI)** and **Base Smart Contracts**.

* **Problem:** Selling a $5,000 SaaS business is too small for brokers but too risky for P2P transfers.
* **Opportunity:** Leveraging Base L2's low fees and IDRX (Indonesian Rupiah Stablecoin) to create a frictionless, trustless exit mechanism for Indie Hackers.
* **Scenario:** A developer lists a chatbot startup. An AI Agent analyzes the codebase and revenue, suggests a price, and a buyer purchases it instantly using IDRX via an on-chain escrow with built-in dispute resolution.

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

---

## Design Details

### Architectural Overview

Valyra utilizes a **Hybrid Web3 Architecture**. The heavy logic (valuation/negotiation) happens off-chain via AI, while the settlement (money/ownership) happens on-chain.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER (Browser)                                │
│                    Coinbase Wallet / MetaMask                           │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js + OnchainKit)                    │
│  • Wallet Connection (Wagmi)     • Listing Interface                    │
│  • Escrow Status UI              • Agent Chat Interface                 │
│  • Credential Vault Access       • Dispute Filing UI                    │
└───────────┬─────────────────────────────────────┬───────────────────────┘
            │                                     │
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────────────┐
│  AI BACKEND (Python/FastAPI)│       │        BASE BLOCKCHAIN            │
│  • Coinbase AgentKit (CDP)  │       │  ┌─────────────────────────────┐  │
│  • Valuation Engine         │       │  │   Marketplace.sol           │  │
│  • Due Diligence Scanner    │       │  │   • Listing Management      │  │
│  • Ownership Verification   │       │  │   • Seller Registration     │  │
│  ┌────────────────────────┐ │       │  └─────────────────────────────┘  │
│  │ Agent Wallet (CDP)     │ │       │  ┌─────────────────────────────┐  │
│  │ Signs attestations     │ │       │  │   Escrow.sol                │  │
│  └────────────────────────┘ │       │  │   • Fund Locking            │  │
└───────────────────────────┘         │  │   • Time-locked Release     │  │
            │                         │  │   • Dispute Handling        │  │
            ▼                         │  └─────────────────────────────┘  │
┌───────────────────────────┐         │  ┌─────────────────────────────┐  │
│  CREDENTIAL VAULT         │         │  │   Reputation.sol (Future)   │  │
│  • Encrypted Storage      │         │  │   • Soulbound Tokens        │  │
│  • Buyer-only Decryption  │         │  └─────────────────────────────┘  │
│  • Auto-purge (30 days)   │         │  ┌─────────────────────────────┐  │
└───────────────────────────┘         │  │   IDRX Token (ERC-20)       │  │
                                      │  └─────────────────────────────┘  │
                                      └───────────────────────────────────┘
```

**Components:**

1. **Frontend (Next.js):** The user interface for humans. Connects to Base via **OnchainKit**.
2. **AI Backend (Python/FastAPI):** Hosts the **Coinbase AgentKit**. This agent has its own CDP (Coinbase Developer Platform) wallet to sign "Attestations" (verifying a business is real).
3. **Smart Contracts (Solidity):** Deployed on Base. Handles the Escrow logic, IDRX transfers, and dispute resolution.
4. **Credential Vault:** Encrypted off-chain storage for secure credential handover between parties.
5. **Storage (IPFS):** Stores non-financial data (Screenshots, Business Descriptions) to keep gas costs low.

---

### Smart Contract Architecture

#### Contract Structure

```
contracts/
├── Marketplace.sol      # Listing management and search
├── Escrow.sol           # Fund handling and dispute resolution
├── CredentialVault.sol  # On-chain credential hash verification
├── Reputation.sol       # Soulbound token reputation (Future)
└── interfaces/
    ├── IIDRX.sol        # IDRX token interface
    └── IEscrow.sol      # Escrow interface for Marketplace
```

#### Data Structures (Solidity)

**1. Listing Struct:**
```solidity
struct Listing {
    uint256 id;
    address seller;
    string title;
    string ipfsMetadata;      // IPFS hash for full description
    uint256 askingPrice;      // In IDRX (18 decimals)
    uint256 createdAt;
    VerificationLevel verificationLevel;
    ListingState state;
}

enum ListingState {
    ACTIVE,      // Available for purchase
    PENDING,     // Buyer has deposited, awaiting handover
    COMPLETED,   // Transaction successful
    CANCELLED,   // Seller cancelled
    DISPUTED     // Under dispute
}

enum VerificationLevel {
    BASIC,       // Email verification only
    STANDARD,    // DNS + Registrar verification
    ENHANCED     // OAuth revenue/analytics verified
}
```

**2. Escrow Struct:**
```solidity
struct EscrowTransaction {
    uint256 listingId;
    address buyer;
    address seller;
    uint256 amount;           // IDRX amount
    uint256 depositedAt;
    uint256 handoverDeadline; // Seller must upload credentials by this time
    uint256 verifyDeadline;   // Buyer must confirm or dispute by this time
    bytes32 credentialHash;   // Hash of encrypted credentials
    EscrowState state;
}

enum EscrowState {
    CREATED,     // Escrow created, awaiting deposit
    FUNDED,      // Buyer deposited IDRX
    DELIVERED,   // Seller uploaded credentials
    CONFIRMED,   // Buyer confirmed receipt
    DISPUTED,    // Dispute raised
    RESOLVED,    // Dispute resolved by arbitration
    COMPLETED,   // Funds released to seller
    REFUNDED,    // Funds returned to buyer
    EXPIRED      // Timeouts triggered refund
}
```

**3. Dispute Struct:**
```solidity
struct Dispute {
    uint256 escrowId;
    address initiator;
    DisputeType disputeType;
    string evidenceIpfs;      // IPFS hash of evidence
    string responseIpfs;      // Seller's counter-evidence
    uint256 createdAt;
    uint256 responseDeadline;
    DisputeResolution resolution;
    address resolver;         // Admin/DAO who resolved
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

#### Key Contract Functions

**Marketplace.sol:**
```solidity
function createListing(
    string memory title,
    string memory ipfsMetadata,
    uint256 askingPrice,
    VerificationLevel level
) external returns (uint256 listingId);

function updateListing(uint256 listingId, string memory ipfsMetadata, uint256 newPrice) external;
function cancelListing(uint256 listingId) external;
function getActiveListings(uint256 offset, uint256 limit) external view returns (Listing[] memory);
```

**Escrow.sol:**
```solidity
// Buyer actions
function deposit(uint256 listingId) external;
function confirmReceipt(uint256 escrowId) external;
function raiseDispute(uint256 escrowId, DisputeType disputeType, string memory evidenceIpfs) external;

// Seller actions
function uploadCredentialHash(uint256 escrowId, bytes32 credentialHash) external;
function respondToDispute(uint256 escrowId, string memory responseIpfs) external;

// Time-based actions
function claimTimeout(uint256 escrowId) external;  // Auto-release/refund based on state

// Admin actions (MVP - DAO in future)
function resolveDispute(uint256 escrowId, DisputeResolution resolution, uint256 refundPercent) external onlyAdmin;
```

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
                      AUTO RELEASE           ESCALATE
```

**Timeout Constants:**
```solidity
uint256 public constant HANDOVER_DEADLINE = 72 hours;
uint256 public constant VERIFICATION_WINDOW = 72 hours;
uint256 public constant DISPUTE_RESPONSE_WINDOW = 48 hours;
uint256 public constant ARBITRATION_DEADLINE = 96 hours;
```

---

### Event Definitions

All contract events for indexing and notifications:

```solidity
// Marketplace Events
event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 price);
event ListingUpdated(uint256 indexed listingId, uint256 newPrice);
event ListingCancelled(uint256 indexed listingId);
event ListingVerified(uint256 indexed listingId, VerificationLevel level);

// Escrow Events
event DepositReceived(uint256 indexed escrowId, uint256 indexed listingId, address indexed buyer, uint256 amount);
event CredentialsUploaded(uint256 indexed escrowId, bytes32 credentialHash);
event TransactionConfirmed(uint256 indexed escrowId);
event FundsReleased(uint256 indexed escrowId, address indexed seller, uint256 amount);
event FundsRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);

// Dispute Events
event DisputeRaised(uint256 indexed escrowId, address indexed initiator, DisputeType disputeType);
event DisputeResponseSubmitted(uint256 indexed escrowId, address indexed responder);
event DisputeResolved(uint256 indexed escrowId, DisputeResolution resolution, uint256 refundPercent);

// Timeout Events
event HandoverTimeout(uint256 indexed escrowId);
event VerificationTimeout(uint256 indexed escrowId);
```

---

### Credential Handover Architecture

#### Encryption Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  SELLER         │    │  VALYRA VAULT   │    │  BUYER          │
│                 │    │  (Encrypted)    │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │  1. Get Buyer's      │                      │
         │     Public Key       │◄─────────────────────│
         │◄─────────────────────│                      │
         │                      │                      │
         │  2. Encrypt          │                      │
         │     Credentials      │                      │
         │     with Buyer Key   │                      │
         │                      │                      │
         │  3. Upload Encrypted │                      │
         │     Package + Hash   │                      │
         │─────────────────────►│                      │
         │                      │                      │
         │                      │  4. Store Hash       │
         │                      │     On-chain         │
         │                      │                      │
         │                      │  5. Buyer Decrypts   │
         │                      │─────────────────────►│
         │                      │                      │
         │                      │  6. Verify & Confirm │
         │                      │◄─────────────────────│
         │  7. Funds Released   │                      │
         │◄─────────────────────│                      │
```

#### Credential Schema

```json
{
  "handover_id": "uuid",
  "listing_id": 123,
  "encrypted_payload": "base64...",
  "encryption_method": "ecies-secp256k1",
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
      "verified": true
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

### AI Backend API Specification

#### Base URL
```
Production: https://api.valyra.io/v1
Staging: https://api-staging.valyra.io/v1
```

#### Endpoints

**Valuation Service:**
```
POST /valuation/analyze
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
    "low": 30000000,        // IDR
    "mid": 45000000,
    "high": 60000000
  },
  "confidence": 0.75,
  "reasoning": "Based on 2.5-4x ARR for similar...",
  "comparable_sales": [...]
}
```

**Verification Service:**
```
POST /verify/dns
Request:
{
  "domain": "example.com",
  "expected_code": "valyra-verify-abc123"
}

Response:
{
  "verified": true,
  "verification_level": "STANDARD",
  "timestamp": "2025-12-10T10:00:00Z"
}

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
  "discrepancy": false
}
```

**Chat Service:**
```
POST /chat/message
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
  "agent_wallet": "0x..."  // For signing attestations
}
```

#### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/valuation/*` | 10 | 1 minute |
| `/verify/*` | 20 | 1 minute |
| `/chat/*` | 60 | 1 minute |

#### Error Responses
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again in 30 seconds.",
    "retry_after": 30
  }
}
```

---

### System Interfaces

* **Blockchain Interface:** JSON-RPC connection to Base Mainnet via **Viem/Wagmi**.
* **Coinbase AgentKit (CDP SDK):** Python SDK used to manage the AI's wallet and interact with the Base network programmatically.
* **IDRX Interface:** Interaction with the official IDRX ERC-20 contract (`transferFrom`, `approve`).
* **OpenAI API:** GPT-4o model used by the Agent to parse unstructured business descriptions.

### User Interfaces

* **Dashboard:** Built with **OnchainKit**.
    * *Home:* List of active startups for sale with filter/search.
    * *Sell Modal:* Input form for URL, Revenue, Description.
    * *Agent Chat:* A floating chat window where the user can ask "Is this business overpriced?" and the AI Agent answers.
    * *Escrow Tracker:* Visual progress bar showing transaction state.
* **Wallet Connection:** Standard "Connect Wallet" button supporting Coinbase Wallet and Metamask.

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
4. **User Acceptance Testing (UAT):** "Corridor testing" with non-technical users to ensure the buying flow is intuitive.

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
| TC-001 | Seller creates listing | Listing appears on marketplace, `ListingCreated` event emitted |
| TC-002 | Buyer deposits IDRX | Funds locked in escrow, state = `FUNDED` |
| TC-003 | Seller uploads credentials | Credential hash stored, state = `DELIVERED` |
| TC-004 | Buyer confirms receipt | Funds released to seller, state = `COMPLETED` |

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
| TC-202 | Seller responds to dispute | Evidence stored, ready for arbitration |
| TC-203 | Admin resolves with FULL_REFUND | Buyer receives 100% of escrowed funds |
| TC-204 | Admin resolves with PARTIAL_REFUND | Funds split per resolution percentage |

---

## Monitoring and Alerting

### Logging

| Component | Tool | Data Logged |
|-----------|------|-------------|
| Smart Contracts | The Graph / Subgraph | All events indexed |
| AI Backend | Structured JSON logs | API requests, Agent responses, errors |
| Frontend | Vercel Analytics | User sessions, errors, performance |

### Alerting Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| High Gas Price | Gas > $0.50 | Pause non-critical mainnet operations |
| AI Backend Down | No response for 5 min | Page on-call, show fallback UI |
| Dispute Spike | >5 disputes in 1 hour | Investigate for potential exploit |
| Failed Transactions | >3 consecutive failures | Investigate contract state |

### Dashboard Metrics

* Active Listings Count
* Total Value Locked (TVL) in Escrow
* Transaction Volume (24h, 7d, 30d)
* Average Transaction Time
* Dispute Rate
* AI Agent Response Time (p95)

---

## Reporting and Metrics

* **Gas Reports:** Generated by Hardhat Gas Reporter.
* **Agent Latency:** Measure time taken from "User Request" to "Agent Reply".
* **GitHub Actions:** CI/CD status badges in the README.

---

## Deployment Plan

### Deployment Environment

* **Smart Contracts:** Base Mainnet.
    * *Requirement:* Real ETH (on Base) for gas deployment (~$2).
* **Backend (AI):** **Railway** or **Render** (Cloud hosting that supports Python/Docker).
* **Frontend:** **Vercel** (Seamless Next.js hosting).
* **Credential Vault:** Encrypted storage service (AWS S3 with KMS or self-hosted).

### Deployment Tools

* **Hardhat Deploy:** Scriptable deployment to manage contract addresses.
* **Vercel CLI:** For frontend CI/CD.
* **Docker:** For backend containerization.
* **Git:** Version control.

### Deployment Steps

1. **Contract Deployment:**
    * Run `npx hardhat run scripts/deploy.js --network base_mainnet`.
    * Save the output `MarketplaceAddress` and `EscrowAddress`.
    * Verify source code on **Basescan**.
2. **Backend Configuration:**
    * Update `ENV` variables in Railway with the new Contract Addresses and Coinbase CDP API Keys.
    * Deploy Python container.
3. **Frontend Build:**
    * Update `config.ts` with the Mainnet Contract Addresses.
    * Push to `main` branch -> Vercel auto-deploys.
4. **Liquidity Check:**
    * Ensure the test Buyer wallet has real **IDRX**. (Can swap USDC for IDRX on Uniswap/Aerodrome on Base).

### Post-Deployment Verification

* **Smoke Test:** Create a "Test Listing" for 100 Rupiah (IDRX). Buy it with a secondary wallet.
* **Agent Check:** Query the Agent via the live frontend. Ensure it responds and doesn't time out.
* **Dispute Flow Test:** Test the full dispute resolution flow on mainnet.

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

---

## Security Considerations

### Smart Contract Security

* **ReentrancyGuard:** All state-changing functions use OpenZeppelin's ReentrancyGuard.
* **Access Control:** Role-based access for admin functions.
* **Timelock Safety:** All auto-release functions respect minimum time delays.
* **Audit:** Pre-mainnet audit recommended (Hashlock, Sherlock).

### Backend Security

* **Rate Limiting:** Prevent API abuse.
* **Input Sanitization:** AI filters malicious inputs.
* **Wallet Segregation:** Agent wallet separate from escrow funds.

### Credential Vault Security

* **Asymmetric Encryption:** ECIES with buyer's wallet public key.
* **No Plaintext Storage:** Credentials encrypted before upload.
* **Auto-Purge:** Credentials deleted 30 days post-transaction.
* **Access Logging:** All credential access attempts logged.

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| **MRR** | Monthly Recurring Revenue |
| **IDRX** | Indonesian Rupiah Stablecoin on Base |
| **CDP** | Coinbase Developer Platform |
| **SBT** | Soulbound Token (non-transferable NFT) |

### Contract Addresses (To Be Filled)
| Contract | Sepolia | Mainnet |
|----------|---------|---------|
| Marketplace | TBD | TBD |
| Escrow | TBD | TBD |
| IDRX (Official) | TBD | TBD |

---

**Changelog:**
* **v2.0 (Dec 10, 2025):** Added dispute resolution contract logic, credential handover architecture, timelock mechanism, comprehensive event definitions, API specifications, monitoring/alerting section. Aligned with PRD v2.0.
* **v1.0 (Dec 10, 2025):** Initial TDD draft.