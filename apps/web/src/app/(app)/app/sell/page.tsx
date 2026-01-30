"use client";

import { useAccount, useReadContract } from 'wagmi';
import { SellWizard } from '@/components/sell/SellWizard';
import { SellerOnboarding } from '@/components/sell/SellerOnboarding';
import { MARKETPLACE_ABI } from '@/abis/MarketplaceV1';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';


const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

export default function SellPage() {
    const { address, isConnected } = useAccount();

    const { data: sellerStake, refetch } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'sellerStakes',
        args: [address || '0x0000000000000000000000000000000000000000'],
        query: {
            enabled: !!address,
        }
    });

    // sellerStake is [seller, stakeAmount, stakedAt, isActive, slashCount]
    const isActive = sellerStake?.[3] || false;

    if (!isActive) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <MarketplaceHeader />
                <main className="flex-1">
                    <SellerOnboarding onSuccess={() => {
                        refetch().then(() => {
                            window.location.reload();
                        });
                    }} />
                </main>
            </div>
        );
    }

    return <SellWizard />;
}
