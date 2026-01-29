# Production Deployment Guide

Quick guide to deploy Valyra to production with smart contracts on Base Sepolia testnet.

## Prerequisites

- [ ] GitHub repository with latest code
- [ ] Supabase database (already set up)
- [ ] Koyeb account (for backend - already configured)
- [ ] Vercel account (for frontend)
- [ ] All API keys ready (Pinata, OpenAI, Gemini, SendGrid, etc.)

## Step 1: Deploy Backend to Koyeb

1. **Access Your Koyeb Dashboard**
   - Go to [Koyeb](https://app.koyeb.com)
   - Select your existing service or create a new one

2. **Update Service Configuration**
   - Repository: Your GitHub repository
   - Branch: `main` (or your production branch)
   - Build command: `cd apps/backend && poetry install --no-dev`
   - Run command: `cd apps/backend && poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Port: 8000

3. **Configure Environment Variables**
   Copy all variables from `.env.production.template`:
   
   **Critical Variables:**
   ```bash
   DATABASE_URL=<your-supabase-url>
   SECRET_KEY=<generate-new: openssl rand -hex 32>
   FRONTEND_URL=<will-add-after-vercel-deployment>
   
   # Base Sepolia (Testnet)
   BASE_RPC_URL=https://sepolia.base.org
   BASE_CHAIN_ID=84532
   MARKETPLACE_CONTRACT_ADDRESS=0x30bd011a06f2b153ee4eb98b146d9cebe99613f1
   ESCROW_CONTRACT_ADDRESS=0xc6ad2d94bbc0260e30a7b312de00b53963cff7a8
   IDRX_TOKEN_ADDRESS=0x9d069a4ce8c7842ab3a1eec013fe1ee3451b408a
   
   # API Keys
   PINATA_API_KEY=<your-key>
   PINATA_SECRET_KEY=<your-secret>
   GOOGLE_GEMINI_API_KEY=<your-key>
   OPENAI_API_KEY=<your-key>
   SENDGRID_API_KEY=<your-key>
   CDP_API_KEY_NAME=<your-key>
   CDP_API_KEY_PRIVATE_KEY=<your-key>
   ```

4. **Deploy**
   - Click "Deploy" or "Redeploy"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://your-app.koyeb.app`)

## Step 2: Deploy Frontend to Vercel

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project" → Import your repository
   - Framework Preset: Next.js
   - Root Directory: `apps/web`

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Configure Environment Variables**
   Add all `NEXT_PUBLIC_*` variables:
   
   ```bash
   # API
   NEXT_PUBLIC_API_URL=https://your-app.koyeb.app/api/v1
   
   # Contracts (Base Sepolia)
   NEXT_PUBLIC_CHAIN_ID=84532
   NEXT_PUBLIC_NETWORK_NAME=base-sepolia
   NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
   NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x30bd011a06f2b153ee4eb98b146d9cebe99613f1
   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xc6ad2d94bbc0260e30a7b312de00b53963cff7a8
   NEXT_PUBLIC_IDRX_TOKEN_ADDRESS=0x9d069a4ce8c7842ab3a1eec013fe1ee3451b408a
   
   # OnchainKit
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=<your-key>
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note your frontend URL (e.g., `https://your-app.vercel.app`)

## Step 3: Update Backend CORS

1. Go back to Koyeb dashboard
2. Add/update environment variable: `FRONTEND_URL=https://your-app.vercel.app`
3. Redeploy backend service

## Step 4: Test Deployment

- [ ] Visit frontend URL
- [ ] Check backend health: `https://your-backend.koyeb.app/health`
- [ ] Connect wallet (MetaMask/Coinbase Wallet)
- [ ] Switch to Base Sepolia network
- [ ] Create a test listing
- [ ] Verify indexer is working (check Koyeb logs)
- [ ] Test making an offer
- [ ] Test escrow flow

## Testnet Notice

Add this banner to your frontend to inform users they need testnet ETH:

```tsx
<div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
  <p className="text-yellow-700">
    ⚠️ This is a testnet deployment on Base Sepolia. You'll need testnet ETH to interact.
    <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" 
       className="underline ml-2" target="_blank">
      Get testnet ETH from Coinbase Faucet
    </a>
  </p>
</div>
```

## Monitoring

- **Backend Logs**: Koyeb dashboard → Your service → Logs
- **Frontend Logs**: Vercel dashboard → Deployments → Function Logs
- **Blockchain**: [Base Sepolia Explorer](https://sepolia.basescan.org/)
- **Contract Addresses**:
  - Marketplace: `0x30bd011a06f2b153ee4eb98b146d9cebe99613f1`
  - Escrow: `0xc6ad2d94bbc0260e30a7b312de00b53963cff7a8`

## Troubleshooting

**Backend won't start:**
- Check Koyeb logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct
- Check build command completed successfully

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is correct (include `/api/v1`)
- Check CORS settings in backend (`FRONTEND_URL` env var)
- Ensure backend is running and healthy

**Wallet connection fails:**
- Verify `NEXT_PUBLIC_CHAIN_ID=84532`
- Check `NEXT_PUBLIC_RPC_URL` is set to `https://sepolia.base.org`
- Ensure user is on Base Sepolia network in their wallet

**Indexer not processing events:**
- Check Koyeb backend logs for indexer errors
- Verify contract addresses match deployed contracts
- Ensure RPC URL is accessible
- Check that indexer is starting (look for "Indexer Starting" in logs)

**Transactions fail with RPC error:**
- This is a known issue with public RPC endpoints
- Transaction usually succeeds despite the error
- Consider using a dedicated RPC provider (Alchemy, Infura) for production

## Post-Deployment Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] All environment variables set
- [ ] Wallet connection works
- [ ] Can create listings
- [ ] Indexer processes events
- [ ] Database operations work
- [ ] File uploads to Pinata work
- [ ] Email notifications work (if enabled)

## Future: Migration to Mainnet

When ready to deploy contracts to Base Mainnet:

1. Deploy contracts to Base Mainnet using deployment script
2. Update environment variables:
   - `BASE_CHAIN_ID=8453`
   - `BASE_RPC_URL=https://mainnet.base.org`
   - Update all contract addresses
3. Update frontend environment variables
4. Redeploy both services
5. Remove testnet warning banner
