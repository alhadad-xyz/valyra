"use client";

import Image from "next/image";
import { Button, Badge } from "ui";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import { Listing } from "@/types/listing";

interface PurchasedListing extends Listing {
    purchase_price?: number;
    purchase_date?: string;
}

interface PurchasedListingCardProps {
    listing: PurchasedListing;
}

export function PurchasedListingCard({ listing }: PurchasedListingCardProps) {
    // Default values if missing
    const purchasePrice = listing.purchase_price ?? listing.asking_price;
    const purchaseDate = listing.purchase_date ? new Date(listing.purchase_date).toLocaleDateString() : "Recent";
    // Use images array if available, or single image field
    const displayImage = listing?.images && listing?.images.length > 0
        ? listing?.images[0]
        : (listing?.image || `https://placehold.co/600x400/0052FF/FFFFFF?text=${encodeURIComponent(listing?.asset_name || "Asset")}`);

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full group">
            <div className="h-40 relative overflow-hidden">
                <Image
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    src={displayImage}
                    alt={listing.asset_name}
                />
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-text-main dark:text-white">
                    {listing.asset_type}
                </span>
                <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[12px] filled">check_circle</span>
                    Owned
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-text-main dark:text-white truncate flex-1 mr-2">
                        {listing.asset_name}
                    </h4>
                </div>

                <div className="flex flex-col gap-2 mb-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted text-xs">Acquired Price</span>
                        <span className="font-bold text-text-main dark:text-white">
                            {formatCurrency(purchasePrice)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted text-xs">Date</span>
                        <span className="font-medium text-text-main dark:text-white text-xs">
                            {purchaseDate}
                        </span>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                    <Link href={`/app/listings/${listing.id}`} className="block w-full">
                        <Button variant="outline" fullWidth size="sm">
                            Details
                        </Button>
                    </Link>
                    <Button variant="primary" fullWidth size="sm">
                        Manage
                    </Button>
                </div>
            </div>
        </div>
    );
}
