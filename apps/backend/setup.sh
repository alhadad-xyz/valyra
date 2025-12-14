#!/bin/bash

# Valyra Backend Setup Script
# This script sets up the backend development environment

set -e  # Exit on error

echo "🚀 Setting up Valyra Backend..."

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry is not installed."
    echo "📦 Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    echo "✅ Poetry installed successfully"
    echo "⚠️  Please restart your terminal or run: source ~/.bashrc (or ~/.zshrc)"
    exit 0
fi

echo "✅ Poetry found"

# Navigate to backend directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
poetry install

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created - please update with your credentials"
else
    echo "✅ .env file exists"
fi

# Check database connection
echo "🔍 Checking database configuration..."
if grep -q "postgresql://user:pass@localhost" .env; then
    echo "⚠️  Database URL is still using default values"
    echo "📝 Please update DATABASE_URL in .env with your Supabase credentials"
fi

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your credentials (Supabase, Gemini, etc.)"
echo "2. Run migrations: poetry run alembic upgrade head"
echo "3. Start dev server: poetry run uvicorn app.main:app --reload"
echo ""
echo "Or use turbo from the root:"
echo "  pnpm turbo run backend#dev"
echo ""
