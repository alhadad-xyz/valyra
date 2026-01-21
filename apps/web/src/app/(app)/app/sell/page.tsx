"use client";

import { useAccount, useReadContract } from 'wagmi';
import { SellWizard } from '@/components/sell/SellWizard';
import { SellerOnboarding } from '@/components/sell/SellerOnboarding';
import { MARKETPLACE_ABI } from '@/abis/MarketplaceV1';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { useSearchParams } from 'next/navigation';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

export default function SellPage() {
    const { address, isConnected } = useAccount();
    const searchParams = useSearchParams();
    const bypass = process.env.NODE_ENV === 'development' && searchParams.get('bypass') === 'true';

    const { data: sellerStake, isLoading, refetch } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'sellerStakes',
        args: address ? [address] : undefined,
    });

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <MarketplaceHeader />
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-text-muted">Please connect your wallet to continue.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <MarketplaceHeader />
                <div className="flex-1 flex items-center justify-center p-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            </div>
        );
    }

    // sellerStake is [seller, stakeAmount, stakedAt, isActive, slashCount]
    const isActive = sellerStake?.[3] || bypass || false;

    if (!isActive) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <MarketplaceHeader />
                <main className="flex-1">
                    <SellerOnboarding onSuccess={() => refetch()} />
                </main>
            </div>
        );
    }

    return <SellWizard />;
}
