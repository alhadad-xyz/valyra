# Valyra Technology Stack & Infrastructure

Valyra is built using a modern, scalable, and decentralized-first architecture. Our stack is designed to combine the performance of **Base L2** with the intelligence of **AI Agents**.

---

## 🟦 Blockchain & Onchain Infrastructure
*   **Network:** [Base L2](https://base.org) (Fast, low-cost execution).
*   **Settlement Asset:** **IDRX** (Indonesian Rupiah Stablecoin).
*   **Smart Contracts:** [Solidity](https://soliditylang.org/) (Version 0.8.20+).
*   **Identity System:** [Basenames](https://base.org/names) (Integrated via OnchainKit).
*   **Development Framework:** [Foundry](https://book.getfoundry.sh/) (Testing, scripting, and deployment).

---

## 🤖 AI & Intelligent Agents
*   **Orchestration:** [Coinbase AgentKit](https://github.com/coinbase/agentkit) (Linking Web3 actions to AI logic).
*   **LLM Engine:** [Google Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/) (For valuation, due diligence, and agent reasoning).
*   **Framework:** [LangChain](https://www.langchain.com/) (Chain-of-thought and tool management).
*   **Wallet Integration:** [CDP SDK](https://docs.cdp.coinbase.com/) (For programmatic agent wallet operations).

---

## ⚙️ Backend API
*   **Language:** [Python 3.11+](https://www.python.org/).
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (High-performance asynchronous API).
*   **Database:** [PostgreSQL](https://www.postgresql.org/) (Hosted via [Supabase](https://supabase.com/)).
*   **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) with [Alembic](https://alembic.sqlalchemy.org/) for migrations.
*   **Rate Limiting:** [SlowAPI](https://github.com/lauryndas/slowapi) with [Redis](https://redis.io/).
*   **Dependency Management:** [Poetry](https://python-poetry.org/).

---

## 🎨 Frontend & User Experience
*   **Framework:** [Next.js 14+](https://nextjs.org/) (App Router, Server Components).
*   **Language:** [TypeScript](https://www.typescriptlang.org/).
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/).
*   **Web3 Components:** [OnchainKit](https://onchainkit.xyz/) (Wallet Connection, Basename rendering).
*   **Data Fetching:** [TanStack Query (v5)](https://tanstack.com/query/).
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/).
*   **Animations:** [Framer Motion](https://www.framer.com/motion/).

---

## 🔐 Security & Storage
*   **Authentication:** [WebAuthn (Passkeys)](https://webauthn.io/) for biometric sessions.
*   **End-to-End Encryption:** [ECIES](https://github.com/ecies/py) (Elliptic Curve Integrated Encryption Scheme) for business credentials.
*   **Secure Storage:** Custom Vault system using **Ephemeral Keypairs** with server-side encrypted backups.
*   **Decentralized Storage:** [IPFS](https://ipfs.tech/) via [Lighthouse](https://www.lighthouse.storage/).

---

## 🛠️ DevOps & Deployment
*   **CI/CD:** GitHub Actions.
*   **Production Hosting:** [Koyeb](https://www.koyeb.com/) (High-performance serverless deployment).
*   **Containers:** [Docker](https://www.docker.com/) for local development and staging.
*   **Monitoring:** [Sentry](https://sentry.io/) for error tracking.
