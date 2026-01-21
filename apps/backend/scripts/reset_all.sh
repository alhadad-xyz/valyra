#!/bin/bash
# Script to clear all data and redeploy smart contracts

set -e  # Exit on error

echo "🔄 Valyra Data Reset Script"
echo "=" 
echo ""
echo "This script will:"
echo "  1. Clear all data from database tables (keeping structure)"
echo "  2. Redeploy smart contracts to Base Sepolia"
echo "  3. Update frontend environment variables"
echo ""

# Confirm with user
read -p "⚠️  Are you sure you want to proceed? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo ""
echo "📍 Step 1: Clearing Database Data"
echo "=================================="
cd "$(dirname "$0")/.."
poetry run python scripts/clear_all_data.py <<EOF
yes
EOF

echo ""
echo "📍 Step 2: Redeploying Smart Contracts"
echo "======================================="
cd ../../packages/contracts

echo "🔨 Compiling contracts..."
forge build

echo ""
echo "🚀 Deploying to Base Sepolia..."
forge script script/DeploySystem.s.sol:DeploySystem \
    --rpc-url base-sepolia \
    --broadcast \
    --verify \
    -vvv

echo ""
echo "📍 Step 3: Extracting Contract Addresses"
echo "========================================="

# Get the latest deployment file
DEPLOYMENT_FILE=$(ls -t broadcast/DeploySystem.s.sol/84532/run-latest.json 2>/dev/null || echo "")

if [ -z "$DEPLOYMENT_FILE" ]; then
    echo "⚠️  Could not find deployment file. Please update contract addresses manually."
    echo "   Check: packages/contracts/broadcast/DeploySystem.s.sol/84532/"
    exit 1
fi

# Extract addresses using jq
MARKETPLACE_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "ERC1967Proxy" and .function == null) | .contractAddress' "$DEPLOYMENT_FILE" | head -1)
ESCROW_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "ERC1967Proxy" and .function == null) | .contractAddress' "$DEPLOYMENT_FILE" | tail -1)
IDRX_ADDRESS=$(jq -r '.transactions[] | select(.contractName == "MockIDRX") | .contractAddress' "$DEPLOYMENT_FILE" | head -1)

echo ""
echo "📝 Extracted Addresses:"
echo "   IDRX Token:    $IDRX_ADDRESS"
echo "   Marketplace:   $MARKETPLACE_ADDRESS"
echo "   Escrow:        $ESCROW_ADDRESS"

echo ""
echo "📍 Step 4: Updating Frontend Environment"
echo "========================================="
cd ../../apps/web

# Update .env.local
if [ -f .env.local ]; then
    # Backup existing .env.local
    cp .env.local .env.local.backup
    echo "   ✅ Backed up .env.local to .env.local.backup"
    
    # Update addresses
    sed -i '' "s/NEXT_PUBLIC_IDRX_ADDRESS=.*/NEXT_PUBLIC_IDRX_ADDRESS=$IDRX_ADDRESS/" .env.local
    sed -i '' "s/NEXT_PUBLIC_MARKETPLACE_ADDRESS=.*/NEXT_PUBLIC_MARKETPLACE_ADDRESS=$MARKETPLACE_ADDRESS/" .env.local
    sed -i '' "s/NEXT_PUBLIC_ESCROW_ADDRESS=.*/NEXT_PUBLIC_ESCROW_ADDRESS=$ESCROW_ADDRESS/" .env.local
    
    echo "   ✅ Updated .env.local with new contract addresses"
else
    echo "   ⚠️  .env.local not found. Please create it with:"
    echo "      NEXT_PUBLIC_IDRX_ADDRESS=$IDRX_ADDRESS"
    echo "      NEXT_PUBLIC_MARKETPLACE_ADDRESS=$MARKETPLACE_ADDRESS"
    echo "      NEXT_PUBLIC_ESCROW_ADDRESS=$ESCROW_ADDRESS"
fi

echo ""
echo "📍 Step 5: Updating Backend Environment"
echo "========================================"
cd ../../apps/backend

if [ -f .env ]; then
    # Backup existing .env
    cp .env .env.backup
    echo "   ✅ Backed up .env to .env.backup"
    
    # Update addresses
    sed -i '' "s/MARKETPLACE_CONTRACT_ADDRESS=.*/MARKETPLACE_CONTRACT_ADDRESS=$MARKETPLACE_ADDRESS/" .env
    sed -i '' "s/ESCROW_CONTRACT_ADDRESS=.*/ESCROW_CONTRACT_ADDRESS=$ESCROW_ADDRESS/" .env
    
    echo "   ✅ Updated .env with new contract addresses"
else
    echo "   ⚠️  .env not found. Please update manually:"
    echo "      MARKETPLACE_CONTRACT_ADDRESS=$MARKETPLACE_ADDRESS"
    echo "      ESCROW_CONTRACT_ADDRESS=$ESCROW_ADDRESS"
fi

echo ""
echo "✨ Reset Complete!"
echo "=" 
echo ""
echo "📋 Summary:"
echo "   ✅ Database cleared (tables preserved)"
echo "   ✅ Smart contracts redeployed"
echo "   ✅ Environment variables updated"
echo ""
echo "🔄 Next Steps:"
echo "   1. Restart your backend server (poetry run uvicorn app.main:app --reload)"
echo "   2. Restart your frontend server (npm run dev)"
echo "   3. Start testing with fresh data!"
echo ""
