# Role 2: Frontend Engineer (UI/UX Lead)

**Focus:** Next.js Development, OnchainKit Integration, Responsive UI  
**Timeline:** 5 Weeks  
**Key Deliverable:** Mobile-first dApp with Lighthouse score >90

---

## Primary Responsibilities

- Next.js 14 application development (App Router)
- OnchainKit wallet integration (Smart Wallet support)
- Responsive, mobile-first UI implementation
- Web3 transaction flows
- Performance optimization

---

## 📚 Learning Resources & "How-To"

### 1. Essential Tutorials
*   **[Next.js Learn](https://nextjs.org/learn):** Official interactive course. Focus on "App Router" chapters.
*   **[OnchainKit Docs](https://onchainkit.xyz/):** Copy-paste components for wallet connection and identity.
*   **[Wagmi Docs](https://wagmi.sh/react/getting-started):** The "hooks" we use to talk to contracts (e.g., `useReadContract`).
*   **[Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet):** Search for CSS classes instantly.

### 2. Concept Explainers (EL15)

#### Smart Wallet vs. EOA (MetaMask)
> *   **EOA (MetaMask):** Like a physical key. If you lose the seed phrase, money is gone. User MUST pay gas (ETH) for every action.
> *   **Smart Wallet (Coinbase):** Like a bank vault with biometric access (FaceID).
>   *   **Passkeys:** User signs with FaceID, not a password.
>   *   **Sponsored Gas:** We (Valyra) can pay the gas fees for them (Paymaster).
>   *   **Why we care:** It makes onboarding "normies" 10x easier.

#### What is `useWriteContract`?
> It's a React Hook that sends a transaction to the blockchain.
> *   **Read:** Free, instant. `useReadContract` returns data.
> *   **Write:** Costs gas, takes time. `useWriteContract` prompts the wallet to sign.
> *   **Wait:** After writing, you must `useWaitForTransactionReceipt` to know when it's confirmed.

### 3. Issue Template
When creating GitHub issues, use:
```markdown
## Page: /listing/[id]
**Component:** `BuyButton`
**Problem:** Text color is invisible in dark mode.
**Proposed Fix:** Add `dark:text-white` class.
```

---

## Week 1: Design System & Wireframes

### Design System Setup (Figma)
- [ ] Create Figma project: "Valyra Design System"
- [ ] Set up design tokens
  - Colors: Base Blue (#0052FF), Money Green (#10B981), Alert Red (#EF4444)
  - Typography: Inter (primary)
  - Spacing: 4px grid
- [ ] Create core components (Buttons, Inputs, Cards, Badges)

### Mobile-First Wireframes
- [ ] Homepage (marketplace feed)
- [ ] Listing detail page
- [ ] Transaction flows (Create Listing, Make Offer)
- [ ] Wallet connection UI

---

## Week 2: Setup & Core UI

### Project Initialization
- [ ] Initialize Next.js 14 project (App Router) inside `apps/web`
- [ ] **Important:** Run `npm install` from root to link dependencies
- [ ] Install dependencies (OnchainKit, Wagmi, Tailwind)
- [ ] Configure Tailwind with Token variables from Week 1

### Core Pages
- [ ] **Home:** Marketplace listing grid (responsive)
- [ ] **Listing Detail:** Business overview, metrics charts
- [ ] **Wallet Connection:** Implement OnchainKit provider & button

---

## Week 3: Business Logic Integration

### Seller Flows
- [ ] Create Listing Wizard (STEPS: Info, Metrics, Verify, Price)
- [ ] Stake Deposit transaction integration
- [ ] Genesis Program check logic

### Buyer Flows
- [ ] "Make Offer" modal & transaction
- [ ] Earnest Money calculation logic
- [ ] Offer status dashboard

---

## Week 4: Advanced Interaction

### Transaction Dashboard
- [ ] Escrow Status Timeline (Funded -> Delivered -> Transition)
- [ ] USDC Auto-Swap UI for deposits

### Credential Vault
- [ ] Secure file upload (Client-side encryption)
- [ ] Secure file download (Decryption with wallet signature)

### Dispute UI
- [ ] Dispute form with evidence upload
- [ ] Resolution status tracker

---

## Week 5: Visual Polish & Launch

### Micro-Interactions & Animation
- [ ] Loading skeletons for all data fetches
- [ ] Success confetti animations
- [ ] Smooth transitions between wizard steps

### Marketing Assets
- [ ] Create "Hero" images for homepage
- [ ] Record demo video (Seller & Buyer flows)

### Deployment & Optimization
- [ ] Run Lighthouse audit (>90 score)
- [ ] Optimize images and bundle size
- [ ] Deploy to Vercel (Production)

---

## Dependencies on Other Roles

### Week 1
- **Smart Contract:** Need ABIs and testnet addresses by Friday
- **Designer:** Need component designs (buttons, cards, modals)

### Week 2
- **Backend:** API endpoints for AI valuation, Build ID verification
- **Smart Contract:** Event logs for transaction status

### Week 3
- **DevOps:** Staging environment for testing
- **Designer:** Final UI polish support

---

## Success Criteria

✅ Responsive on mobile, tablet, desktop  
✅ Wallet connection works (Smart Wallet + MetaMask)  
✅ All core flows functional (list, offer, escrow, release)  
✅ Lighthouse score >90  
✅ Load time <2 seconds  
✅ Zero console errors in production  
✅ Genesis Program UI implemented

---

**Last Updated:** December 11, 2025
