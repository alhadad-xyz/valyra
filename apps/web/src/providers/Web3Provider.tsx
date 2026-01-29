'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, metaMask, coinbaseWallet, mock } from 'wagmi/connectors';
import { ReactNode, useState } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { privateKeyToAccount } from 'viem/accounts';

const mockAccount = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

export const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
    },
    connectors: [
        coinbaseWallet({
            appName: 'Valyra',
        }),
        metaMask(),
        injected(),
    ],
    ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider
                    chain={baseSepolia}
                    apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || 'no-api-key'}
                    config={{
                        appearance: {
                            name: 'Valyra',
                            mode: 'light',
                            theme: 'default'
                        },
                        wallet: {
                            display: 'modal',
                        },
                    }}
                >
                    <div id="ock-wrapper">
                        {children}
                    </div>
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
