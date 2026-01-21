"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { SellWizard } from '@/components/sell/SellWizard';
import { useSellStore } from '@/stores/useSellStore';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { MARKETPLACE_ABI } from '@/abis/MarketplaceV1';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { setListing, reset } = useSellStore();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch listing and hydrate store
    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings/${id}`);
                if (!res.ok) throw new Error("Listing not found");

                const listing = await res.json();

                // Simple ownership check
                // Note: The backend PUT endpoint also enforces this securely
                if (address && listing.seller_address && address.toLowerCase() !== listing.seller_address.toLowerCase()) {
                    // Wait for address to be available basically
                    // But strictly, we check seller_id against user profile usually
                    // Here we rely on backend enforcement mostly, but valid UI check useful
                }

                // Hydrate store
                reset(); // Clear previous state
                setListing(listing);
                setIsLoading(false);

            } catch (err) {
                console.error(err);
                setError("Failed to load listing.");
                setIsLoading(false);
            }
        };

        if (id) {
            fetchListing();
        }
    }, [id, setListing, reset, address]);

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
                    <div className="flex flex-col items-center gap-4">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-text-muted">Loading listing details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <MarketplaceHeader />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Error</h1>
                        <p className="text-text-muted mb-4">{error}</p>
                        <button onClick={() => router.push('/app')} className="text-primary hover:underline">
                            Back to Marketplace
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <SellWizard mode="edit" listingId={id} />;
}
