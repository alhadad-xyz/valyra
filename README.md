# Valyra

**Autonomous marketplace for micro-SaaS and digital assets powered by AI and Base blockchain.**

## 🏗️ Project Structure

This is a monorepo managed with [Turborepo](https://turbo.build/) and [pnpm](https://pnpm.io/).

```
valyra/
├── apps/
│   ├── web/          # Next.js frontend
│   └── backend/      # Python FastAPI backend
├── packages/
│   └── contracts/    # Smart contracts (Solidity)
└── scripts/          # Build and automation scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.x
- pnpm 8.10.0

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

## 📜 Smart Contract ABIs

Contract ABIs are automatically synchronized from the contracts package to the backend application.

### Automatic Sync

ABIs are synced automatically in these scenarios:

1. **After building contracts**: `cd packages/contracts && pnpm build`
2. **Pre-commit hook**: When committing contract changes
3. **CI/CD**: On push to main/develop or PRs affecting contracts

### Manual Sync

```bash
pnpm sync-abis
```

For more details, see [scripts/README.md](scripts/README.md).

## 📦 Available Scripts

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Run linters
- `pnpm format` - Format code with Prettier
- `pnpm sync-abis` - Manually sync contract ABIs

## 🔗 Documentation

- [Product Requirements (PRD)](docs/prd.md)
- [Technical Design Document (TDD)](docs/tdd.md)
- [Design Specifications](docs/design-spec.md)
- [ABI Sync Documentation](scripts/README.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass and code is formatted
4. Submit a pull request

Pre-commit hooks will automatically:
- Sync contract ABIs (if contracts changed)
- Run linters and formatters

## 📄 License

[Add license information]

## 🔗 Links

- [GitHub Repository](https://github.com/alhadad-xyz/valyra)
- [Base Network](https://base.org/)
