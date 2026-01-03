# Hurdles & Breakthroughs: Building Valyra

Building an autonomous M&A marketplace at the intersection of **AI Agents** and **Smart Contracts** presented several unique challenges. Here are the most significant hurdles we encountered and how we overcame them.

---

## 🏗️ Hurdle 1: The Smart Wallet Encryption Paradox

### The Challenge
We initially planned to use standard **ECIES encryption** (via `eth_getEncryptionPublicKey`) to secure business credentials. However, we quickly discovered a major roadblock: **Coinbase Passkey Wallets** and many **Smart Wallets (ERC-4337)** on Base do not expose a stable public key for browser-based decryption. 

If we strictly followed the Web3 standard, we would have excluded over 50% of our target audience—the very users Base is designed for.

### The Solution: Ephemeral Keypair Fallback
We implemented a **two-layer encryption strategy**:
1.  **Generation:** Instead of encrypting directly to the wallet, we generate an **ephemeral secp256k1 keypair** in the browser.
2.  **Persistence:** The private key is encrypted using the user's wallet signature (`personal_sign`) as a seed. 
3.  **Vaulting:** The encrypted private key is stored in the Valyra backend.
4.  **Result:** Users can now recover credentials on **any device** by simply signing a message, maintaining security while supporting modern Passkey wallets.

---

## 🐍 Hurdle 2: Coinbase AgentKit "Dependency Hell"

### The Challenge
Integrating `coinbase-agentkit` alongside `langchain` and `web3.py` created a massive dependency conflict. Specifically, different packages required incompatible versions of `eth-account` and `pydantic`. Our backend wouldn't even start due to circular import errors and version mismatches.

### The Solution: Strict Pinning & Isolated Environments
We spent several hours mapping out the dependency tree. We resolved it by:
-   Using **Poetry** for strict version enforcement.
-   Pinning `eth-account` to a specific sub-version that satisfied both `web3.py` and `coinbase-agentkit`.
-   Implementing **lazy initialization** for LLM components so they wouldn't trigger dependency checks until actually needed in the agent's execution loop.

---

## 🛠️ Hurdle 3: SQLAlchemy Enum Mismatches on Postgres

### The Challenge
When implementing our **Dispute Logic**, we encountered `StatementError` and `DataError` when storing our `EscrowState` Enums in PostgreSQL. The default behavior of SQLAlchemy was treating them as strings in some contexts and native Enums in others, causing migrations to fail on the deployed Supabase instance.

### The Solution: Manual Casting & JIT Migrations
We moved away from letting SQLAlchemy manage the Enum type creation automatically. Instead, we:
1.  Created a **JIT migration script** (`supabase_jit_migration.sql`) that manually defines the Postgres TYPE before the tables are created.
2.  Used `Enum(name='escrow_state', native_enum=True)` explicitly across all models.
3.  Ensured that our indexer service explicitly casted raw blockchain integers back to Enum objects before database insertion.

---

## 🎯 Key Takeaway
The biggest lesson learned was **"Abstract, but Verify."** Whether it was high-level AI agents or low-level encryption, we found that building on the bleeding edge of Base and AgentKit requires a deep understanding of the underlying protocols before trusting the higher-level abstractions.
