"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingSkeleton } from "@/components/listings/ListingSkeleton";
import { Fragment } from "react";

import { useState } from "react";

// Helper to fetch listings from the API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const fetchListings = async ({ pageParam = 1, filters }: { pageParam?: number, filters: any }) => {
    // Calculate skip based on page and limit
    const limit = 12;
    const skip = (pageParam - 1) * limit;

    // Construct URL with query params
    const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        ...filters,
    });

    // Remove undefined/null filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    // Re-construct params to strictly include valid filters
    const validParams = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
    });
    if (filters.asset_type) validParams.set("asset_type", filters.asset_type);
    if (filters.min_price) validParams.set("min_price", filters.min_price.toString());
    if (filters.max_price) validParams.set("max_price", filters.max_price.toString());

    const response = await fetch(`${API_URL}/listings/?${validParams}`);
    if (!response.ok) {
        throw new Error("Failed to fetch listings");
    }
    return response.json();
};

export function MarketplaceGrid() {
    const [activeFilters, setActiveFilters] = useState({
        asset_type: undefined as string | undefined,
        min_price: undefined as number | undefined,
        max_price: undefined as number | undefined,
    });

    const toggleFilter = (type: string, value: any) => {
        setActiveFilters(prev => {
            // Simple toggle logic for demo purposes
            if (type === 'asset_type') {
                return { ...prev, asset_type: prev.asset_type === value ? undefined : value };
            }
            if (type === 'price_range') {
                // value is { min, max }
                const isSame = prev.min_price === value.min && prev.max_price === value.max;
                return {
                    ...prev,
                    min_price: isSame ? undefined : value.min,
                    max_price: isSame ? undefined : value.max
                };
            }
            return prev;
        });
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["listings", activeFilters],
        queryFn: ({ pageParam }) => fetchListings({ pageParam, filters: activeFilters }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.nextCursor ?? (lastPage.length === 12 ? allPages.length + 1 : undefined);
        },
    });

    const listings = data?.pages.flatMap((page) => Array.isArray(page) ? page : page.items) || [];
    const totalCount = data?.pages[0]?.total ?? listings.length;

    return (
        <section className="flex-1 min-w-0">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-text-main dark:text-white">
                        {status === "pending" ? (
                            <span className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-48 rounded inline-block" />
                        ) : (
                            <>
                                {listings.length > 0 ? `1 - ${listings.length}` : "0"} results
                            </>
                        )}
                    </h1>
                </div>
                {/* ... sort controls ... */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {/* Sort UI preserved for now */}
                        <button className="flex items-center gap-2 text-sm font-medium text-text-main dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 hover:border-primary transition-colors">
                            Best Match
                            <span className="material-symbols-outlined text-lg text-gray-400">expand_more</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <button
                    onClick={() => toggleFilter('asset_type', 'saas')}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${activeFilters.asset_type === 'saas'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-muted dark:text-gray-300 hover:border-primary'
                        }`}
                >
                    SaaS Only
                    {activeFilters.asset_type === 'saas' && <span className="material-symbols-outlined text-white text-sm">close</span>}
                </button>

                <button
                    onClick={() => toggleFilter('price_range', { min: 50000000, max: undefined })}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${activeFilters.min_price === 50000000
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-muted dark:text-gray-300 hover:border-primary'
                        }`}
                >
                    &gt; 50M IDRX
                    {activeFilters.min_price === 50000000 && <span className="material-symbols-outlined text-white text-sm">close</span>}
                </button>

                <button
                    onClick={() => setActiveFilters({ asset_type: undefined, min_price: undefined, max_price: undefined })}
                    className="text-primary text-xs font-medium ml-2 hover:underline"
                >
                    Clear All Filters
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {status === "pending" ? (
                    Array.from({ length: 8 }).map((_, idx) => <ListingSkeleton key={idx} />)
                ) : status === "error" ? (
                    <div className="col-span-full text-center py-12 text-red-500">
                        Error: {error.message}
                    </div>
                ) : (
                    <>
                        {listings.map((item: any, idx: number) => (
                            <ListingCard
                                key={`${item.id}-${idx}`}
                                image={item.image || ""}
                                category={item.asset_type || "Other"}
                                title={item.asset_name || "Untitled"}
                                description={item.description || ""}
                                askingPrice={item.asking_price || 0}
                                mrr={item.mrr || 0}
                                aiValue={item.ai_value || "N/A"}
                                aiValueStatus={item.ai_value_status || "fair"}
                                trustScore={item.trust_score || 0}
                                techStack={item.tech_stack ? Object.values(item.tech_stack) : []}
                                isCodeVerified={item.verification_status === "verified"}
                                verificationLevel={item.verification_level}
                            />
                        ))}
                        {listings.length === 0 && (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No listings found matching your filters.
                            </div>
                        )}
                    </>
                )}
                {isFetchingNextPage && (
                    Array.from({ length: 4 }).map((_, idx) => <ListingSkeleton key={`more-${idx}`} />)
                )}
            </div>

            {/* Pagination / Load More */}
            <div className="flex justify-center mt-12 mb-8">
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isFetchingNextPage ? "Loading..." : "Load More"}
                    </button>
                )}
            </div>
        </section>
    );
}
