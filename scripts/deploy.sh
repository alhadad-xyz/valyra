#!/bin/bash

set -e

echo "🚀 Deploying Valyra to IC mainnet..."

# Check if user is logged in to dfx
if ! dfx identity whoami > /dev/null 2>&1; then
    echo "❌ Please login to dfx first: dfx identity use <your-identity>"
    exit 1
fi

# Build optimized canisters
echo "🔨 Building optimized canisters..."
cd backend
cargo build --release --target wasm32-unknown-unknown --features production
cd ..

# Deploy to mainnet
echo "📡 Deploying to IC mainnet..."
dfx deploy --network ic --with-cycles 1000000000000

# Get canister IDs
LISTING_REGISTRY_ID=$(dfx canister id listing_registry --network ic)
VALUATION_ENGINE_ID=$(dfx canister id valuation_engine --network ic)
ESCROW_ID=$(dfx canister id escrow --network ic)
DISPUTE_DAO_ID=$(dfx canister id dispute_dao --network ic)

echo "✅ Deployment successful!"
echo ""
echo "📋 Canister IDs:"
echo "   Listing Registry: $LISTING_REGISTRY_ID"
echo "   Valuation Engine: $VALUATION_ENGINE_ID"
echo "   Escrow: $ESCROW_ID"
echo "   Dispute DAO: $DISPUTE_DAO_ID"
echo ""
echo "🔗 Candid UI: https://$LISTING_REGISTRY_ID.ic0.app"

# Top up canisters with cycles
echo "💰 Topping up canisters with cycles..."
dfx canister deposit-cycles 500000000000 listing_registry --network ic
dfx canister deposit-cycles 500000000000 valuation_engine --network ic
dfx canister deposit-cycles 500000000000 escrow --network ic
dfx canister deposit-cycles 500000000000 dispute_dao --network ic

echo "✅ Cycle top-up complete!"

# Build and deploy frontend to IC
echo "🌐 Building frontend for production..."
cd frontend
npm run build

# Upload to asset canister (if using dfx)
# dfx canister install frontend --network ic --mode upgrade

echo "🎉 Full deployment complete!"