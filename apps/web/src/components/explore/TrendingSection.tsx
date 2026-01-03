"use client";

import { useQuery } from "@tanstack/react-query";
import { ListingCard } from "@/components/listings/ListingCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function TrendingSection() {
    const { data: listings, isLoading } = useQuery({
        queryKey: ['listings', 'trending'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/listings/?sort_by=trending&limit=8`);
            if (!res.ok) throw new Error('Failed to fetch trending listings');
            return res.json();
        }
    });

    const displayListings = (listings || []).map((listing: any) => ({
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
        techStack: listing.tech_stack ? Object.values(listing.tech_stack) : [],
        isCodeVerified: listing.verification_status === "verified",
        verificationLevel: listing.verification_level,
        viewCount: listing.view_count || 0,
        showViews: true,
    }));

    return (
        <section className="px-4 md:px-10 lg:px-40 py-12 max-w-8xl mx-auto w-full border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span className="text-2xl">🔥</span> Trending on Valyra
                </h2>
                <a
                    className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1"
                    href="/app?sort=trending"
                >
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-4 text-center text-gray-500 py-10">
                        Loading trending listings...
                    </div>
                ) : displayListings.length > 0 ? (
                    displayListings.map((listing: any) => (
                        <ListingCard key={listing.id} {...listing} />
                    ))
                ) : (
                    <div className="col-span-4 text-center text-gray-500 py-10">
                        No trending listings yet
                    </div>
                )}
            </div>
        </section>
    );
}
