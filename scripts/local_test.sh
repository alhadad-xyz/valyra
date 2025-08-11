#!/bin/bash

set -e

echo "🚀 Starting Valyra local development environment..."

# Clean up any existing processes
cleanup() {
    echo "🧹 Cleaning up processes..."
    pkill -f "dfx" || true
    pkill -f "python.*agent" || true
    pkill -f "vite" || true
    exit 0
}

trap cleanup INT TERM

# Start local ICP replica
echo "📡 Starting local ICP replica..."
dfx start --clean --background

# Deploy canisters
echo "🔨 Building and deploying canisters..."
cd backend
cargo build --release --target wasm32-unknown-unknown
cd ..

dfx deploy

# Start Python agents
echo "🤖 Starting uAgents..."
cd agents

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Start agents in background
python valuation_agent.py &
VALUATION_PID=$!

python matching_agent.py &
MATCHING_PID=$!

python negotiation_agent.py &
NEGOTIATION_PID=$!

cd ..

# Install frontend dependencies and start dev server
echo "🌐 Starting frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    npm install
fi

npm run dev &
FRONTEND_PID=$!

cd ..

echo "✅ All services started successfully!"
echo ""
echo "🔗 Services available at:"
echo "   Frontend: http://localhost:5173"
echo "   Candid UI: http://localhost:4943/?canisterId=$(dfx canister id __Candid_UI)"
echo "   Local replica: http://localhost:4943"
echo ""
echo "🤖 Agents running:"
echo "   Valuation Agent: PID $VALUATION_PID"
echo "   Matching Agent: PID $MATCHING_PID"
echo "   Negotiation Agent: PID $NEGOTIATION_PID"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait