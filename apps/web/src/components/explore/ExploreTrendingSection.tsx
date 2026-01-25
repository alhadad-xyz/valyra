"use client";

import { useMemo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingSkeleton } from "@/components/listings/ListingSkeleton";
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function ExploreTrendingSection() {
    // Memoize options to prevent IntersectionObserver flickering on re-renders
    const scrollOptions = useMemo(() => ({ threshold: 0.1 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);

    // Fetch trending listings from API
    const { data: listings, isLoading } = useQuery({
        queryKey: ['listings', 'trending-explore'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/listings/?sort_by=trending&limit=8`);
            if (!res.ok) throw new Error('Failed to fetch trending listings');
            return res.json();
        }
    });

    // Transform API data to match ListingCard props format
    const apiListings = (listings || []).map((listing: any) => ({
        id: listing.id,
        image: listing.image || "",
        category: listing.asset_type || "Other",
        title: listing.asset_name || "Untitled",
        description: listing.description || "",
        askingPrice: listing.asking_price || 0,
        mrr: listing.mrr || 0,
        aiValue: listing.ai_value || "N/A",
        aiValueStatus: listing.ai_value_status || "fair",
        trustScore: listing.trust_score || 0,
        techStack: listing.tech_stack ? Object.keys(listing.tech_stack).filter(key => key !== 'repo_url') : [],
        isCodeVerified: listing.verification_status === "verified",
        verificationLevel: listing.verification_level,
    }));

    // Fallback hardcoded data if API returns empty
    const trendingListings = apiListings.length > 0 ? apiListings.slice(1, 7) : [];
    const largeFeaturedListing = apiListings.length > 0 ? apiListings[0] : null;
    const isEmpty = !isLoading && !largeFeaturedListing && trendingListings.length === 0;

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-12 max-w-8xl mx-auto w-full border-t border-gray-200 dark:border-gray-800 transition-all duration-1000 ease-out delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            {isEmpty ? (
                <div className="text-center py-10">
                    <h2 className="text-xl font-bold text-text-main dark:text-white">Trending on Valyra</h2>
                    <p className="text-text-muted mt-2">No trending listings found at the moment.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            {isLoading ? (
                                <div>
                                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-2">
                                        Trending on Valyra
                                    </h2>
                                    <p className="text-text-muted dark:text-gray-400 mt-1">
                                        Top performing micro-startups by view count and bid activity.
                                    </p>
                                </>
                            )}
                        </div>
                        {!isLoading && (
                            <a
                                className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1"
                                href="/app?sort=trending"
                            >
                                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </a>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-4 h-full">
                            {isLoading ? (
                                <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                            ) : (
                                largeFeaturedListing && (
                                    <ListingCard
                                        {...largeFeaturedListing}
                                        size="large"
                                        isFeatured
                                    />
                                )
                            )}
                        </div>
                        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <ListingSkeleton key={i} />
                                ))
                            ) : (
                                trendingListings.map((listing: any, index: number) => (
                                    <ListingCard key={listing.id || index} {...listing} />
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
