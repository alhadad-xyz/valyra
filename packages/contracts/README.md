# Valyra Smart Contracts

This package contains the smart contracts for the Valyra platform, built with Hardhat and TypeScript.

## Setup

### Prerequisites

- Node.js 18+ 
- pnpm (workspace package manager)

### Installation

Dependencies are managed at the monorepo root level. From the monorepo root:

```bash
pnpm install
```

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables:
   - `SEPOLIA_PRIVATE_KEY`: Your wallet private key (without 0x prefix)
   - `SEPOLIA_RPC_URL`: Sepolia testnet RPC URL (e.g., from Infura or Alchemy)
   - `MAINNET_RPC_URL`: Ethereum mainnet RPC URL
   - `ETHERSCAN_API_KEY`: Your Etherscan API key for contract verification

> ⚠️ **Never commit your `.env` file!** It contains sensitive information.

## Development

### Compile Contracts

```bash
pnpm build
```

This will:
1. Compile all Solidity contracts
2. Generate TypeScript types
3. Sync ABIs to other packages in the monorepo

### Run Tests

```bash
pnpm test
```

### Clean Build Artifacts

```bash
pnpm clean
```

## Project Structure

```
contracts/
├── contracts/          # Solidity smart contracts
├── test/              # Contract tests (TypeScript)
├── scripts/           # Deployment and utility scripts
├── ignition/          # Hardhat Ignition deployment modules
├── artifacts/         # Compiled contract artifacts (gitignored)
├── cache/            # Hardhat cache (gitignored)
├── hardhat.config.ts  # Hardhat configuration
└── tsconfig.json      # TypeScript configuration
```

## Deployment

### Using Hardhat Scripts

```bash
pnpm deploy
```

### Using Hardhat Ignition

Hardhat Ignition provides a declarative deployment system:

```bash
npx hardhat ignition deploy ./ignition/modules/YourModule.ts --network sepolia
```

## Networks

Configured networks:

- **hardhatMainnet**: Local development network (L1)
- **hardhatOp**: Local development network (Optimism)
- **sepolia**: Ethereum Sepolia testnet

## Technology Stack

- **Hardhat**: Ethereum development environment
- **TypeScript**: Type-safe development
- **Viem**: Modern Ethereum library
- **Solidity**: Smart contract language (v0.8.28)

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Viem Documentation](https://viem.sh)
- [Solidity Documentation](https://docs.soliditylang.org)
