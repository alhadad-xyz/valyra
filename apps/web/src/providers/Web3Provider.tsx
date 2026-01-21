'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';
import { ReactNode, useState } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';

export const config = createConfig({
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(),
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
