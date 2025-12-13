# Team Overview - Valyra Hackathon

**Project:** Valyra (Autonomous M&A Agent Marketplace)  
**Team Size:** 5 Members  
**Timeline:** 5-Week Hackathon Sprint  
**Target:** Base Hackathon - Consumer App & Onchain Utility Tracks

---

## Team Structure

| Role | New Title | Key Deliverable |
|------|-----------|-----------------|
| **Role 1** | Smart Contract Engineer | Deployed contracts on Base Mainnet |
| **Role 2** | Frontend & Product Engineer | Design System + Mobile-first dApp |
| **Role 3** | Backend & DevOps Engineer | AI Agent API + Production Infra |

---

## 📂 Repository Structure (Monorepo)
We use a **Single Git Repository** to keep contracts, frontend, and backend in sync. This prevents "Version Mismatch" errors.

```text
valyra-monorepo/
├── apps/
│   ├── web/                # Next.js Frontend
│   └── backend/            # FastAPI Backend
├── packages/
│   └── contracts/          # Hardhat/Foundry Smart Contracts
├── scripts/
│   └── sync-abis.sh        # Script: Copies Contract ABIs -> Web & Backend
└── README.md               # Main Project Doc
```

### ✅ Setup Guide
1.  **Clone:** `git clone https://github.com/your-org/valyra-monorepo.git`
2.  **Contracts:** `cd packages/contracts && npm install`
3.  **Frontend:** `cd apps/web && npm install`
4.  **Backend:** `cd apps/backend && poetry install`

### 🔄 The "Sync Workflow"
When **Role 1** updates a contract:
1.  Role 1 runs: `npm run deploy:testnet` (Generates new ABIs)
2.  Role 1 runs: `./scripts/sync-abis.sh` (Copies ABIs to `web` and `backend`)
3.  Role 1 commits **ALL** changes (Contracts + Updated Frontend ABIs)
4.  **Result:** Frontend never breaks because it always has the matching ABI!

---

## Daily Coordination

### Daily Standups (15 min)
- **Time:** 9:00 AM daily
- **Format:** What I did, What I'm doing, Blockers
- **Tool:** Discord/Slack voice channel

### Weekly Sync (1 hour)
- **Time:** Monday 10:00 AM
- **Agenda:** Sprint planning, dependency review, demo progress
- **Owner:** Smart Contract Engineer (Lead)

### Communication Channels
- **Discord/Slack:** Real-time chat
- **GitHub:** Code review, issue tracking
- **Notion/Linear:** Task management
- **Figma:** Design collaboration

---

## 🤝 Guide to Collaboration (Beginner Friendly)

### Git Workflow & Conventions
We follow a standard "Feature Branch" workflow. Never push directly to `main`!

#### 1. Branch Naming
*   **Features:** `feature/listing-page`, `feature/escrow-contract`
*   **Bug Fixes:** `fix/typo-in-readme`, `fix/gas-limit-error`
*   **Documentation:** `docs/update-role-1`, `docs/api-guide`
*   **Chore:** `chore/dependency-update`

#### 2. Commit Messages
Make them readable! Use the [Conventional Commits](https://www.conventionalcommits.org/) style:
*   `feat: add listing creation form`
*   `fix: resolve reentrancy vulnerability`
*   `docs: update team roles`
*   `style: format code with prettier`

#### 3. Pull Requests (PRs)
*   Draft PRs early if you want feedback.
*   Request review from the relevant team member (see Dependencies).
*   **Rule:** 1 Approval required to merge.

### Issue Tracking
We use GitHub Issues to track work.
*   **Template:**
    ```markdown
    ## Problem
    (Describe what needs to be solved)
    ## Proposed Solution
    (How you plan to fix it)
    ## API Changes
    (If any endpoints change)
    ```

---

## Critical Dependencies

### Week 1-2
- **Frontend** ← **Smart Contracts:** Contract ABIs for Wallet Auth
- **Backend** ← **Smart Contracts:** Testnet deployment for Indexing
- **Frontend** ← **Backend:** API Specifications

### Week 3-4
- **Frontend** ← **Backend:** AI Valuation Endpoint
- **Backend** ← **Smart Contracts:** Event Logs for Notifications
- **Frontend** ← **Smart Contracts:** Dispute Functionality

### Week 5
- **All:** End-to-End Testing (Playwright)
- **Backend:** Production Infrastructure (Mainnet)


---

## Success Metrics (Hackathon Judging)

### Technical Excellence (40%)
- ✅ Smart Contracts: Deployed on Base Mainnet
- ✅ AI Integration: Working AgentKit demo
- ✅ Security: No critical vulnerabilities

### User Experience (30%)
- ✅ Mobile-First: Responsive on all devices
- ✅ Performance: <2s load time
- ✅ Design: Premium, polished UI

### Innovation (20%)
- ✅ Genesis Program: Novel cold-start solution
- ✅ XMTP: Web3-native messaging
- ✅ UUPS Proxy: Production-ready architecture

### Presentation (10%)
- ✅ Demo Video: 3-minute walkthrough
- ✅ Documentation: Clear README
- ✅ Live Demo: Working on Base Mainnet

---

## Emergency Protocols

### If Behind Schedule
1. **Cut Scope:** XMTP messaging → "Future Feature"
2. **Focus MVP:** Listing → Offer → Escrow → Release
3. **Simplify UI:** Remove animations, use default components
4. **Manual Backup:** Replace AI valuation with manual input

### If Blocked by Dependencies
1. **Mock Data:** Frontend uses mock API responses
2. **Testnet First:** Deploy to Sepolia before Mainnet
3. **Skip Features:** Genesis Program → Standard staking only

---

**Last Updated:** December 11, 2025
