"use client";

import { useOffers } from "@/hooks/useOffers";
import { Button } from "ui";

export function IncomingOffersList() {
    const { received, isLoading, stats } = useOffers();

    const pendingCount = received.filter(o => o.status === 'PENDING').length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-lg font-bold text-text-main dark:text-white">Incoming Offers</h4>
                {pendingCount > 0 && (
                    <span className="bg-primary text-text-main text-xs font-bold px-2 py-1 rounded-md">{pendingCount} Pending</span>
                )}
            </div>

            {isLoading ? (
                <div className="p-4 text-center text-text-muted">Loading offers...</div>
            ) : received.filter(o => o.status === 'PENDING').length === 0 ? (
                <div className="p-4 text-center text-text-muted">No pending offers.</div>
            ) : received.filter(o => o.status === 'PENDING').map((offer: any) => (
                <div key={offer.id} className="bg-surface dark:bg-background-dark-elevated p-5 rounded-xl border border-border dark:border-gray-700 shadow-sm flex flex-col gap-4 relative group hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 bg-center bg-cover border border-border dark:border-gray-600"></div>
                            <div>
                                <p className="text-sm font-medium text-text-main dark:text-white">Bid from {offer.buyer_address.slice(0, 6)}...{offer.buyer_address.slice(-4)}</p>
                                <p className="text-xs text-text-muted dark:text-gray-400">For <span className="text-text-main dark:text-white font-semibold">{offer.listing_title}</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-text-main dark:text-white">{Number(offer.offer_amount).toLocaleString()} IDRX</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 uppercase">Pending</span>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Button
                            variant="outline"
                            fullWidth
                            className="h-9 rounded-full text-sm font-medium"
                            onClick={() => window.location.href = '/app/offers'}
                        >
                            Review Offer
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
