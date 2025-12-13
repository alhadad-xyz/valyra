# Role 1: Smart Contract Engineer (Lead)

**Focus:** Solidity Development, Contract Architecture, Security  
**Timeline:** 5 Weeks  
**Key Deliverable:** Deployed and verified contracts on Base Mainnet with <$0.20 gas cost

---

## Primary Responsibilities

- Solidity contract development (Escrow, Marketplace, Proxy)
- Smart contract testing and deployment
- Gas optimization
- Contract upgradability implementation (UUPS)
- Team technical leadership

---

## 📚 Learning Resources & "How-To"

### 1. Essential Tutorials
*   **[Speed Run Ethereum](https://speedrunethereum.com/):** Best way to learn Solidity + Scaffold-ETH quickly.
*   **[CryptoZombies](https://cryptozombies.io/):** Fun interactive coding school for Solidity beginner to intermediate.
*   **[Foundry Book](https://book.getfoundry.sh/):** If you prefer Foundry over Hardhat (recommended for speed).
*   **[OpenZeppelin Wizard](https://wizard.openzeppelin.com/):** Code generator for secure smart contracts. Use this to scaffold!

### 2. Concept Explainers (EL15)

#### What is a UUPS Proxy?
> Imagine a "Remote Control" (Proxy) and a "TV" (Implementation). The user only points at the Remote.
> *   **Standard Contract:** If the TV breaks, you have to buy a new house.
> *   **Proxy Pattern:** You keep the Remote (address) but swap the TV (logic) behind the scenes.
> *   **UUPS:** The logic for swapping the TV lives inside the TV itself to save gas.
>
> **Why we use it:** So we can fix bugs in `EscrowV1` without asking users to move their funds to a new address.

#### What is "Check-Effects-Interactions"?
> A security rule to stop attackers from draining funds (Reentrancy).
> 1.  **Check:** Do you have enough money? `require(balance >= amount)`
> 2.  **Effects:** Deduct money from your internal ledger. `balance -= amount`
> 3.  **Interactions:** Actually send the ETH/Tokens. `transfer(amount)`
>
> **Never** do step 3 before step 2!

### 3. Issue Template
When creating GitHub issues, use:
```markdown
## Contract: EscrowV1.sol
**Function:** `depositFunds`
**Problem:** Gas cost is too high (150k gas)
**Proposed Fix:** Use unchecked math for the balance update
```

---

## Week 1: Foundation Contracts

### Setup
- [ ] Initialize Hardhat project with TypeScript inside `packages/contracts`
- [ ] **Important:** Ensure `hardhat.config.ts` exports ABIs to `deployment/`
- [ ] Configure Base Sepolia testnet
- [ ] Set up Foundry for testing
- [ ] Install OpenZeppelin Contracts Upgradeable

### Basic Marketplace & Staking
- [ ] Implement `MarketplaceV1` skeleton
- [ ] `createListing()`
- [ ] Seller Stake logic (`stakeToSell`, `withdrawStake`)
- [ ] Genesis Seller logic (counters, event emission)

---

## Week 2: Core Escrow Logic

### Escrow Contract (`EscrowV1.sol`)
- [ ] Implement UUPS upgradeable pattern
- [ ] `depositFunds()`
- [ ] `confirmReceipt()`
- [ ] `releaseFunds()`
- [ ] Transition Hold System (90/10 split)

### Testing Round 1
- [ ] Unit tests for staking mechanics
- [ ] Unit tests for escrow state transitions
- [ ] Deploy to Sepolia for Frontend integration

---

## Week 3: Advanced Features

### Snapshot & Integrations
- [ ] Implement `EscrowSnapshot` struct & storage
- [ ] Earnest Money System (`makeOffer`, `processDeposit`)
- [ ] Emergency Eject Logic (`emergencyWithdraw`)

### Integration Testing
- [ ] Verify IDRX token transfers regarding fees
- [ ] Test Genesis Seller limit enforcement (50 users)

---

## Week 4: Disputes & Administration

### Dispute System
- [ ] Implement `Dispute` struct
- [ ] `raiseDispute()` & `resolveDispute()`
- [ ] Evidence hash storage

### Admin Controls
- [ ] Dead Man's Switch (backup admin logic)
- [ ] Treasury Timelock contract
- [ ] Transaction limit tiers (AML compliance)

---

## Week 5: Security & Mainnet Launch

### Security Audit
- [ ] Slither static analysis
- [ ] Reentrancy guard verification
- [ ] Check-Effects-Interactions review
- [ ] Gas optimization (unchecked math, storage packing)

### Deployment
- [ ] Final Sepolia practice run
- [ ] **Deploy to Base Mainnet**
- [ ] Verify contracts on Basescan
- [ ] Transfer ownership to Multi-sig wallet

---

## Success Criteria

✅ All contracts deployed and verified on Base Mainnet  
✅ >80% test coverage  
✅ Gas cost <$0.20 per transaction  
✅ No critical security vulnerabilities  
✅ Upgrade mechanism working (UUPS)  
✅ Emergency eject tested successfully

---

**Last Updated:** December 11, 2025
