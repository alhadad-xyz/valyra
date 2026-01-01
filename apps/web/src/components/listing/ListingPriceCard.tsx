"use client";

import { Button } from "ui";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
                {isOfferModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-background-dark-elevated rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
                            <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Make an Offer</h3>
                            <p className="text-sm text-text-muted mb-4">Propose a price for this asset. The seller will review your offer.</p>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Your Offer (IDRX)</label>
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-lg font-bold outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. 40.000.000"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button variant="ghost" fullWidth onClick={() => setIsOfferModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="primary" fullWidth onClick={() => router.push("/app/escrow/VLY-8842?offer=true")}>
                                    Submit Offer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
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
