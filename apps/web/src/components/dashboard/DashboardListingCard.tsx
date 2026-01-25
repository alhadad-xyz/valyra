"use client";

import Image from "next/image";
import { Button, Badge } from "ui";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

interface DashboardListingCardProps {
    id: string;
    image: string;
    category: string;
    title: string;
    askingPrice: string | number;
    mrr: string | number;
    aiValue: string;
    viewCount?: number;
    offerCount?: number;
    status: "active" | "pending" | "sold";
}

export function DashboardListingCard({
    id,
    image,
    category,
    title,
    askingPrice,
    mrr,
    aiValue,
    viewCount = 0,
    offerCount = 0,
    status
}: DashboardListingCardProps) {

    const getStatusColor = () => {
        switch (status) {
            case "active": return "success";
            case "pending": return "warning";
            case "sold": return "neutral";
            default: return "neutral";
        }
    };

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <div className="h-40 relative">
                <Image
                    fill
                    className="object-cover"
                    src={image || `https://placehold.co/600x400/0052FF/FFFFFF?text=${encodeURIComponent(title || "Listing")}`}
                    alt={title}
                />

                <div className="absolute top-3 left-3">
                    <Badge variant="neutral" size="sm" className="bg-white/90 dark:bg-black/80 backdrop-blur border-none shadow-sm">
                        {category}
                    </Badge>
                </div>
                <div className="absolute top-3 right-3">
                    <Badge
                        variant={getStatusColor()}
                        size="sm"
                        className="bg-white/90 dark:bg-black/80 backdrop-blur border-none shadow-sm"
                        dot
                    >
                        {status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                    <h4 className="font-bold text-text-main dark:text-white truncate text-lg mb-1">
                        {title}
                    </h4>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-text-main dark:text-white">
                            {formatCurrency(askingPrice)}
                        </span>
                        <div className="flex flex-col text-right">
                            <span className="text-xs text-text-muted">MRR</span>
                            <span className="text-sm font-bold text-text-main dark:text-white">{formatCurrency(mrr)}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 text-center">
                    <div>
                        <div className="text-xs text-text-muted mb-0.5">Views</div>
                        <div className="font-bold text-text-main dark:text-white flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            {viewCount}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-text-muted mb-0.5">Offers</div>
                        <div className="font-bold text-text-main dark:text-white flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">local_offer</span>
                            {offerCount}
                        </div>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                    <Link href={`/app/offers`} className="block w-full">
                        <Button variant="primary" fullWidth size="sm">
                            Manage Offers
                        </Button>
                    </Link>
                    <Link href={`/app/listings/${id}`} className="block w-full">
                        <Button variant="outline" fullWidth size="sm">
                            View Listing
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
