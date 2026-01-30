# Frontend Environment Variables for Vercel

Copy these environment variables to your Vercel project settings:

## API Configuration
```
NEXT_PUBLIC_API_URL=https://database-valyra-34c1a159.koyeb.app/api/v1
```

## Blockchain Configuration (Base Sepolia Testnet)
```
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_NETWORK_NAME=base-sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

## Smart Contract Addresses
```
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x30bd011a06f2b153ee4eb98b146d9cebe99613f1
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xc6ad2d94bbc0260e30a7b312de00b53963cff7a8
NEXT_PUBLIC_IDRX_TOKEN_ADDRESS=0x9d069a4ce8c7842ab3a1eec013fe1ee3451b408a
```

## OnchainKit
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=qkvBEEcaUh5x5L6gj7ZcfI4hsocFbyLf
```

---

## Vercel Deployment Steps

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: **Next.js**
   - Root Directory: **apps/web**
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   - Copy all variables above
   - Paste into Vercel → Settings → Environment Variables
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

5. **Update Backend CORS**
   - After deployment, note your Vercel URL (e.g., `https://valyra.vercel.app`)
   - Go to Koyeb dashboard
   - Add environment variable: `FRONTEND_URL=https://your-vercel-url.vercel.app`
   - Redeploy backend

6. **Test**
   - Visit your Vercel URL
   - Connect wallet
   - Create a test listing
   - Verify everything works!
