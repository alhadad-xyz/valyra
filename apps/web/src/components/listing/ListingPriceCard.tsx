"use client";

import { Button } from "ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OfferModal } from "./OfferModal";

interface ListingPriceCardProps {
    price: string;
    usdPrice: string;
    lastSold?: string;
}

export function ListingPriceCard({ price, usdPrice, lastSold }: ListingPriceCardProps) {
    const router = useRouter();
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-200 dark:ring-gray-700">
            <div className="p-6">
                <div className="mb-6">
                    <span className="text-sm font-medium text-text-muted">Current Price</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-text-main dark:text-white">{price}</span>
                        <span className="text-sm font-medium text-text-muted">≈ {usdPrice}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        variant="primary"
                        fullWidth
                        rightIcon={<span className="material-symbols-outlined text-lg">arrow_forward</span>}
                        onClick={() => router.push("/app/escrow/VLY-8842")}
                    >
                        Buy Now
                    </Button>
                    <Button
                        variant="secondary"
                        fullWidth
                        className="border-text-main/10 dark:border-white/10 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setIsOfferModalOpen(true)}
                    >
                        Make Offer
                    </Button>
                    <div className="text-center">
                        <span className="text-[10px] font-medium text-text-muted">Includes 2.5% Valyra protection fee</span>
                    </div>
                </div>

                {/* Make Offer Modal Placeholder - Will be replaced by actual component */}
                <OfferModal
                    isOpen={isOfferModalOpen}
                    onClose={() => setIsOfferModalOpen(false)}
                    listingId={1n} // TODO: Pass real listing ID
                    listingPrice={price}
                    onSuccess={() => {
                        // Optional: Refresh data or show toast
                        setIsOfferModalOpen(false);
                    }}
                />
            </div>
            {lastSold && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark px-6 py-3">
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-text-muted">
                        <span className="material-symbols-outlined text-[16px]">history</span>
                        Last sold for {lastSold}
                    </div>
                </div>
            )}
        </div>
    );
}
