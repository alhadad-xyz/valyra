"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ListingCard } from "@/components/listings/ListingCard";
import { formatCurrency } from "@/utils/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useListingsWebSocket } from "@/hooks/useListingsWebSocket";
import { useEffect } from "react";

export function ExploreJustLandingSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
    const queryClient = useQueryClient();
    const lastEvent = useListingsWebSocket();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    // Fetch listings
    const { data: listings } = useQuery({
        queryKey: ['listings', 'latest'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/listings/?limit=4`);
            if (!res.ok) throw new Error('Failed to fetch listings');
            return res.json();
        }
    });

    // Handle WebSocket events
    useEffect(() => {
        if (lastEvent?.type === 'listing.create') {
            const newListing = lastEvent.data;
            queryClient.setQueryData(['listings', 'latest'], (oldData: any[]) => {
                if (!oldData) return [newListing];
                // Prepend new listing and keep limit of 4
                return [newListing, ...oldData].slice(0, 4);
            });
        }
    }, [lastEvent, queryClient]);

    const displayListings = listings?.map((listing: any) => ({
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
    })) || [];

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-12 max-w-8xl mx-auto w-full border-t border-gray-200 dark:border-gray-800 transition-all duration-1000 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-main dark:text-white">Just Landing</h2>
                <a
                    className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1"
                    href="/explore"
                >
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayListings.length > 0 ? (
                    displayListings.map((listing: any, index: number) => (
                        <ListingCard key={listing.id || index} {...listing} />
                    ))
                ) : (
                    // Skeleton or loading state could go here, for now just empty or keeping old hardcoded as fallback?
                    // Actually let's just show a message if empty or loading
                    <div className="col-span-4 text-center text-gray-500 py-10">
                        Loading listings...
                    </div>
                )}
            </div>
        </section>
    );
}
