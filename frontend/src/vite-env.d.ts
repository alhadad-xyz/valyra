/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LISTING_REGISTRY_CANISTER_ID: string
  readonly VITE_IC_HOST: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_IPFS_GATEWAY: string
  readonly VITE_IPFS_API: string
  readonly VITE_IPFS_PROJECT_ID: string
  readonly VITE_IPFS_PROJECT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}