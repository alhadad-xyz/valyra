"use client";

import { useOffers } from "@/hooks/useOffers";
import { Button } from "ui";

export function MyBidsList() {
    const { sent, isLoading } = useOffers();
    const activeBids = sent.filter(offer => offer.status === 'PENDING');

    if (activeBids.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 mt-8">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-lg font-bold text-text-main dark:text-white">My Active Bids</h4>
                <span className="bg-gray-100 dark:bg-gray-800 text-text-muted text-xs font-bold px-2 py-1 rounded-md">{activeBids.length} Active</span>
            </div>

            {isLoading ? (
                <div className="p-4 text-center text-text-muted">Loading bids...</div>
            ) : activeBids.map((offer) => (
                <div key={offer.id} className="bg-surface dark:bg-background-dark-elevated p-5 rounded-xl border border-border dark:border-gray-700 shadow-sm flex flex-col gap-4 relative group hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 bg-center bg-cover border border-border dark:border-gray-600"></div>
                            <div>
                                <p className="text-sm font-medium text-text-main dark:text-white">Of {Number(offer.offer_amount).toLocaleString()} IDRX</p>
                                <p className="text-xs text-text-muted dark:text-gray-400">For <span className="text-text-main dark:text-white font-semibold">{offer.listing_title}</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                                Pending
                            </span>
                        </div>
                    </div>
                    {/* <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" className="h-9 rounded-full text-sm font-medium">Cancel Bid</Button>
                    </div> */}
                </div>
            ))}
        </div>
    );
}
