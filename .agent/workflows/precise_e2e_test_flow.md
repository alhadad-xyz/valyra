---
description: Precise end-to-end test flow for Valyra Marketplace
---

# Valyra End-to-End Test Flow

This workflow validates the core listing creation and purchase flow on the Base Sepolia testnet.

## Prerequisites
- [x] Contracts deployed to Base Sepolia
- [x] Application .env files updated with contract addresses
- [ ] Backend running with new config
- [ ] Frontend running with new config

## Test Steps

### 1. Listing Creation (Seller)
1. **Navigate to /create**: Open the creation page.
2. **Connect Wallet**: Connect a wallet with Base Sepolia ETH.
    - *Note: Ensure wallet is whitelisted/staked (or use Genesis program).*
3. **Fill Form**: Enter listing details (Title, Price, Description, Images).
4. **Submit**: Click "Create Listing".
    - *Validation: Check wallet for signature request.*
    - *Validation: Check wallet for transaction confirmation.*
5. **Verify**: Wait for transaction success and redirection to listing page.

### 2. Marketplace Exploration
1. **Navigate to /explore**: View the marketplace grid.
2. **Verify Listing**: valid listing should appear in recent items.

### 3. Purchase Flow (Buyer)
1. **Select Listing**: Click on the newly created listing.
2. **Connect Buyer Wallet**: Switch to a different wallet (Buyer).
3. **Buy Now/Make Offer**: Click purchase action.
    - *Validation: Check wallet for approval/transfer transaction.*
4. **Escrow Initialization**: Verify redirection to Escrow Tracker.

### 4. Escrow & Delivery
1. **Seller Action**: Seller uploads credentials/files.
2. **Buyer Action**: Buyer confirms receipt.
3. **Completion**: Funds released to Seller.

## Automated Verification Command
Since we don't have a UI automation framework set up yet, we will verify the backend API endpoints directly.

```bash
# Verify Backend Health
curl http://localhost:8000/api/v1/health

# List Active Listings
curl http://localhost:8000/api/v1/listings?status=active
```
