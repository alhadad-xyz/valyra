#!/bin/bash

set -e

echo "🧹 Running linters across Valyra codebase..."

# Rust linting
echo "🦀 Linting Rust code..."
cd backend
cargo clippy -- -D warnings
cargo fmt --check
cd ..

# Frontend linting
echo "⚛️  Linting React/TypeScript code..."
cd frontend
npm run lint
cd ..

# Python linting
echo "🐍 Linting Python agents..."
cd agents

# Install dev dependencies if needed
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install black isort flake8
else
    source venv/bin/activate
fi

# Format and check Python code
black --check .
isort --check-only .
flake8 .

cd ..

echo "✅ All linting checks passed!"