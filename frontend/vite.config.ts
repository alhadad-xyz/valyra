import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  define: {
    global: 'globalThis',
    'process.env.CANISTER_ID_LISTING_REGISTRY': JSON.stringify('umunu-kh777-77774-qaaca-cai'),
    'process.env.DFX_NETWORK': JSON.stringify('local'),
    'import.meta.env.VITE_IC_HOST': JSON.stringify('http://127.0.0.1:4943'),
    'import.meta.env.VITE_ENVIRONMENT': JSON.stringify('local'),
    'import.meta.env.VITE_LISTING_REGISTRY_CANISTER_ID': JSON.stringify('umunu-kh777-77774-qaaca-cai'),
  },
})