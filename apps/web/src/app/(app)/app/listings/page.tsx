"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useUser } from "@/hooks/useUser";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { DashboardListingCard } from "@/components/dashboard/DashboardListingCard";
import { useQuery } from "@tanstack/react-query";
import { Footer } from "@/components/Footer";
import { Button } from "ui";
import Link from "next/link";
import { API_URL } from "@/utils/constants";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();

    const { data: listings, isLoading } = useQuery({
        queryKey: ['my-listings', address],
        queryFn: async () => {
            if (!address) return [];

            // In a real implementation, we would pass ?seller={address}
            // For now, we fetch all and filter client side
            const res = await fetch(`${API_URL}/listings/?limit=100`);
            if (!res.ok) throw new Error('Failed to fetch listings');
            const data = await res.json();

            const listingsData = Array.isArray(data) ? data : (data.items || []);

            return listingsData.filter((item: any) =>
                item.seller_address?.toLowerCase() === address.toLowerCase()
            );
        },
        enabled: !!address,
    });

    // Fetch User Profile for Stats
    const { data: userData } = useUser();

    const stats = useMemo(() => {
        if (!listings) return { totalListings: 0, activeOffers: 0, totalViews: 0 };
        return {
            totalListings: listings.length,
            activeOffers: listings.reduce((acc: number, item: any) => acc + (item.offer_count || 0), 0),
            totalViews: listings.reduce((acc: number, item: any) => acc + (item.view_count || 0), 0),
        };
    }, [listings]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />

            <main className="flex-1 max-w-8xl mx-auto w-full px-4 lg:px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-main dark:text-white mb-2">My Dashboard</h1>
                        <p className="text-text-muted">Manage your listings and offers.</p>
                    </div>
                    <Link href="/app/sell">
                        <Button variant="primary" leftIcon={<span className="material-symbols-outlined">add</span>}>
                            Create New Listing
                        </Button>
                    </Link>
                </div>

                {!isConnected ? (
                    <div className="text-center py-20 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700">
                        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">wallet</span>
                        <h3 className="text-xl font-bold text-text-main dark:text-white mb-2">Connect Wallet</h3>
                        <p className="text-text-muted mb-6">Connect your wallet to view your listings.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 flex flex-col">
                                <span className="text-text-muted text-xs uppercase font-bold tracking-wider">Total Listings</span>
                                <span className="text-2xl font-black text-text-main dark:text-white mt-1">{stats.totalListings}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 flex flex-col">
                                <span className="text-text-muted text-xs uppercase font-bold tracking-wider">Active Offers</span>
                                <span className="text-2xl font-black text-primary mt-1">
                                    {stats.activeOffers}
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 flex flex-col">
                                <span className="text-text-muted text-xs uppercase font-bold tracking-wider">Total Views</span>
                                <span className="text-2xl font-black text-text-main dark:text-white mt-1">
                                    {stats.totalViews}
                                </span>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 flex flex-col">
                                <span className="text-text-muted text-xs uppercase font-bold tracking-wider">Seller Level</span>
                                <span className="text-2xl font-black text-text-main dark:text-white mt-1 flex items-center gap-2">
                                    {userData?.verification_level ? (
                                        <>
                                            {userData.verification_level.charAt(0).toUpperCase() + userData.verification_level.slice(1)}
                                            {userData.verification_level !== 'basic' && (
                                                <span className="material-symbols-outlined text-primary text-xl" title="Verified Seller">verified</span>
                                            )}
                                        </>
                                    ) : 'Basic'}
                                </span>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div>
                            <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Active Listings</h2>
                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : listings && listings.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {listings.map((item: any) => (
                                        <DashboardListingCard
                                            key={item.id}
                                            id={item.id}
                                            title={item.asset_name || "Untitled"}
                                            category={item.asset_type || "Other"}
                                            image={item.image || ""}
                                            askingPrice={item.asking_price || 0}
                                            mrr={item.mrr || 0}
                                            aiValue={item.ai_value || "N/A"}
                                            viewCount={item.view_count || 0}
                                            offerCount={item.offer_count || 0} // Assuming mock data has this or undefined
                                            status="active"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">storefront</span>
                                    <p className="text-text-muted">You haven't created any listings yet.</p>
                                    <Link href="/app/sell" className="text-primary hover:underline mt-2 inline-block">Start Selling</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
