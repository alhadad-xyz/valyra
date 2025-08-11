# Valyra Documentation

Welcome to the Valyra documentation. This directory contains technical documentation, API specifications, and architectural decision records.

## Quick Start

To get started with Valyra development:

```bash
# Clone and start local environment
git clone <repository>
cd valyra
./scripts/local_test.sh
```

This will start:
- Local ICP replica on port 4943
- All Rust canisters deployed locally
- Python uAgents running in background
- React frontend on port 5173

## Architecture Overview

Valyra is a Web3 M&A platform built on the Internet Computer with off-chain AI agents:

### Backend (Rust ICP Canisters)
- **listing_registry**: CRUD operations for deal NFTs
- **valuation_engine**: DCF calculations with HTTPS outcalls
- **escrow**: ckUSDC escrow with t-ECDSA
- **dispute_dao**: Voting and slashing mechanisms

### Agents (Python uAgents)
- **valuation_agent**: Polls for new deals and triggers valuations
- **matching_agent**: AI-powered buyer-deal matching
- **negotiation_agent**: Handles offer/counter-offer flows

### Frontend (React + Vite)
- Role-based dashboards for founders and acquirers
- Internet Identity integration
- Real-time updates via agents

## API Documentation

See [openapi.yml](openapi.yml) for complete API specification.

## Architecture Decision Records

See [adr/](adr/) directory for detailed architectural decisions and rationale.

## Development Workflow

1. **Local Development**: Use `./scripts/local_test.sh`
2. **Testing**: Run `cargo test` (canisters) and `npm test` (frontend)
3. **Linting**: Use `./scripts/lint.sh` for all codebases
4. **Deployment**: Use `./scripts/deploy.sh` for mainnet

## Contributing

1. Follow existing code patterns and conventions
2. Add tests for new functionality
3. Update documentation for API changes
4. Run linting before committing

## Support

For questions and issues, please check existing documentation or create an issue in the repository.