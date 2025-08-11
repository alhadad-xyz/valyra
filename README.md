# Valyra – Web3 M&A Platform

> **v1.0 MVP** – Frozen architecture for Internet Computer deployment

Valyra is a decentralized M&A platform connecting Web3 founders with acquirers using AI-powered matching, automated valuations, and secure escrow on the Internet Computer.

## 🚀 Quick Start

**One-command setup:**

```bash
git clone <repository>
cd valyra
./scripts/local_test.sh
```

This starts:
- Local IC replica (port 4943)
- All Rust canisters deployed 
- Python uAgents running
- React frontend (port 5173)

**Access points:**
- Frontend: http://localhost:5173
- Candid UI: http://localhost:4943/?canisterId=<canister-id>

## 🏗 Architecture

### Backend (Rust ICP Canisters)
```
backend/
├── shared_types/         # Common data structures
├── listing_registry/     # Deal CRUD + NFT minting
├── valuation_engine/     # DCF models + HTTPS outcalls  
├── escrow/              # ckUSDC + t-ECDSA release
└── dispute_dao/         # Voting + slashing
```

### Agents (Python uAgents)
```
agents/
├── valuation_agent.py   # Auto-trigger valuations
├── matching_agent.py    # AI buyer-deal matching
└── negotiation_agent.py # Offer/counter-offer flows
```

### Frontend (React + Vite)
```
frontend/src/
├── auth/                # Internet Identity
├── seller/              # Founder dashboard
├── buyer/               # Acquirer dashboard
└── components/          # Shared UI
```

## 🛠 Development

### Commands
```bash
# Lint all codebases
./scripts/lint.sh

# Deploy to mainnet  
./scripts/deploy.sh

# Run tests
cargo test                    # Rust canisters
npm test                     # Frontend
pytest agents/tests/         # Python agents
```

### Tech Stack
- **Canisters**: Rust + ic-cdk + ic-stable-structures
- **Agents**: Python + uAgents + httpx  
- **Frontend**: React + Vite + Internet Identity
- **Escrow**: ckUSDC + threshold ECDSA

## 📋 Features

### For Founders (Sellers)
✅ Create deal listings with company data  
✅ Receive AI-matched buyer interest  
✅ Negotiate offers via secure channels  
✅ Milestone-based escrow release  

### For Acquirers (Buyers)  
✅ Browse AI-recommended deals  
✅ Automated DCF valuations  
✅ Make structured offers  
✅ Track escrow & milestone progress  

### For Platform
✅ Decentralized dispute resolution  
✅ Reputation-based matching  
✅ Automated compliance checks  
✅ Cross-chain escrow support  

## 🔒 Security

- **Internet Identity** for user authentication
- **Threshold ECDSA** for escrow management  
- **Decentralized voting** for dispute resolution
- **Audit trail** for all transactions

## 📚 Documentation

- [API Documentation](docs/openapi.yml)
- [Architecture Decisions](docs/adr/)
- [Contributor Guide](docs/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run linting: `./scripts/lint.sh`
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

**Tag**: `v1.0-structure-final`  
**Status**: Ready for `backend/escrow/` implementation