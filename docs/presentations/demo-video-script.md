# Valyra Demo Video Script (Detailed Walkthrough)
**Target Duration:** ~3 Minutes
**Goal:** Showcase the full depth of the Valyra platform, highlighting technical innovations (AI Agents, Smart Escrow, Build Verification) and user-centric design (Basenames, Local Currency).

---

### Scene 1: Introduction & The Problem (0:00 - 0:30)
**Visual:**
*   **Split Screen:** Left side shows a chaotic Discord chat with "scam?" messages. Right side shows a sleek Valyra Landing Page.
*   **Overlay Text:** "The Liquidity Trap".
*   **Action:** Cursor moves to "Connect Wallet" on Valyra.
*   **Focus Zoom:** The wallet modal pops up showing **Basenames** (`rian.base.eth`) instead of a raw hex address.

**Narration:**
"Buying a digital business today is broken. You're either paying 15% to a broker or gambling in a Discord server.
Enter Valyra: The Autonomous Marketplace for Micro-M&A on Base.
We start with Identity. By leveraging **OnchainKit**, users connect with their Basenames. I'm not just `0x123`; I'm `rian.base.eth`. Trust starts here."

---

### Scene 2: Listing with AI Assistance (0:30 - 1:00)
**Visual:**
*   **User Action:** Click "Sell Asset".
*   **UI:** The "AI Listing Assistant" chat interface appears (not a boring form).
*   **Action:** User types: "I want to sell my SaaS, analytics-dashboard.com".
*   **Animation:** "Thinking..." dots. The AI Agent fills in the fields: "Tech Stack: Next.js", "Detected Traffic: Moderate".
*   **Key Feature:** The **AI Valuation** card appears: "Suggested Price: 45,000,000 IDRX (Based on 30x MRR)".
*   **User Action:** User accepts the price and clicks "Create Listing".
*   **Popup:** Wallet Signature request signing the **IP Assignment Agreement** (hash stored on-chain).

**Narration:**
"Listing is no longer a chore. Our **Coinbase AgentKit** powered AI analyzes the URL instantly.
It detects the tech stack, estimates traffic, and even suggests a fair valuation based on real market data.
Before the listing goes live, the seller signs an on-chain IP Assignment Agreement. Legal protection is baked into the transaction, not an afterthought."

---

### Scene 3: Discovery & Build Verification (1:00 - 1:40)
**Visual:**
*   **Switch to Buyer View:** "Sari" (Buyer Persona).
*   **UI:** Marketplace Grid. One card stands out with a Golden Badge: "Code Verified".
*   **Hover Effect:** "Verified via Build ID: `abc123def` matches GitHub commit."
*   **Action:** Sari clicks the listing.
*   **Detail Page:** Shows the "Trust Score" and "verified revenue" badge.
*   **Action:** Sari clicks "Buy Now".
*   **Modal:** "Deposting IDRX into Smart Escrow". Shows the fee breakdown: "Seller gets 97.5%, Platform fee 2.5%".

**Narration:**
"Sari, our buyer, is looking for a verified asset.
She sees this SaaS with a 'Code Verified' badge. Valyra doesn't just trust the seller; we cryptographically check that the live site's Build ID matches the GitHub repository.
Sari deposits her stablecoins—**IDRX** for local convenience. The funds are now locked in the Smart Contract Vault. Safe."

---

### Scene 4: Secure Handover & Encryption (1:40 - 2:20)
**Visual:**
*   **Switch to Seller View.** Dashboard shows "Escrow Funded".
*   **Action:** Seller clicks "Upload Assets".
*   **UI Warning:** "Smart Wallet Detected - Using Ephemeral Keypair Encryption".
*   **Action:** Seller pastes API keys and uploads a zip file.
*   **Animation:** A "Lock" icon animates, turning the data into scrambled text (ciphertext).
*   **Action:** Transaction confirms: "Assets Committed to Chain".

**Narration:**
"The seller sees the funds are secured and starts the handover.
This is critical: Valyra uses client-side encryption. If the buyer uses a Smart Wallet, we automatically fallback to a secure ephemeral key system.
The credentials are encrypted *before* they leave the browser. Valyra never sees the raw keys. The encrypted payload is hashed and stored on-chain."

---

### Scene 5: Verification & Release (2:20 - 2:50)
**Visual:**
*   **Switch to Buyer View.**
*   **Action:** Buyer clicks "Decrypt & Verify". Keys appear.
*   **Action:** Buyer tests the keys (simulated).
*   **Action:** Buyer clicks "Confirm Receipt".
*   **Animation:** "Money Flow" animation. 2.5% flies to Treasury, 97.5% flies to Seller.
*   **Final State:** "Transaction Complete. Asset Ownership Transferred."

**Narration:**
"Sari decrypts the assets and verifies everything works.
With a final click, the escrow releases.
The seller gets paid instantly. The platform takes its transparent fee.
No middlemen. No weeks of waiting. Just code."

---

### Scene 6: Outro (2:50 - 3:10)
**Visual:**
*   Valyra Logo pulsing with the Base Logo.
*   Text: "The Exit Strategy for Builders."
*   QR Code to the Repo.

**Narration:**
"Valyra is bringing Wall Street M&A infrastructure to Main Street builders.
Autonomous. Secure. Onchain.
Built on Base."
