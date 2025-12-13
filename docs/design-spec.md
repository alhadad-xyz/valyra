# Design Spec: Valyra
**Author:** alhadad
**Date:** December 11, 2025
**Version:** 2.4 (Hackathon MVP - Final Refinements)

---

## Product Overview
Valyra is an autonomous, decentralized marketplace built on the Base L2 blockchain designed to facilitate the acquisition of micro-SaaS and digital businesses. It solves the "liquidity trap" faced by Indonesian indie hackers and small business owners who cannot access traditional M&A brokers due to high fees and complexity.

By integrating **Coinbase AgentKit (AI)** for automated valuation and due diligence, and **IDRX (Indonesian Rupiah Stablecoin)** for localized payments, Valyra removes the friction of trust. The value proposition is simple: **Turn your side-project into cash in minutes, not months, with a transparent 2.5% platform fee.**

---

## Product Description
Valyra operates as a web-based dApp (Decentralized Application) that feels like a modern e-commerce platform. It abstracts away the complexities of blockchain, presenting users with a clean, familiar interface.

**Core Components:**
1. **The Agent Interface:** Unlike traditional static forms, the onboarding process is conversational. The AI Agent "interviews" the seller to gather business data (Revenue, Tech Stack, URLs) with token-gating to filter tire-kickers.
2. **The Smart Escrow:** A visible, reassuring vault system. Users can see exactly where their funds are (Locked, Released, or Disputed) via a simple progress bar UI. Includes transparent 2.5% platform fee display and **earnest money deposits**.
3. **The Marketplace Feed:** A card-based layout displaying businesses for sale, with AI-generated "Trust Scores", "Fair Value Estimates" badges, and **seller activity indicators**.
4. **The Credential Vault:** Secure, encrypted handover system with **Smart Wallet compatibility** (server-side backup for cross-device recovery) and **arbitrator encryption** for dispute resolution.
5. **The Dispute Center:** Transparent resolution flow with clear disclosure of manual (centralized) arbitration for MVP. **Arbitrator can verify credentials** during disputes.
6. **Build ID Verification:** Cryptographic proof linking live site to source code with **JIT re-verification** at deposit time.
7. **Offer System:** **Earnest money (5%)** deposits to prove serious intent.

**System Interaction:**
The frontend communicates with the **Base Blockchain** for all financial settlements. Simultaneously, it connects to a **Python-based AI Server** (via REST API) which handles the "thinking" (analyzing business data). The system uses **OnchainKit** to manage wallet connections and **Basenames** for native Base identity integration.

---

## User Personas

### Persona A: Rian (The Seller)
* **Demographics:** 24 years old, Software Engineer based in Bandung.
* **Behavior:** Builds multiple side projects (tools, chatbots) on weekends.
* **Motivation:** Wants to sell an abandoned project to pay for a new laptop/server costs.
* **Pain Points:** Scared of being scammed by buyers on Facebook groups. Hates the idea of paying a lawyer for a $2,000 transaction.
* **Needs:** A "List it and forget it" solution that guarantees payment if he hands over the code, with clear IP transfer.

### Persona B: Bu Sari (The Buyer)
* **Demographics:** 35 years old, SME owner based in Jakarta.
* **Behavior:** Looking to diversify investment into digital assets but lacks deep coding knowledge.
* **Motivation:** Wants passive income streams.
* **Pain Points:** Cannot tell if a digital business is "real" or a scam. Overwhelmed by technical jargon.
* **Needs:** An "Expert Friend" (The AI Agent) to tell her if the price is fair and the business is legitimate, with verified code matching the live site.

---

## Design Requirements
The design must bridge the gap between "Web2 Ease of Use" and "Web3 Security."

### Visual Identity
* **Primary Color:** "Base Blue" (#0052FF) for primary actions
* **Accent Colors:**
  * "Money Green" (#10B981) for positive values/confirmations
  * "Warning Yellow" (#F59E0B) for pending states
  * "Alert Red" (#EF4444) for disputes/errors
  * "Fee Gray" (#6B7280) for platform fee displays
* **Backgrounds:** Clean White (#FFFFFF) / Soft Gray (#F9FAFB)
* **Typography:** Inter (primary), Roboto Mono (code/numbers/prices)
* **Border Radius:** 8px (buttons), 12px (cards), 16px (modals)
* **Shadows:** Subtle elevation for cards and modals

### UX Principles
* **Mobile First:** Indonesia is mobile-first; the entire negotiation flow must work on a 6-inch screen.
* **Transparent Fees:** Platform fee (2.5%) and gas fees must be clearly shown before any transaction.
* **Localization:** Currencies must be displayed in **IDR/IDRX**, not USD, to reduce cognitive load for local users.
* **Progressive Disclosure:** Don't overwhelm users with all options at once.
* **Trust Signals:** Show verification badges, escrow status, AI confidence, and Build ID verification clearly.
* **Honest Centralization:** Clearly disclose when processes are centralized (e.g., dispute resolution).

### Responsive Breakpoints
| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| Mobile S | 320px | Small phones |
| Mobile L | 375px | Standard phones |
| Tablet | 768px | Tablets |
| Desktop | 1024px | Laptops |
| Desktop L | 1440px | Large monitors |

### Mobile Deep Linking (NEW)

> [!IMPORTANT]
> **App-to-App UX:** On mobile, wallet interactions must trigger Universal Links to open the wallet app directly, then return to the browser.

#### Deep Link Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE WALLET FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User taps "Connect Wallet" on mobile browser                │
│                                                                 │
│  2. Detect device:                                              │
│     ├─▶ iOS: universal link → coinbase://wallet/connect         │
│     └─▶ Android: intent → com.coinbase.android.wallet           │
│                                                                 │
│  3. Wallet app opens, user approves connection                  │
│                                                                 │
│  4. Deep link callback to Valyra:                               │
│     valyra://wallet-connected?address=0x...                     │
│                                                                 │
│  5. Browser refocuses with wallet connected                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Wallet App Detection
| Platform | Coinbase Wallet | MetaMask |
|----------|-----------------|----------|
| iOS | `coinbase://` | `metamask://` |
| Android | `com.coinbase.android.wallet` | `io.metamask` |
| Fallback | App Store link | Play Store link |

---

## Screen Wireframes

### 1. Home / Marketplace Feed
```
┌─────────────────────────────────────┐
│  🔗 Connect Wallet    [VALYRA]   🔔 │
│  ◯ user.base.eth (Basename)        │
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
│  │ ✅ Verified (Enhanced)       │    │
│  │ ✅ Code Verified             │    │
│  │ ─────────────────────────── │    │
│  │ Asking: Rp 45.000.000       │    │
│  │ AI Fair Value: Rp 42.000.000│    │
│  │           [View Details →]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🏷️ Another Project          │    │
│  │ ⚠️ Code Unverified          │    │
│  │         ...                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ════════════════════════════════   │
│  [Home] [My Listings] [Profile]     │
└─────────────────────────────────────┘
```

### 2. Listing Detail Page (with Fee Breakdown)
```
┌─────────────────────────────────────┐
│  ← Back                        🔔   │
├─────────────────────────────────────┤
│  Project Name                       │
│  ✅ Verified (Enhanced)             │
│  ✅ Code Verified (Build ID match)  │
│  ─────────────────────────────────  │
│                                     │
│  📊 FINANCIAL METRICS               │
│  ┌─────────────────────────────┐    │
│  │ MRR: Rp 1.500.000           │    │
│  │ Annual: Rp 18.000.000       │    │
│  │ Profit: Rp 1.200.000/mo     │    │
│  │ Trend: 📈 Growing (+15%/mo) │    │
│  │ ✅ Verified via Stripe OAuth │    │
│  └─────────────────────────────┘    │
│                                     │
│  🤖 AI VALUATION                    │
│  ┌─────────────────────────────┐    │
│  │ Fair Value: Rp 42-48 Juta   │    │
│  │ Confidence: ████████░░ 80%  │    │
│  │ Guardrails: ✅ Within 10x ARR│    │
│  │ "This is priced fairly..."  │    │
│  │          [Ask AI More →]    │    │
│  │  (Requires $10 balance)     │    │
│  └─────────────────────────────┘    │
│                                     │
│  📦 INCLUDED ASSETS                 │
│  ✅ Domain  ✅ Source Code          │
│  ✅ Customers  ⬜ Social Accounts   │
│  📜 IP Assignment: Signed ✓        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 💰 Asking Price             │    │
│  │    Rp 45.000.000 IDRX       │    │
│  │ ─────────────────────────── │    │
│  │ 📋 Price Breakdown:         │    │
│  │    Seller receives: 43.875m │    │
│  │    Platform fee:     1.125m │    │
│  │    (2.5%)                   │    │
│  │ ─────────────────────────── │    │
│  │   [Make an Offer]           │    │
│  │   [💬 Chat with AI]         │    │
│  │   [Pay with USDC ↔️]        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 3. Escrow Progress Tracker (with Fee Display)
```
┌─────────────────────────────────────┐
│  Transaction #12345                 │
├─────────────────────────────────────┤
│                                     │
│  ●───●───●───○───○                  │
│  1   2   3   4   5                  │
│                                     │
│  ✅ 1. Deposit Locked               │
│     Total: Rp 45.000.000 IDRX       │
│     ├─ Seller payout: 43.875m      │
│     └─ Platform fee:   1.125m (2.5%)│
│     Dec 10, 2025 10:00             │
│                                     │
│  ✅ 2. Credentials Uploaded         │
│     5 items verified               │
│     🔐 Encrypted (Smart Wallet OK) │
│     Dec 11, 2025 14:30             │
│                                     │
│  🔄 3. Verification Period          │
│     You have 72 hours to verify    │
│     ⏱️ 48:23:15 remaining          │
│                                     │
│  ○ 4. Confirm Receipt               │
│                                     │
│  ○ 5. Funds Released                │
│     Seller gets: Rp 43.875.000     │
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

### 4. Dispute Filing Modal (with Centralization Disclosure)
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
│  ℹ️ RESOLUTION PROCESS              │
│  ⚠️ For MVP, disputes are reviewed  │
│  MANUALLY by the Valyra team within │
│  96 hours. This is centralized.     │
│  Future: DAO-based arbitration.    │
│                                     │
│  [Cancel]        [Submit Dispute]   │
└─────────────────────────────────────┘
```

### 5. Seller Credential Upload (with Encryption Method)
```
┌─────────────────────────────────────┐
│  📦 Upload Credentials         ✕    │
├─────────────────────────────────────┤
│                                     │
│  Buyer is waiting for handover.     │
│  ─────────────────────────────────  │
│  🔐 Encryption Method:              │
│  ┌─────────────────────────────┐    │
│  │ ✅ Buyer using: Smart Wallet │    │
│  │ Method: Ephemeral Keypair   │    │
│  │ (Auto-detected - secure)    │    │
│  └─────────────────────────────┘    │
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
│    Build ID verified: abc123def ✓   │
│                                     │
│  ☐ Payment Processor *              │
│    [Transfer Stripe Account]        │
│                                     │
│  ☐ Email Access (Optional)          │
│    [Add Details...]                 │
│                                     │
│  ─────────────────────────────────  │
│  🔒 Encrypted with buyer's key      │
│  Only buyer can decrypt             │
│                                     │
│  [Cancel]     [Upload & Notify ✓]   │
└─────────────────────────────────────┘
```

### 6. IP Assignment Signing Screen (NEW)
```
┌─────────────────────────────────────┐
│  📜 Sign IP Assignment         ✕    │
├─────────────────────────────────────┤
│                                     │
│  Before listing, you must transfer  │
│  all Intellectual Property rights.  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ IP ASSIGNMENT AGREEMENT     │    │
│  │ ─────────────────────────── │    │
│  │ I, the Seller, hereby       │    │
│  │ irrevocably transfer all    │    │
│  │ intellectual property rights│    │
│  │ including but not limited   │    │
│  │ to: source code, designs,   │    │
│  │ trademarks, and customer    │    │
│  │ data to the Buyer upon      │    │
│  │ completion of this          │    │
│  │ transaction.                │    │
│  │                             │    │
│  │ I represent that I am the   │    │
│  │ sole owner of all assets... │    │
│  │         [Read Full →]       │    │
│  └─────────────────────────────┘    │
│                                     │
│  ⚠️ This is NOT legal advice.       │
│  Consult a lawyer for complex      │
│  transactions.                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Hash: 0x7a3f...8b2c         │    │
│  │ (Stored on-chain)           │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Cancel]  [✍️ Sign with Wallet]    │
└─────────────────────────────────────┘
```

### 7. Build ID Verification Screen (NEW)
```
┌─────────────────────────────────────┐
│  🔍 Code Verification          ✕    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │        VERIFY YOUR CODE     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Step 1: Add meta tag to your site  │
│  ┌─────────────────────────────┐    │
│  │ <meta name="valyra-build-id"│    │
│  │       content="abc123def"/> │    │
│  │                [Copy 📋]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Step 2: Link your GitHub repo      │
│  Repo: [owner/repo-name_______]     │
│                                     │
│  Step 3: We'll cross-check          │
│  ┌─────────────────────────────┐    │
│  │ Live site → meta tag        │    │
│  │      ↓                      │    │
│  │ GitHub → latest commit hash │    │
│  │      ↓                      │    │
│  │ Match? → ✅ Code Verified    │    │
│  └─────────────────────────────┘    │
│                                     │
│  Benefits:                          │
│  • Level up to "Enhanced" verify   │
│  • Higher buyer trust              │
│  • Better listing visibility       │
│                                     │
│  [Skip for Now]  [Verify Code →]    │
└─────────────────────────────────────┘
```

### 8. Token-Gated Chat Access (NEW)
```
┌─────────────────────────────────────┐
│  💬 AI Agent Chat              ✕    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔒 Detailed Analysis Locked │    │
│  └─────────────────────────────┘    │
│                                     │
│  To ask detailed questions about    │
│  this business, you need:          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Minimum balance: $10 USD    │    │
│  │ Your balance:    $5.50 USD  │    │
│  │ Status: ❌ Insufficient     │    │
│  └─────────────────────────────┘    │
│                                     │
│  WHY?                               │
│  This prevents spam and ensures    │
│  only serious buyers access our    │
│  AI analysis resources.            │
│                                     │
│  Still available (free):           │
│  ✅ View listing details           │
│  ✅ See AI valuation summary       │
│  ✅ Make an offer                  │
│                                     │
│  [Get More IDRX]  [Make Offer →]    │
└─────────────────────────────────────┘
```

### 9. Payment Method Selection (NEW)
```
┌─────────────────────────────────────┐
│  💳 Select Payment Method      ✕    │
├─────────────────────────────────────┤
│                                     │
│  Amount: Rp 45.000.000              │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ○ Pay with IDRX             │    │
│  │   Balance: 50,000,000 IDRX  │    │
│  │   ✅ Sufficient             │    │
│  │                             │    │
│  │ ○ Pay with USDC (Auto-swap) │    │
│  │   Balance: $3,500 USDC      │    │
│  │   Rate: 1 USDC ≈ 15,700 IDRX│    │
│  │   Est: ~2,866 USDC          │    │
│  │   Slippage: 0.5%            │    │
│  └─────────────────────────────┘    │
│                                     │
│  Fee Breakdown:                     │
│  ┌─────────────────────────────┐    │
│  │ Seller receives: 43,875,000 │    │
│  │ Platform fee:     1,125,000 │    │
│  │ Gas (est):            50 IDR│    │
│  │ ─────────────────────────── │    │
│  │ Total:           45,000,050 │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Cancel]        [Confirm Payment]  │
└─────────────────────────────────────┘
```

### 10. Encryption Fallback Notification (NEW)
```
┌─────────────────────────────────────┐
│  🔐 Secure Credential Setup    ✕    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  ⚠️ Smart Wallet Detected    │    │
│  └─────────────────────────────┘    │
│                                     │
│  Your wallet doesn't support        │
│  standard encryption. We'll use    │
│  a secure fallback method.         │
│                                     │
│  HOW IT WORKS:                      │
│  1. Sign a message to create a     │
│     one-time encryption key        │
│  2. Key is stored encrypted on     │
│     our server (only YOU can       │
│     decrypt it with your wallet)   │
│  3. Access from ANY device by      │
│     signing the same message       │
│                                     │
│  ✅ Cross-device recovery enabled  │
│  ✅ Arbitrator backup for disputes │
│                                     │
│  ⚠️ Don't share this signature!    │
│                                     │
│  [Cancel]     [Sign & Continue]     │
└─────────────────────────────────────┘
```

### 11. Earnest Money Offer (NEW)
```
┌─────────────────────────────────────┐
│  💰 Make an Offer              ✕    │
├─────────────────────────────────────┤
│                                     │
│  Listing: ChatBot Pro               │
│  Asking Price: Rp 45.000.000        │
│                                     │
│  Your Offer:                        │
│  [Rp 40.000.000__________________]  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 💸 EARNEST MONEY REQUIRED   │    │
│  │                             │    │
│  │ 5% of offer: Rp 2.000.000   │    │
│  │                             │    │
│  │ This proves you're serious. │    │
│  │ Refunded if seller rejects. │    │
│  │ Applied to total if accepted│    │
│  └─────────────────────────────┘    │
│                                     │
│  Seller has 24h to respond.        │
│  Auto-refund if no response.       │
│                                     │
│  [Cancel]        [Submit Offer →]   │
└─────────────────────────────────────┘
```

### 12. Seller Heartbeat Alert (NEW)
```
┌─────────────────────────────────────┐
│  ⚠️ Seller Activity Alert           │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔴 Seller Unresponsive      │    │
│  │                             │    │
│  │ Last active: 35 days ago    │    │
│  │ Ignored offers: 2           │    │
│  └─────────────────────────────┘    │
│                                     │
│  What this means:                   │
│  • Seller may not respond quickly  │
│  • If they don't accept in 24h,    │
│    your earnest is auto-refunded  │
│  • Listing may be paused soon      │
│                                     │
│  Still want to make an offer?       │
│                                     │
│  [Browse Others]  [Proceed Anyway]  │
└─────────────────────────────────────┘
```

### 13. Transaction Limit Warning (AML) (NEW)
```
┌─────────────────────────────────────┐
│  ⚠️ Transaction Limit              ✕ │
├─────────────────────────────────────┤
│                                     │
│  Your verification level limits    │
│  this transaction.                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Your Level: BASIC           │    │
│  │ Max Single TX: Rp 15.000.000│    │
│  │ Monthly Limit: Rp 30.000.000│    │
│  │ Used this month: Rp 8M      │    │
│  │                             │    │
│  │ This sale: Rp 45.000.000    │    │
│  │ Status: ❌ EXCEEDS LIMIT    │    │
│  └─────────────────────────────┘    │
│                                     │
│  Upgrade to ENHANCED:               │
│  • Unlimited transactions          │
│  • Connect Stripe/GA for OAuth     │
│  • Verify Build ID                 │
│                                     │
│  [Upgrade Now →]   [Adjust Price]   │
└─────────────────────────────────────┘
```

### 14. Verification Extension Request (NEW)
```
┌─────────────────────────────────────┐
│  ⏰ Request Time Extension     ✕    │
├─────────────────────────────────────┤
│                                     │
│  Verification Deadline:             │
│  ⏱️ 4 hours remaining               │
│                                     │
│  Still verifying DNS propagation?   │
│  You can request a ONE-TIME 24h    │
│  extension.                        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Agent detected:             │    │
│  │ DNS propagation: 78%        │    │
│  │ Status: Still propagating   │    │
│  │                             │    │
│  │ Recommendation: Extend      │    │
│  └─────────────────────────────┘    │
│                                     │
│  After extension:                   │
│  New deadline: Dec 18, 2025 10:00   │
│                                     │
│  [Complete Now]  [Request Extension]│
└─────────────────────────────────────┘
```

### 15. Gasless Listing Prompt (NEW)
```
┌─────────────────────────────────────┐
│  ⛽ Gas Fee Sponsored          ✕    │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🎉 ZERO GAS FEE!           │    │
│  └─────────────────────────────┘    │
│                                     │
│  We detected you have low ETH      │
│  balance. No problem!              │
│                                     │
│  Valyra will sponsor your gas fee  │
│  for creating this listing.        │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Normal gas cost: ~$0.08     │    │
│  │ Your cost: $0.00 ✅         │    │
│  │ Sponsored by: Valyra        │    │
│  └─────────────────────────────┘    │
│                                     │
│  Note: Gas is recouped from the    │
│  2.5% platform fee when you sell.  │
│                                     │
│  Free listings remaining: 2/3      │
│                                     │
│  [Create Listing →]                 │
└─────────────────────────────────────┘
```

### 16. Credential Key Recovery (Cross-Device) (NEW)
```
┌─────────────────────────────────────┐
│  🔑 Recover Encryption Key     ✕    │
├─────────────────────────────────────┤
│                                     │
│  We detected you have pending      │
│  credentials to decrypt.           │
│                                     │
│  Escrow #123: ChatBot Pro          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Encryption key not found    │    │
│  │ locally. Recovering from    │    │
│  │ server backup...            │    │
│  └─────────────────────────────┘    │
│                                     │
│  Sign the same message you used    │
│  when you made the deposit to      │
│  recover your encryption key.      │
│                                     │
│  ✅ Key found on server            │
│  ✅ Decryptable with your wallet   │
│                                     │
│  [Sign to Recover Key]              │
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
| Swap Processing | "Swapping USDC → IDRX..." with progress |
| Key Generation | "Generating secure encryption key..." |

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
| Swap Failed | "Swap gagal. Coba lagi atau gunakan IDRX." | [Try Again] / [Use IDRX] |
| Encryption Failed | "Enkripsi gagal. Pastikan wallet connected." | [Reconnect Wallet] |
| Token Gated | "Saldo tidak mencukupi untuk fitur ini." | [Get More IDRX] |

### Success States
| Action | Confirmation |
|--------|--------------|
| Listing Created | "🎉 Bisnis Anda sudah live! IP signed ✓" + Share button |
| IP Signed | "📜 IP Assignment berhasil ditandatangani." |
| Deposit Made | "✅ Dana terkunci. Fee: Rp X (2.5%)." |
| USDC Swapped | "✅ Swap berhasil! USDC → IDRX." |
| Credentials Uploaded | "📦 Kredensial terkirim (encrypted)." |
| Transaction Complete | "🎊 Selesai! Seller menerima Rp X." |
| Build ID Verified | "✅ Kode terverifikasi! Level: Enhanced." |

### Warning States (NEW)
| Trigger | Warning Message |
|---------|-----------------|
| Site Unreachable (Health Check) | "⚠️ Website tidak dapat diakses. Cek server Anda." |
| Build ID Mismatch | "⚠️ Kode tidak cocok dengan live site." |
| No Build ID | "ℹ️ Kode belum diverifikasi. Upgrade label Anda." |
| Smart Wallet Detected | "ℹ️ Menggunakan metode enkripsi alternatif." |
| Seller Unresponsive | "⚠️ Seller tidak aktif 30+ hari." |
| Transaction Limit | "⚠️ Transaksi melebihi limit verifikasi Anda." |
| JIT Verification Failed | "❌ Kode berubah sejak listing dibuat!" |
| Earnest Not Refunded | "⏳ Earnest akan dikembalikan dalam 1 jam." |
| Holding Period Active | "⏳ Dana tersedia dalam 24 jam." |

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
│  [💎 Smart Wallet]                  │
│                                     │
│  Have a Basename?                   │
│  [Connect with Basename →]          │
│                                     │
│  No crypto wallet?                  │
│  [Get Coinbase Wallet →]            │
└─────────────────────────────────────┘

Step 2: Profile Setup (with Basename)
┌─────────────────────────────────────┐
│  Your Seller Profile               │
│                                     │
│  Display Name:                      │
│  [________________]                 │
│                                     │
│  Or use your Basename:              │
│  🏷️ rian.base.eth ✓               │
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

Step 4: AI Valuation (with Guardrails)
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
│  (Range: 2.3x - 2.7x ARR)          │
│  ✅ Within guardrails (max 10x ARR) │
│                                     │
│  ⚠️ This is an estimate only.      │
│                                     │
│  [Adjust Price] [✓ Accept & List]   │
└─────────────────────────────────────┘

Step 5: IP Assignment Signing (NEW)
┌─────────────────────────────────────┐
│  📜 One More Step: Sign IP         │
│                                     │
│  To protect the buyer, please sign │
│  the IP Assignment Agreement.       │
│                                     │
│  [View Agreement] [✍️ Sign Now]     │
└─────────────────────────────────────┘

Step 6: Build ID Verification (Optional)
┌─────────────────────────────────────┐
│  🔍 Upgrade Your Listing (Optional)│
│                                     │
│  Verify your code matches the      │
│  live site for "Enhanced" badge.   │
│                                     │
│  [Skip]          [Verify Code →]    │
└─────────────────────────────────────┘

Step 7: Listing Live!
┌─────────────────────────────────────┐
│  🎉 Your listing is live!          │
│                                     │
│  ✅ IP Assignment signed            │
│  ✅ AI Valuation complete           │
│  ⬜ Code verification (optional)    │
│                                     │
│  Platform fee: 2.5% on sale        │
│                                     │
│  [View Listing] [Share →]           │
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
│  [💎 Smart Wallet]                  │
└─────────────────────────────────────┘

Step 2: First Purchase Education
┌─────────────────────────────────────┐
│  How buying works 📚               │
│                                     │
│  1. 💰 You deposit IDRX (or USDC)  │
│     Funds are locked safely.        │
│     Platform fee: 2.5%             │
│                                     │
│  2. 📦 Seller uploads credentials   │
│     Encrypted just for you.         │
│     (Smart Wallets supported!)     │
│                                     │
│  3. ✅ You verify access            │
│     72 hours to confirm.            │
│                                     │
│  4. 🎉 Release payment              │
│     Seller gets paid.               │
│     You get IP ownership.          │
│                                     │
│  ⚠️ Problem? Raise a dispute.       │
│  (Reviewed manually by our team)   │
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
| Deposit Made | 🔒 | Escrow funded | "Buyer deposited Rp 45.000.000 - Upload credentials now" |
| Credentials Ready | 📦 | Seller uploads | "Credentials are ready! Verify within 72h" |
| Verification Reminder | ⏰ | 24h before deadline | "24 hours left to verify credentials" |
| Dispute Filed | ⚠️ | Dispute raised | "Dispute raised on Transaction #123" |
| Transaction Complete | 🎉 | Funds released | "Rp 43.875.000 received! (after 2.5% fee)" |
| Price Alert | 📈 | Similar listing sold | "Similar business sold for Rp 50.000.000" |
| Site Unreachable | ⚠️ | Health check failed | "Your listing 'Project X' website is down" |
| Build ID Verified | ✅ | Verification complete | "Code verified! Your listing is now 'Enhanced'" |

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
│  ┌─────────────────────────────┐    │
│  │ ⚠️ Site health warning      │    │
│  │ "Project X" returned 503    │    │
│  │ 4 hours ago        [Check]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  YESTERDAY                          │
│  ┌─────────────────────────────┐    │
│  │ ✅ Verification complete    │    │
│  │ Funds released: Rp 43.875m  │    │
│  │ (Fee: Rp 1.125m)    [View]  │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Mark All as Read]                 │
└─────────────────────────────────────┘
```

---

## Functional Requirements

### 1. User Authentication & Profile
* **Wallet Connect:** Support for Coinbase Wallet, MetaMask, and Smart Wallets (ERC-4337) via OnchainKit.
* **Identity:** Profile linked to **Basenames** for native Base ecosystem identity.
* **Onboarding:** Progressive profile completion with first-time user guidance.

### 2. Seller Workflow (The Agent Interview)
* **Input Parsing:** The AI must accept raw text descriptions or URLs and extract structured data (MRR, Traffic, Tech Stack).
* **Valuation Engine:** The system must output a specific price range in IDRX based on the input data using a Comparative Market Analysis logic with **guardrails** (max 10x ARR).
* **Ownership Verification:** DNS TXT verification, OAuth connection for revenue platforms (zero-storage policy), **Build ID verification**.
* **IP Assignment:** Wallet-signed IP transfer agreement (hash stored on-chain).
* **Listing Creation:** A button to sign a transaction that posts the listing to the smart contract.
* **Credential Handover:** Encrypted upload with **Smart Wallet fallback support**.

### 3. Buyer Workflow (Purchase & Escrow)
* **Proof of Funds:** Verify wallet balance before allowing offers ($10 minimum for AI chat).
* **Deposit:** A function to approve and transfer IDRX to the Smart Contract, or **swap from USDC**.
* **Dashboard:** A view showing "My Acquisitions" with status indicators (Pending Handover, Completed).
* **Verification Period:** 72-hour window to verify received credentials.
* **Dispute:** A mechanism to flag a transaction with clear disclosure that resolution is **manual for MVP**.

### 4. Back-End Processes
* **Event Listening:** Simple RPC event polling (no full subgraph for MVP).
* **Sanitization:** AI must filter out malicious links or PII from public listings.
* **Timeouts:** Automatic escrow actions based on time-locked deadlines.
* **Health Checks:** CRON job to monitor listing site uptime (24h intervals).

---

## Non-Functional Requirements

### 1. Performance
* **Response Time:** AI Valuation should return results in under 5 seconds.
* **Blockchain Finality:** UI must update transaction status within 2 seconds of block confirmation (Base L2 speed).
* **Page Load:** First Contentful Paint < 1.5 seconds.
* **Swap Speed:** USDC→IDRX swap should complete in <10 seconds.

### 2. Security
* **Smart Contract Auditing:** Use standard OpenZeppelin ReentrancyGuards for all financial functions.
* **Wallet Segregation:** The AI Agent's wallet used for signing attestations must be separate from the Escrow contract holding user funds.
* **Credential Encryption:** ECIES with buyer's wallet key + **ephemeral keypair fallback** for Smart Wallets.
* **OAuth Security:** Zero-storage policy - tokens discarded after attestation snapshot.

### 3. Usability
* **Language:** The interface should support Bahasa Indonesia (optional for MVP, but design must allow for i18n).
* **Error Handling:** Crypto errors (e.g., "User rejected request") must be translated into human-friendly messages.
* **Accessibility:** WCAG 2.1 AA compliance target (color contrast, keyboard navigation).
* **Honest UX:** Clear disclosure of centralized processes (dispute resolution).

### 4. Reliability
* **Uptime:** 99.5% availability target.
* **Fallback:** Graceful degradation if AI backend is unavailable.
* **Encryption Fallback:** Smart Wallet users automatically use ephemeral keypair method.

---

## Milestones and Timeline
**Project Duration:** Dec 10, 2025 – Jan 31, 2026 (7 Weeks)

### Development Milestones

1. **Phase 1: Foundation (Weeks 1-2)**
   * *Goal:* Smart Contracts deployed on Base Sepolia with fees.
   * *Output:* `Escrow.sol` (with 2.5% fee), `Marketplace.sol` (with IP hash) verified on Basescan.
   * *Target:* Dec 24, 2025.

2. **Phase 2: Intelligence (Weeks 3-4)**
   * *Goal:* Coinbase AgentKit Integration with guardrails.
   * *Output:* Python backend live with valuation guardrails, Build ID verification, and zero-storage OAuth.
   * *Target:* Jan 7, 2026.

3. **Phase 3: Integration (Weeks 5-6)**
   * *Goal:* Frontend meets Backend with Smart Wallet support.
   * *Output:* Next.js UI with Basenames, ephemeral keypair fallback, IP signing, and USDC swap UI.
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
* **Mitigation:** Implement **guardrails** (max 10x ARR, min 1x ARR), add UI disclaimer, require AI to cite comparable sales.

### Risk 3: User Trust (Scams)
* **Risk:** A seller takes the money but provides a fake password.
* **Mitigation:** Multi-layer protection:
  * **Build ID verification** linking code to live site
  * 72-hour verification window
  * Dispute resolution (manual for MVP - **honestly disclosed**)
  * On-chain reputation (future)

### Risk 4: Credential Security Breach
* **Risk:** Credentials exposed during handover.
* **Mitigation:** 
  * ECIES encryption with wallet key
  * **Ephemeral keypair fallback** for Smart Wallets
  * Credentials never stored in plaintext
  * Auto-purge after 30 days

### Risk 5: Smart Wallet Incompatibility (NEW)
* **Risk:** Smart Wallets can't use `eth_getEncryptionPublicKey`.
* **Mitigation:** Auto-detect wallet type and use **ephemeral keypair fallback** with signature-derived keys.

### Risk 6: Tire-Kicker API Abuse (NEW)
* **Risk:** Users spam AI chat without intent to buy.
* **Mitigation:** **Token-gated chat** requiring $10 minimum balance for detailed inquiries.

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
| Token-Gated | Locked features | Gray with lock icon |
| Gasless | Gas-sponsored actions | Primary with sparkle icon |

### Cards
| Variant | Usage |
|---------|-------|
| Listing Card | Marketplace items (with Build ID + Heartbeat badges) |
| Stat Card | Dashboard metrics |
| Status Card | Transaction progress (with fee breakdown) |
| Empty Card | Empty states |
| Warning Card | Health check alerts |
| Offer Card | Pending offers with earnest info |
| Heartbeat Card | Seller activity status |
| Limit Card | AML transaction limits |

### Badges
| Variant | Usage |
|---------|-------|
| Trust Score | AI-generated trust level |
| Verified | Email/Revenue/Build ID verified |
| Fair Value | AI valuation aligned |
| Active Seller | Recent heartbeat |
| Earnest Deposit | 5% deposited |
| Genesis Seller | First 50 verified sellers 🌟 |
| XMTP Enabled | Web3 messaging active 🔐 |
| Seller Unresponsive | 🔴 Unresponsive |
| Status | Transaction states |
| AI Confidence | Valuation reliability |
| Fee Display | 2.5% platform fee |
| Earnest | 💸 5% earnest required |
| Gasless | ⛽ Gas sponsored |

### Input Fields
| Variant | Usage |
|---------|-------|
| Text Input | General text entry |
| Number Input | IDRX amounts with formatting |
| Textarea | Long descriptions |
| Select | Dropdown choices |
| File Upload | Evidence/screenshots |
| Wallet Selector | EOA vs Smart Wallet |
| Currency Selector | IDRX vs USDC |
| Offer Input | Amount with earnest calculation |

### Modals
| Variant | Usage |
|---------|-------|
| Confirmation | Transaction confirmations |
| IP Assignment | Legal signing |
| Encryption Setup | Smart Wallet fallback with server backup info |
| Key Recovery | Cross-device key recovery |
| Token Gate | Access locked features |
| Fee Breakdown | Show fee split |
| Earnest Money | 5% deposit for offers |
| Extension Request | One-time 24h verification extension |
| Limit Warning | AML transaction limits |
| Gasless Prompt | Paymaster sponsorship |
| Heartbeat Alert | Seller activity warning |
| Transition Hold | 10% retainer explanation |
| Seller Stake | ~$50 stake deposit/withdrawal |
| Transition Issue | Report 2FA/migration problem |
| Emergency Mode | System recovery notification |
| Genesis Qualification | Free listing eligibility check |
| XMTP Chat Toggle | Switch messaging mode |
| e-Meterai PDF | Transaction agreement download |

---

## New Wireframes (v2.3)

### 17. Transition Hold Status
```
┌─────────────────────────────────────────┐
│  ⏳ Transition Assistance Period        │
├─────────────────────────────────────────┤
│                                         │
│  Transaction: ChatBot Pro               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💰 PAYMENT SPLIT                │    │
│  │                                 │    │
│  │ Released to seller: 90%        │    │
│  │ Rp 40,500,000 ✅                │    │
│  │                                 │    │
│  │ Transition retainer: 10%       │    │
│  │ Rp 4,500,000 ⏳                 │    │
│  │                                 │    │
│  │ Retainer releases in: 5d 12h   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Need help with migration?              │
│  Seller should assist with:             │
│  • 2FA/OTP transfers                    │
│  • DNS verification                     │
│  • Third-party account de-auth          │
│                                         │
│  [Report Transition Issue]              │
└─────────────────────────────────────────┘
```

### 18. Seller Stake Deposit
```
┌─────────────────────────────────────────┐
│  🔒 Stake to List                   ✕   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💎 SELLER STAKE REQUIRED        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  To list your business, deposit a       │
│  refundable stake:                      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Stake amount: Rp 750,000        │    │
│  │ (~$50 USD)                      │    │
│  │                                 │    │
│  │ Your balance: Rp 2,500,000 ✅   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  WHY?                                   │
│  • Prevents scammers from listing      │
│  • Returned on successful sale         │
│  • Slashed if you lose a dispute       │
│                                         │
│  ⚠️ Stake locked until listing ends    │
│                                         │
│  [Cancel]         [Deposit Stake →]     │
└─────────────────────────────────────────┘
```

### 19. Emergency Mode Banner
```
┌─────────────────────────────────────────┐
│  🚨 EMERGENCY MODE ACTIVE               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚠️ SYSTEM RECOVERY IN PROGRESS  │    │
│  │                                 │    │
│  │ Activated: Dec 11, 2025 10:00   │    │
│  │ Cooldown ends: Dec 14, 10:00    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  What's happening:                      │
│  The platform has activated emergency   │
│  mode. After 72h cooldown, you can     │
│  withdraw your funds directly.          │
│                                         │
│  Your funds:                            │
│  • Escrow #123: Rp 45,000,000          │
│  • Status: 🔒 Awaiting cooldown        │
│                                         │
│  [Learn More]  [Withdraw After Cooldown]│
└─────────────────────────────────────────┘
```

---

## New Wireframes (v2.4)

### 20. Genesis Seller Badge & Staking Flow (NEW)

#### Genesis Badge (Marketplace Listing Card)
```
┌─────────────────────────────────────────┐
│  📦 SaaS Email Tool                     │
│  ┌─────────────────────────────────┐    │
│  │ 🌟 GENESIS SELLER #23           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  MRR: Rp 15,000,000/month               │
│  Price: Rp 180,000,000                  │
│                                         │
│  Early adopter • Verified Level 2       │
│  Listed: 2 days ago                     │
│                                         │
│  [View Details]                         │
└─────────────────────────────────────────┘
```

#### Genesis Staking Flow (Seller Onboarding)
```
┌─────────────────────────────────────────┐
│  🎉 Genesis Seller Program          ✕   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🌟 YOU QUALIFY FOR FREE LISTING │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Congratulations! As a verified early   │
│  adopter, you can list for FREE.        │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Program Status:                 │    │
│  │ Genesis Spots: 23/50 claimed    │    │
│  │ Your Stake: Rp 0 (WAIVED) 🎁    │    │
│  │                                 │    │
│  │ ████████░░░░░░░░ 46% remaining  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Requirements:                          │
│  ✅ Level 2 Verification               │
│  ✅ Basename or Profile                │
│                                         │
│  After 50 sellers:                      │
│  Standard Rp 750,000 stake applies      │
│                                         │
│  [Claim Genesis Spot →]                 │
└─────────────────────────────────────────┘
```

### 21. XMTP Wallet Messaging (NEW)

#### Message Mode Toggle
```
┌─────────────────────────────────────────┐
│  💬 Direct Chat with Seller             │
├─────────────────────────────────────────┤
│                                         │
│  Messaging Mode:                        │
│  ○ Platform Chat (Stored 90 days)      │
│  ● XMTP (Wallet-to-Wallet) 🔐          │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ℹ️ XMTP Benefits:               │    │
│  │ • Messages stored in your wallet│    │
│  │ • No server dependency          │    │
│  │ • True Web3 privacy             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [seller.base.eth]                      │
│  Last online: 2 hours ago               │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Seller: Hi! Happy to answer...  │    │
│  │ 10:30 AM                        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Type your message...            │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                            [Send 📤]    │
└─────────────────────────────────────────┘
```

### 22. e-Meterai PDF Preview (NEW)

```
┌─────────────────────────────────────────┐
│  📄 Transaction Agreement           ✕   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ VALYRA BUSINESS TRANSFER        │    │
│  │ AGREEMENT                        │    │
│  │                                 │    │
│  │ Transaction: 0x7a3b...f12c      │    │
│  │ Date: 2025-12-11 14:30 WIB       │    │
│  │                                 │    │
│  │ Seller: seller.base.eth         │    │
│  │ Buyer: buyer.base.eth           │    │
│  │ Amount: Rp 45,000,000           │    │
│  │                                 │    │
│  │ [RESERVED FOR e-METERAI]        │    │
│  │ ┌─────────────────────────┐     │    │
│  │ │                         │     │    │
│  │ │  Please affix           │     │    │
│  │ │  Rp 10,000 e-Meterai    │     │    │
│  │ │  for legal validity     │     │    │
│  │ │  (if transaction >      │     │    │
│  │ │  Rp 5,000,000)          │     │    │
│  │ │                         │     │    │
│  │ └─────────────────────────┘     │    │
│  │                                 │    │
│  │ Blockchain Proof: [QR]          │    │
│  └─────────────────────────────┘    │
│                                         │
│  [Download PDF] [Affix e-Meterai →]    │
└─────────────────────────────────────────┘
```

---

**Changelog:**
* **v2.4 (Dec 11, 2025):** Final refinements: Genesis Seller Program UI (badge, free listing flow with 23/50 counter), XMTP wallet-to-wallet messaging toggle, e-Meterai PDF preview with placeholder template, victim compensation display. Updated component library with Genesis and XMTP badges.
* **v2.3 (Dec 11, 2025):** Production readiness: Mobile deep linking, Transition Hold UI (10% retainer), Seller Stake deposit/withdrawal, Emergency Mode banner, Transition Issue reporting.
* **v2.2 (Dec 11, 2025):** Earnest Money UI, Seller Heartbeat alerts, AML limits, credential key recovery, verification extension, gasless listing, JIT verification.
* **v2.1 (Dec 11, 2025):** Platform fee displays, Smart Wallet fallback UI, Build ID verification, token-gated chat, USDC swap, IP signing, health checks, Basenames.
* **v2.0 (Dec 10, 2025):** Wireframes, UI states, onboarding flow, notification system, responsive breakpoints, component library.
* **v1.0 (Dec 10, 2025):** Initial Design Spec draft.