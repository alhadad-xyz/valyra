"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingSkeleton } from "@/components/listings/ListingSkeleton";
import { Fragment } from "react";

import { useSearchParams, useRouter } from "next/navigation";

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
    if (filters.search) validParams.set("search", filters.search);
    if (filters.search) validParams.set("search", filters.search);
    if (filters.sort_by) validParams.set("sort_by", filters.sort_by);
    if (filters.revenue_trend) validParams.set("revenue_trend", filters.revenue_trend);
    if (filters.min_mrr) validParams.set("min_mrr", filters.min_mrr.toString());
    if (filters.max_mrr) validParams.set("max_mrr", filters.max_mrr.toString());
    if (filters.verification_level) validParams.set("verification_level", filters.verification_level);

    const response = await fetch(`${API_URL}/listings/?${validParams}`);
    if (!response.ok) {
        throw new Error("Failed to fetch listings");
    }
    return response.json();
};

export function MarketplaceGrid() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const filters = {
        asset_type: searchParams.get('asset_type') || undefined,
        min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
        max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
        min_mrr: searchParams.get('min_mrr') ? Number(searchParams.get('min_mrr')) : undefined,
        max_mrr: searchParams.get('max_mrr') ? Number(searchParams.get('max_mrr')) : undefined,
        revenue_trend: searchParams.get('revenue_trend') || undefined,
        verification_level: searchParams.get('verification_level') || undefined,
        search: searchParams.get('search') || undefined,
        sort_by: searchParams.get('sort_by') || "created_at",
    };

    const toggleFilter = (type: string, value: any) => {
        const params = new URLSearchParams(searchParams.toString());

        if (type === 'asset_type') {
            if (params.get('asset_type') === value) {
                params.delete('asset_type');
            } else {
                params.set('asset_type', value);
            }
        }
        if (type === 'price_range') {
            // value is { min, max }
            if (value.min) {
                if (params.get('min_price') === value.min.toString()) {
                    params.delete('min_price');
                } else {
                    params.set('min_price', value.min.toString());
                }
            } else {
                params.delete('min_price');
            }
            // Add max_price logic if needed, currently only min_price supported in UI demo
            if (value.max) {
                if (params.get('max_price') === value.max.toString()) {
                    params.delete('max_price');
                } else {
                    params.set('max_price', value.max.toString());
                }
            } else {
                params.delete('max_price');
            }
        }

        // Reset to page 1 when filtering
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const updateSort = (sortValue: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort_by', sortValue);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ["listings", filters],
        queryFn: ({ pageParam }) => fetchListings({ pageParam, filters }),
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
                    <div className="flex items-center gap-2 relative">
                        {/* Sort UI preserved for now */}
                        <select
                            value={filters.sort_by}
                            onChange={(e) => updateSort(e.target.value)}
                            className="text-sm font-medium text-text-main dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 hover:border-primary transition-colors outline-none cursor-pointer appearance-none pr-8 relative"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="created_at">Newest</option>
                            <option value="price">Price: Low to High</option>
                            <option value="views">Most Viewed</option>
                            <option value="trending">Trending</option>
                        </select>
                        <span className="material-symbols-outlined text-lg text-gray-400 absolute right-2 pointer-events-none">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                {filters.asset_type && (
                    <button
                        onClick={() => toggleFilter('asset_type', filters.asset_type)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all bg-primary text-white border-primary`}
                    >
                        {filters.asset_type === 'saas' ? 'SaaS Only' : filters.asset_type}
                        <span className="material-symbols-outlined text-white text-sm">close</span>
                    </button>
                )}


                {filters.verification_level && (
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('verification_level');
                            router.push(`?${params.toString()}`, { scroll: false });
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all bg-primary text-white border-primary`}
                    >
                        Verification Levels
                        <span className="material-symbols-outlined text-white text-sm">close</span>
                    </button>
                )}

                {filters.revenue_trend && (
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('revenue_trend');
                            router.push(`?${params.toString()}`, { scroll: false });
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all bg-primary text-white border-primary`}
                    >
                        Trend: {filters.revenue_trend}
                        <span className="material-symbols-outlined text-white text-sm">close</span>
                    </button>
                )}

                {(filters.min_mrr || filters.max_mrr) && (
                    <button
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('min_mrr');
                            params.delete('max_mrr');
                            router.push(`?${params.toString()}`, { scroll: false });
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all bg-primary text-white border-primary`}
                    >
                        MRR Filter
                        <span className="material-symbols-outlined text-white text-sm">close</span>
                    </button>
                )}

                {filters.min_price === 50000000 && (
                    <button
                        onClick={() => toggleFilter('price_range', { min: 50000000, max: undefined })}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all bg-primary text-white border-primary`}
                    >
                        &gt; 50M IDRX
                        <span className="material-symbols-outlined text-white text-sm">close</span>
                    </button>
                )}

                {(filters.asset_type || filters.min_price || filters.max_price || filters.verification_level || filters.revenue_trend || filters.min_mrr || filters.max_mrr) && (
                    <button
                        onClick={() => router.push('?', { scroll: false })}
                        className="text-primary text-xs font-medium ml-2 hover:underline"
                    >
                        Clear All Filters
                    </button>
                )}
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
                        {listings.map((item: any, idx: number) => {
                            // Safely extract tech stack as array of strings
                            let techStack: string[] = [];
                            if (item.tech_stack && typeof item.tech_stack === 'object') {
                                if (Array.isArray(item.tech_stack)) {
                                    techStack = item.tech_stack.filter((tech: any) => typeof tech === 'string');
                                } else {
                                    // If it's an object, keys are the tech names, filter out metadata keys like repo_url
                                    techStack = Object.keys(item.tech_stack).filter(key => key !== 'repo_url');
                                }
                            }

                            return (
                                <ListingCard
                                    key={`${item.id}-${idx}`}
                                    id={item.id}
                                    image={item.image || ""}
                                    category={item.asset_type || "Other"}
                                    title={item.asset_name || "Untitled"}
                                    description={item.description || ""}
                                    askingPrice={item.asking_price || 0}
                                    mrr={item.mrr || 0}
                                    aiValue={item.ai_value || "N/A"}
                                    aiValueStatus={item.ai_value_status || "fair"}
                                    trustScore={item.trust_score || 0}
                                    techStack={techStack}
                                    isCodeVerified={item.verification_status === "verified"}
                                    verificationLevel={item.verification_level}
                                />
                            );
                        })}
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
                        className="px-6 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isFetchingNextPage ? "Loading..." : "Load More"}
                    </button>
                )}
            </div>
        </section>
    );
}
