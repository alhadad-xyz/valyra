# Role 3: Backend / AI Engineer

**Focus:** FastAPI, Coinbase AgentKit, AI Valuation, API Security  
**Timeline:** 5 Weeks  
**Key Deliverable:** AI agent with 80%+ valuation accuracy

---

## Primary Responsibilities

- Python FastAPI backend development
- Coinbase AgentKit integration
- OpenAI GPT-4 integration for valuation
- API endpoint security (signature verification)
- Database design and management
- External API integrations (Stripe, GitHub, Analytics)

---

## 📚 Learning Resources & "How-To"

### 1. Essential Tutorials
*   **[FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/):** Best documentation in the Python world. Read "User Guide".
*   **[Coinbase AgentKit](https://docs.cdp.coinbase.com/agentkit/docs/welcome):** The SDK we use for AI actions.
*   **[Prompt Engineering Guide](https://www.promptingguide.ai/):** How to make GPT-4 give better valuation results.
*   **[Web3.py Docs](https://web3py.readthedocs.io/):** How Python talks to Ethereum/Base.

### 2. Concept Explainers (EL15)

#### What is "Zero-Storage OAuth"?
> We need to verify revenue (Stripe) without storing the user's login token (Security risk).
> 1.  **Auth:** User logs in to Stripe -> We get an Access Token.
> 2.  **Fetch:** We use the token to ask Stripe: "How much did they make?"
> 3.  **Attest:** We create a cryptographically signed receipt: "Seller X made $50k".
> 4.  **Delete:** We DELETE the Access Token immediately.
>
> Result: We have proof of revenue, but hackers can't steal the user's stripe account from our DB.

#### Why "Signature Verification"?
> APIs are usually protected by passwords. In Web3, we use Wallet Signatures.
> *   The User signs a message: `"I am 0xABC requesting to list this business at 12:00 PM"`.
> *   Our API checks the math: Does this signature match address `0xABC`?
> *   If yes, we know it's really them. No password needed!

### 3. Issue Template
When creating GitHub issues, use:
```markdown
## Endpoint: POST /valuation
**Input:** `mrr=5000`
**Problem:** GPT-4 returns "I cannot answer that".
**Proposed Fix:** Update system prompt to force JSON output.
```

---

## Week 1: Infrastructure & DB Schema

### Infrastructure Setup (Cloud)
- [ ] **Monorepo Init:**
  - [ ] Initialize git repo: `valyra-monorepo`
  - [ ] Create folder structure: `apps/web`, `apps/backend`, `packages/contracts`
  - [ ] Add root `README.md` and `.gitignore`
- [ ] **ABI Sync Script:**
  - [ ] Create `scripts/sync-abis.sh`
  - [ ] Script should copy JSON artifacts from `packages/contracts/artifacts` to `apps/web/src/abis`
- [ ] Create Railway Project (Backend + Postgres)
- [ ] Create Supabase Project (Vector support enabled)
- [ ] Configure Environment Variables for Dev/Test
- [ ] Set up Arweave Wallet & IPFS Gateway

### Database Design
- [ ] Design Tables: `listings`, `offers`, `escrows`, `users`
- [ ] Create Alembic Migrations
- [ ] Implement Row Level Security (RLS) policies

---

## Week 2: Core API & Auth

### Project Foundations
- [ ] Initialize FastAPI with Poetry
- [ ] Implement "Zero-Storage" OAuth flows (Stripe, Google)
- [ ] Create Signature Verification Middleware

### CRUD Endpoints
- [ ] Listing Management (`/listings`)
- [ ] User Profile & Verification (`/users`)
- [ ] File Upload Proxy (`/upload` -> IPFS)

---

## Week 3: AI & Smart Services

### AI Agent Integration
- [ ] Integrate Coinbase AgentKit
- [ ] Implement Valuation Endpoint (`/valuation/analyze`)
- [ ] Design System Prompts for GPT-4

### Verification Services
- [ ] Build ID Verification Service (Scraper + GitHub API)
- [ ] JIT Re-verification logic on deposit

---

## Week 4: CI/CD & Integration

### DevSecOps Pipeline
- [ ] Configure GitHub Actions (Test -> Build -> Deploy)
- [ ] Set up Pytest & Playwright runners
- [ ] Configure Sentry for Error Tracking

### Notification & Event System
- [ ] Implement SendGrid Email Service
- [ ] Set up Event Listeners (Blockchain Indexer)
- [ ] Heartbeat Cron Jobs (Celery/Redis)

---

## Week 5: Production & Monitoring

### Optimization
- [ ] Implement Redis Caching for AI responses
- [ ] Database Query Optimization (Indexes)
- [ ] API Rate Limiting (10 req/min)

### Production Launch
- [ ] Deploy to Railway (Production)
- [ ] Database Migration to Production
- [ ] Domain & SSL Configuration
- [ ] Final Security Scan (OWASP ZAP)

---

## Dependencies on Other Roles

### Week 1
- **Smart Contract:** Event schema for indexing
- **DevOps:** Database provisioning (Supabase)

### Week 2
- **Frontend:** Coordinate on API request/response formats
- **Smart Contract:** Contract addresses for web3 interactions

### Week 3
- **DevOps:** Production deployment support
- **Frontend:** API integration testing

---

## Success Criteria

✅ All API endpoints functional and documented  
✅ AI valuation accuracy >80% (vs market comps)  
✅ API signature verification working  
✅ Zero-storage OAuth flows implemented  
✅ Build ID verification with JIT re-check  
✅ Repository snapshots on Arweave  
✅ Health checks and monitoring active  
✅ Response time <500ms for non-AI endpoints

---

**Last Updated:** December 11, 2025
