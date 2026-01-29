"use client";

import { useState, useMemo } from 'react';
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";
import { usePurchases } from "@/hooks/usePurchases";
import { PurchasedListingCard } from "@/components/listings/PurchasedListingCard";
import { Spinner } from "ui";
import Link from 'next/link';

export default function MyPurchasesPage() {
    const { data: purchases, isLoading, isError } = usePurchases();
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("date"); // date, price_asc, price_desc

    const filteredPurchases = useMemo(() => {
        if (!purchases) return [];

        let filtered = [...purchases];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.asset_name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.purchase_date || 0).getTime();
            const dateB = new Date(b.purchase_date || 0).getTime();
            const priceA = Number(a.purchase_price || 0);
            const priceB = Number(b.purchase_price || 0);

            if (sortBy === "date") return dateB - dateA;
            if (sortBy === "price_asc") return priceA - priceB;
            if (sortBy === "price_desc") return priceB - priceA;
            return 0;
        });

        return filtered;
    }, [purchases, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />

            <main className="flex-1 max-w-8xl mx-auto w-full px-4 lg:px-6 py-8 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold text-text-main dark:text-white">My Acquisitions</h1>
                        <p className="text-text-muted dark:text-gray-400">
                            Manage your digital asset portfolio.
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white cursor-pointer"
                        >
                            <option value="date">Newest First</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="price_asc">Price: Low to High</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Spinner className="size-8 text-primary" />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                            <p className="text-red-500">Failed to load acquisitions.</p>
                            <button onClick={() => window.location.reload()} className="text-primary hover:underline">Retry</button>
                        </div>
                    ) : !purchases || purchases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center bg-surface dark:bg-background-dark-elevated rounded-xl border border-border dark:border-gray-700 p-8">
                            <div className="size-16 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-400 text-3xl">shopping_bag</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-text-main dark:text-white">No acquisitions yet</h3>
                                <p className="text-text-muted dark:text-gray-400 max-w-md mx-auto">
                                    You haven't purchased any digital assets yet. Browse the marketplace to find your next investment.
                                </p>
                            </div>
                            <Link
                                href="/"
                                className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Browse Marketplace
                            </Link>
                        </div>
                    ) : filteredPurchases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                            <p className="text-text-muted">No items match your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPurchases.map((listing) => (
                                <PurchasedListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
