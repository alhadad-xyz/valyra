# Required GitHub Actions Secrets

This repository requires the following secrets to be configured in GitHub Actions for proper deployment and operation.

## Setup Instructions

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each of the secrets listed below

## Required Secrets

### `BASE_SEPOLIA_RPC_URL`
- **Description**: RPC endpoint URL for Base Sepolia testnet
- **How to get**: Sign up for a free account at [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
- **Format**: `https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY` or similar
- **Used for**: Deploying and interacting with smart contracts on Base Sepolia

### `DEPLOYER_PRIVATE_KEY`
- **Description**: Private key of the wallet that will deploy smart contracts
- **How to get**: Export from MetaMask or your wallet (Settings → Security & Privacy → Show private key)
- **Format**: 64-character hexadecimal string (with or without `0x` prefix)
- **⚠️ Security Note**: Never commit this to git or share publicly. Use a dedicated deployment wallet.
- **Used for**: Signing deployment transactions

### `COINBASE_API_KEY_NAME`
- **Description**: API key name from Coinbase Developer Platform for AgentKit
- **How to get**: Create an API key at [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- **Format**: String identifier for your API key
- **Used for**: Authenticating with Coinbase AgentKit services

### `COINBASE_API_KEY_PRIVATE_KEY`
- **Description**: Private key portion of your Coinbase API credentials
- **How to get**: Generated when creating API key at Coinbase Developer Platform
- **Format**: Private key string (typically PEM format)
- **⚠️ Security Note**: Never commit this to git or share publicly
- **Used for**: Signing requests to Coinbase AgentKit services

## Verification

After adding all secrets, you can verify they are set correctly by:
1. Going to **Settings** → **Secrets and variables** → **Actions**
2. Confirming all four secrets are listed (values will be hidden)

## Local Development

For local development, create a `.env` file (already in `.gitignore`) with these same variables:

```bash
BASE_SEPOLIA_RPC_URL=your_rpc_url_here
DEPLOYER_PRIVATE_KEY=your_private_key_here
COINBASE_API_KEY_NAME=your_coinbase_key_name_here
COINBASE_API_KEY_PRIVATE_KEY=your_coinbase_private_key_here
```

**Never commit the `.env` file to version control.**