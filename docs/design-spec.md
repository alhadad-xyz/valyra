# Design Spec: Valyra
**Author:** [Your Name]
**Date:** December 10, 2025
**Version:** 2.0 (Hackathon MVP - Revised)

---

## Product Overview
Valyra is an autonomous, decentralized marketplace built on the Base L2 blockchain designed to facilitate the acquisition of micro-SaaS and digital businesses. It solves the "liquidity trap" faced by Indonesian indie hackers and small business owners who cannot access traditional M&A brokers due to high fees and complexity.

By integrating **Coinbase AgentKit (AI)** for automated valuation and due diligence, and **IDRX (Indonesian Rupiah Stablecoin)** for localized payments, Valyra removes the friction of trust. The value proposition is simple: **Turn your side-project into cash in minutes, not months, without intermediaries.**

---

## Product Description
Valyra operates as a web-based dApp (Decentralized Application) that feels like a modern e-commerce platform. It abstracts away the complexities of blockchain, presenting users with a clean, familiar interface.

**Core Components:**
1. **The Agent Interface:** Unlike traditional static forms, the onboarding process is conversational. The AI Agent "interviews" the seller to gather business data (Revenue, Tech Stack, URLs).
2. **The Smart Escrow:** A visible, reassuring vault system. Users can see exactly where their funds are (Locked, Released, or Disputed) via a simple progress bar UI.
3. **The Marketplace Feed:** A card-based layout displaying businesses for sale, with AI-generated "Trust Scores" and "Fair Value Estimates" badges.
4. **The Credential Vault:** Secure, encrypted handover system ensuring safe transfer of business credentials.
5. **The Dispute Center:** Transparent resolution flow for contested transactions.

**System Interaction:**
The frontend communicates with the **Base Blockchain** for all financial settlements. Simultaneously, it connects to a **Python-based AI Server** (via REST API) which handles the "thinking" (analyzing business data). The system uses **OnchainKit** to manage wallet connections, ensuring the user stays within the Base ecosystem context.

---

## User Personas

### Persona A: Rian (The Seller)
* **Demographics:** 24 years old, Software Engineer based in Bandung.
* **Behavior:** Builds multiple side projects (tools, chatbots) on weekends.
* **Motivation:** Wants to sell an abandoned project to pay for a new laptop/server costs.
* **Pain Points:** Scared of being scammed by buyers on Facebook groups. Hates the idea of paying a lawyer for a $2,000 transaction.
* **Needs:** A "List it and forget it" solution that guarantees payment if he hands over the code.

### Persona B: Bu Sari (The Buyer)
* **Demographics:** 35 years old, SME owner based in Jakarta.
* **Behavior:** Looking to diversify investment into digital assets but lacks deep coding knowledge.
* **Motivation:** Wants passive income streams.
* **Pain Points:** Cannot tell if a digital business is "real" or a scam. Overwhelmed by technical jargon.
* **Needs:** An "Expert Friend" (The AI Agent) to tell her if the price is fair and the business is legitimate.

---

## Design Requirements
The design must bridge the gap between "Web2 Ease of Use" and "Web3 Security."

### Visual Identity
* **Primary Color:** "Base Blue" (#0052FF) for primary actions
* **Accent Colors:**
  * "Money Green" (#10B981) for positive values/confirmations
  * "Warning Yellow" (#F59E0B) for pending states
  * "Alert Red" (#EF4444) for disputes/errors
* **Backgrounds:** Clean White (#FFFFFF) / Soft Gray (#F9FAFB)
* **Typography:** Inter (primary), Roboto Mono (code/numbers)
* **Border Radius:** 8px (buttons), 12px (cards), 16px (modals)
* **Shadows:** Subtle elevation for cards and modals

### UX Principles
* **Mobile First:** Indonesia is mobile-first; the entire negotiation flow must work on a 6-inch screen.
* **Transparent Fees:** Gas fees (even if low on Base) should be estimated and shown before clicking.
* **Localization:** Currencies must be displayed in **IDR/IDRX**, not USD, to reduce cognitive load for local users.
* **Progressive Disclosure:** Don't overwhelm users with all options at once.
* **Trust Signals:** Show verification badges, escrow status, and AI confidence clearly.

### Responsive Breakpoints
| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| Mobile S | 320px | Small phones |
| Mobile L | 375px | Standard phones |
| Tablet | 768px | Tablets |
| Desktop | 1024px | Laptops |
| Desktop L | 1440px | Large monitors |

---

## Screen Wireframes

### 1. Home / Marketplace Feed
```
┌─────────────────────────────────────┐
│  🔗 Connect Wallet    [VALYRA]   🔔 │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ 🔍 Search businesses...     │    │
│  └─────────────────────────────┘    │
│                                     │
│  [All] [SaaS] [E-commerce] [Content]│
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🏷️ Project Name             │    │
│  │ ─────────────────────────── │    │
│  │ MRR: Rp 1.500.000 📈        │    │
│  │ Tech: Next.js, Supabase     │    │
│  │ ✅ Verified (Standard)       │    │
│  │ ─────────────────────────── │    │
│  │ Asking: Rp 45.000.000       │    │
│  │ AI Fair Value: Rp 42.000.000│    │
│  │           [View Details →]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🏷️ Another Project          │    │
│  │         ...                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ════════════════════════════════   │
│  [Home] [My Listings] [Profile]     │
└─────────────────────────────────────┘
```

### 2. Listing Detail Page
```
┌─────────────────────────────────────┐
│  ← Back                        🔔   │
├─────────────────────────────────────┤
│  Project Name                       │
│  ✅ Verified (Enhanced)             │
│  ─────────────────────────────────  │
│                                     │
│  📊 FINANCIAL METRICS               │
│  ┌─────────────────────────────┐    │
│  │ MRR: Rp 1.500.000           │    │
│  │ Annual: Rp 18.000.000       │    │
│  │ Profit: Rp 1.200.000/mo     │    │
│  │ Trend: 📈 Growing (+15%/mo) │    │
│  └─────────────────────────────┘    │
│                                     │
│  🤖 AI VALUATION                    │
│  ┌─────────────────────────────┐    │
│  │ Fair Value: Rp 42-48 Juta   │    │
│  │ Confidence: ████████░░ 80%  │    │
│  │ "This is priced fairly..."  │    │
│  │          [Ask AI More →]    │    │
│  └─────────────────────────────┘    │
│                                     │
│  📦 INCLUDED ASSETS                 │
│  ✅ Domain  ✅ Source Code          │
│  ✅ Customers  ⬜ Social Accounts   │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 💰 Asking Price             │    │
│  │    Rp 45.000.000 IDRX       │    │
│  │                             │    │
│  │   [Make an Offer]           │    │
│  │   [💬 Chat with AI]         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 3. Escrow Progress Tracker
```
┌─────────────────────────────────────┐
│  Transaction #12345                 │
├─────────────────────────────────────┤
│                                     │
│  ●───●───●───○───○                  │
│  1   2   3   4   5                  │
│                                     │
│  ✅ 1. Deposit Locked               │
│     Rp 45.000.000 IDRX             │
│     Dec 10, 2025 10:00             │
│                                     │
│  ✅ 2. Credentials Uploaded         │
│     5 items verified               │
│     Dec 11, 2025 14:30             │
│                                     │
│  🔄 3. Verification Period          │
│     You have 72 hours to verify    │
│     ⏱️ 48:23:15 remaining          │
│                                     │
│  ○ 4. Confirm Receipt               │
│                                     │
│  ○ 5. Funds Released                │
│                                     │
│  ─────────────────────────────────  │
│  [View Credentials] [Raise Dispute] │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Everything working?        │    │
│  │  [✅ Confirm & Release]     │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 4. Dispute Filing Modal
```
┌─────────────────────────────────────┐
│  ⚠️ Raise a Dispute            ✕    │
├─────────────────────────────────────┤
│                                     │
│  What went wrong?                   │
│  ┌─────────────────────────────┐    │
│  │ ○ Credentials don't work    │    │
│  │ ○ Revenue was misrepresented│    │
│  │ ○ No credentials provided   │    │
│  │ ○ Business not as described │    │
│  └─────────────────────────────┘    │
│                                     │
│  Describe the issue:                │
│  ┌─────────────────────────────┐    │
│  │ The Stripe account login... │    │
│  │                             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Upload Evidence:                   │
│  [📎 Screenshots, logs, etc.]       │
│                                     │
│  ─────────────────────────────────  │
│  ⚠️ Disputes are reviewed by our    │
│  team within 96 hours.             │
│                                     │
│  [Cancel]        [Submit Dispute]   │
└─────────────────────────────────────┘
```

### 5. Seller Credential Upload
```
┌─────────────────────────────────────┐
│  📦 Upload Credentials         ✕    │
├─────────────────────────────────────┤
│                                     │
│  Buyer is waiting for handover.     │
│  All credentials will be encrypted  │
│  with the buyer's wallet key.       │
│                                     │
│  ☐ Domain Registrar *               │
│    Service: [Namecheap    ▼]        │
│    Username: [_______________]      │
│    Password: [_______________]      │
│                                     │
│  ☐ Hosting *                        │
│    Service: [Vercel       ▼]        │
│    [Link GitHub Account]            │
│                                     │
│  ☐ Source Code *                    │
│    [Invite to GitHub Repo]          │
│                                     │
│  ☐ Payment Processor *              │
│    [Transfer Stripe Account]        │
│                                     │
│  ☐ Email Access (Optional)          │
│    [Add Details...]                 │
│                                     │
│  ─────────────────────────────────  │
│  🔒 Encrypted with buyer's key      │
│                                     │
│  [Cancel]     [Upload & Notify ✓]   │
└─────────────────────────────────────┘
```

---

## UI States

### Loading States
| State | Visual Treatment |
|-------|------------------|
| Page Loading | Full-screen skeleton with pulsing cards |
| Button Loading | Spinner inside button, disabled state |
| Transaction Pending | Progress bar with "Confirming on Base..." |
| AI Thinking | Animated dots with "Agent is analyzing..." |

### Empty States
| Screen | Empty State Message | CTA |
|--------|---------------------|-----|
| Marketplace | "No listings yet. Be the first to sell!" | [List Your Business] |
| My Listings | "You haven't listed anything yet." | [Create Listing] |
| My Acquisitions | "You haven't bought any businesses yet." | [Browse Marketplace] |
| Notifications | "All caught up! No new notifications." | None |

### Error States
| Error Type | User-Friendly Message | Action |
|------------|----------------------|--------|
| Wallet Rejected | "Transaksi dibatalkan oleh dompet Anda." | [Try Again] |
| Insufficient Balance | "Saldo IDRX tidak cukup. Butuh Rp X lagi." | [Get IDRX] |
| Network Error | "Koneksi terputus. Cek internet Anda." | [Retry] |
| Rate Limited | "Terlalu banyak permintaan. Tunggu sebentar." | Auto-retry countdown |
| Contract Error | "Transaksi gagal. Silakan coba lagi." | [Contact Support] |

### Success States
| Action | Confirmation |
|--------|--------------|
| Listing Created | "🎉 Bisnis Anda sudah live!" + Share button |
| Deposit Made | "✅ Dana terkunci. Menunggu handover." |
| Credentials Uploaded | "📦 Kredensial terkirim ke pembeli." |
| Transaction Complete | "🎊 Transaksi selesai! Dana telah diterima." |

---

## Onboarding Flow

### First-Time Seller Flow
```
Step 1: Connect Wallet
┌─────────────────────────────────────┐
│  Welcome to Valyra! 🚀             │
│                                     │
│  Connect your wallet to start      │
│  selling your digital business.    │
│                                     │
│  [🔵 Coinbase Wallet]               │
│  [🦊 MetaMask]                      │
│                                     │
│  No crypto wallet?                  │
│  [Get Coinbase Wallet →]            │
└─────────────────────────────────────┘

Step 2: Profile Setup
┌─────────────────────────────────────┐
│  Your Seller Profile               │
│                                     │
│  Display Name:                      │
│  [________________]                 │
│                                     │
│  Email (for notifications):         │
│  [________________]                 │
│                                     │
│  Location:                          │
│  [Indonesia        ▼]               │
│                                     │
│            [Continue →]             │
└─────────────────────────────────────┘

Step 3: List Your First Business
┌─────────────────────────────────────┐
│  Let's list your business! 🎯      │
│                                     │
│  Our AI Agent will help you        │
│  find the right price.              │
│                                     │
│  What's your business URL?          │
│  [________________]                 │
│                                     │
│  Tell us about it:                  │
│  ┌─────────────────────────────┐    │
│  │ "It's a SaaS tool that..." │    │
│  └─────────────────────────────┘    │
│                                     │
│  [✨ Let AI Analyze →]              │
└─────────────────────────────────────┘

Step 4: AI Valuation
┌─────────────────────────────────────┐
│  🤖 Analyzing...                    │
│                                     │
│  ████████░░░░░░░░░░ 45%            │
│  Scanning website...                │
│                                     │
│  ──── COMPLETE ────                 │
│                                     │
│  Based on my analysis:              │
│  • MRR: Rp 1.500.000               │
│  • Tech: Next.js, Supabase         │
│  • Traffic: ~10k/month             │
│                                     │
│  Suggested Price:                   │
│  Rp 42.000.000 - Rp 48.000.000     │
│                                     │
│  [Adjust Price] [✓ Accept & List]   │
└─────────────────────────────────────┘
```

### First-Time Buyer Flow
```
Step 1: Connect + Browse
┌─────────────────────────────────────┐
│  Find your next investment 🔍      │
│                                     │
│  Connect wallet to browse           │
│  verified businesses.               │
│                                     │
│  [🔵 Coinbase Wallet]               │
│  [🦊 MetaMask]                      │
└─────────────────────────────────────┘

Step 2: First Purchase Education
┌─────────────────────────────────────┐
│  How buying works 📚               │
│                                     │
│  1. 💰 You deposit IDRX            │
│     Funds are locked safely.        │
│                                     │
│  2. 📦 Seller uploads credentials   │
│     Encrypted just for you.         │
│                                     │
│  3. ✅ You verify access            │
│     72 hours to confirm.            │
│                                     │
│  4. 🎉 Release payment              │
│     Seller gets paid.               │
│                                     │
│  ⚠️ Problem? Raise a dispute.       │
│                                     │
│            [Got it! →]              │
└─────────────────────────────────────┘
```

---

## Notification System

### Notification Types
| Type | Icon | Trigger | Message Example |
|------|------|---------|-----------------|
| Offer Received | 💰 | Buyer makes offer | "New offer: Rp 40.000.000 for 'Project X'" |
| Deposit Made | 🔒 | Escrow funded | "Buyer deposited Rp 45.000.000 - Time to upload credentials" |
| Credentials Ready | 📦 | Seller uploads | "Credentials are ready! Verify within 72h" |
| Verification Reminder | ⏰ | 24h before deadline | "24 hours left to verify credentials" |
| Dispute Filed | ⚠️ | Dispute raised | "Dispute raised on Transaction #123" |
| Transaction Complete | 🎉 | Funds released | "Rp 45.000.000 received! Transaction complete" |
| Price Alert | 📈 | Similar listing sold | "Similar business sold for Rp 50.000.000" |

### Notification Channels
| Channel | Usage | Opt-in |
|---------|-------|--------|
| In-App | Primary - all notifications | Always on |
| Email | Critical only (deposits, disputes) | Default on |
| Push (PWA) | Optional for mobile users | Opt-in |

### Notification Center UI
```
┌─────────────────────────────────────┐
│  🔔 Notifications                   │
│  ─────────────────────────────────  │
│                                     │
│  TODAY                              │
│  ┌─────────────────────────────┐    │
│  │ 💰 New offer received       │    │
│  │ Rp 42.000.000 for "My SaaS" │    │
│  │ 2 hours ago         [View]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  YESTERDAY                          │
│  ┌─────────────────────────────┐    │
│  │ ✅ Verification complete    │    │
│  │ Funds released to you       │    │
│  │ Yesterday at 14:30   [View] │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Mark All as Read]                 │
└─────────────────────────────────────┘
```

---

## Functional Requirements

### 1. User Authentication & Profile
* **Wallet Connect:** Support for Coinbase Wallet and MetaMask via OnchainKit.
* **Identity:** Basic profile mapping wallet address to a username (stored on-chain or via ENS/Basenames).
* **Onboarding:** Progressive profile completion with first-time user guidance.

### 2. Seller Workflow (The Agent Interview)
* **Input Parsing:** The AI must accept raw text descriptions or URLs and extract structured data (MRR, Traffic, Tech Stack).
* **Valuation Engine:** The system must output a specific price range in IDRX based on the input data using a Comparative Market Analysis logic.
* **Ownership Verification:** DNS TXT verification, OAuth connection for revenue platforms.
* **Listing Creation:** A button to sign a transaction that posts the listing to the smart contract.
* **Credential Handover:** Encrypted upload of business credentials to buyer.

### 3. Buyer Workflow (Purchase & Escrow)
* **Proof of Funds:** Verify wallet balance before allowing offers.
* **Deposit:** A function to approve and transfer IDRX to the Smart Contract.
* **Dashboard:** A view showing "My Acquisitions" with status indicators (Pending Handover, Completed).
* **Verification Period:** 72-hour window to verify received credentials.
* **Dispute:** A mechanism to flag a transaction if credentials are incorrect or missing.

### 4. Back-End Processes
* **Event Listening:** The backend must listen for blockchain events to trigger notifications.
* **Sanitization:** AI must filter out malicious links or PII (Personal Identifiable Information) from public listings.
* **Timeouts:** Automatic escrow actions based on time-locked deadlines.

---

## Non-Functional Requirements

### 1. Performance
* **Response Time:** AI Valuation should return results in under 5 seconds.
* **Blockchain Finality:** UI must update transaction status within 2 seconds of block confirmation (Base L2 speed).
* **Page Load:** First Contentful Paint < 1.5 seconds.

### 2. Security
* **Smart Contract Auditing:** Use standard OpenZeppelin ReentrancyGuards for all financial functions.
* **Wallet Segregation:** The AI Agent's wallet used for signing attestations must be separate from the Escrow contract holding user funds.
* **Credential Encryption:** ECIES asymmetric encryption with buyer's wallet key.

### 3. Usability
* **Language:** The interface should support Bahasa Indonesia (optional for MVP, but design must allow for i18n).
* **Error Handling:** Crypto errors (e.g., "User rejected request") must be translated into human-friendly messages ("Transaksi dibatalkan").
* **Accessibility:** WCAG 2.1 AA compliance target (color contrast, keyboard navigation).

### 4. Reliability
* **Uptime:** 99.5% availability target.
* **Fallback:** Graceful degradation if AI backend is unavailable.

---

## Milestones and Timeline
**Project Duration:** Dec 10, 2025 – Jan 31, 2026 (7 Weeks)

### Development Milestones

1. **Phase 1: Foundation (Weeks 1-2)**
   * *Goal:* Smart Contracts deployed on Base Sepolia.
   * *Output:* `Escrow.sol` and `Marketplace.sol` verified on Basescan.
   * *Target:* Dec 24, 2025.

2. **Phase 2: Intelligence (Weeks 3-4)**
   * *Goal:* Coinbase AgentKit Integration.
   * *Output:* Python backend live; Agent can read input and suggest prices.
   * *Target:* Jan 7, 2026.

3. **Phase 3: Integration (Weeks 5-6)**
   * *Goal:* Frontend meets Backend.
   * *Output:* Next.js UI connected to Smart Contracts via OnchainKit. End-to-end flow working.
   * *Target:* Jan 21, 2026.

4. **Phase 4: Launch Prep (Week 7)**
   * *Goal:* Mainnet Deploy & Demo.
   * *Output:* Deploy to Base Mainnet, IDRX Integration, 1-minute Demo Video.
   * *Target:* Jan 30, 2026.

---

## Risks and Mitigation

### Risk 1: IDRX Integration Issues
* **Risk:** Difficulty obtaining IDRX on Testnet or technical issues with the token contract.
* **Mitigation:** Create a "MockIDRX" token for development/testing purposes. Switch to real IDRX only for the final Mainnet deployment.

### Risk 2: AI "Hallucinations"
* **Risk:** The AI Agent suggests a ridiculously high or low price for a business.
* **Mitigation:** Implement "Guardrails" in the prompt engineering (e.g., "Never value a business above 10x Annual Revenue"). Add a UI Disclaimer: "Valuation is an estimate only."

### Risk 3: User Trust (Scams)
* **Risk:** A seller takes the money but provides a fake password.
* **Mitigation:** Multi-layer protection:
  * 72-hour verification window before funds release
  * Dispute resolution mechanism with evidence submission
  * On-chain reputation system penalizing bad actors

### Risk 4: Credential Security Breach
* **Risk:** Credentials exposed during handover.
* **Mitigation:** 
  * End-to-end encryption with buyer's wallet key
  * Credentials never stored in plaintext
  * Auto-purge after 30 days

---

## Component Library

### Buttons
| Variant | Usage | Style |
|---------|-------|-------|
| Primary | Main CTAs | Base Blue, white text, hover darken |
| Secondary | Secondary actions | White, blue border |
| Danger | Destructive actions | Red background |
| Ghost | Tertiary actions | Transparent, blue text |
| Disabled | Blocked actions | Gray, no hover |

### Cards
| Variant | Usage |
|---------|-------|
| Listing Card | Marketplace items |
| Stat Card | Dashboard metrics |
| Status Card | Transaction progress |
| Empty Card | Empty states |

### Badges
| Variant | Usage |
|---------|-------|
| Verification | ✅ Verified (level) |
| Status | Transaction states |
| AI Confidence | Valuation reliability |

### Input Fields
| Variant | Usage |
|---------|-------|
| Text Input | General text entry |
| Number Input | IDRX amounts with formatting |
| Textarea | Long descriptions |
| Select | Dropdown choices |
| File Upload | Evidence/screenshots |

---

**Changelog:**
* **v2.0 (Dec 10, 2025):** Added wireframe descriptions, UI states (loading/empty/error/success), onboarding flow, notification system design, responsive breakpoints, component library. Aligned with PRD v2.0 features (dispute resolution, credential handover, ownership verification).
* **v1.0 (Dec 10, 2025):** Initial Design Spec draft.