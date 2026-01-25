"use client";

import { useSellStore } from "@/stores/useSellStore";
import { formatCurrency } from "@/utils/format";
import Image from "next/image";
import { useAccount } from "wagmi";

export const ListingPreview = () => {
    const { title, assetType, price, mrr, revenueTrend, description } = useSellStore();
    const { address } = useAccount();

    const displayTitle = title || "Untitled Project";
    const displayPrice = price ? formatCurrency(price) : "$0.00";
    const displayMRR = mrr ? formatCurrency(mrr) : "$0/mo";

    // Determine status color (always pending generally for preview, or just show active simulation)
    const statusColor = "success";

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col h-full max-h-[400px]">
            <div className="h-40 relative bg-gray-100 dark:bg-gray-800">
                <Image
                    fill
                    className="object-cover"
                    src={`https://placehold.co/600x400/0052FF/FFFFFF?text=${encodeURIComponent(displayTitle)}`}
                    alt={displayTitle}
                />

                <span className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-text-main dark:text-white uppercase">
                    {assetType || "SAAS"}
                </span>
                <span className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase bg-white/90 dark:bg-black/80 backdrop-blur text-${statusColor}`}>
                    Preview
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="mb-4">
                    <h4 className="font-bold text-text-main dark:text-white truncate text-lg mb-1">
                        {displayTitle}
                    </h4>
                    <p className="text-xs text-text-muted line-clamp-2 h-8 mb-2">
                        {description || "No description provided yet..."}
                    </p>

                    <div className="flex justify-between items-center mt-3">
                        <span className="text-xl font-black text-text-main dark:text-white">
                            {displayPrice}
                        </span>
                        <div className="flex flex-col text-right">
                            <span className="text-xs text-text-muted">MRR</span>
                            <span className="text-sm font-bold text-text-main dark:text-white">{displayMRR}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 text-center">
                    <div>
                        <div className="text-xs text-text-muted mb-0.5">Trend</div>
                        <div className="font-bold text-text-main dark:text-white flex items-center justify-center gap-1 capitalize">
                            {revenueTrend === 'growing' && <span className="material-symbols-outlined text-[14px] text-green-500">trending_up</span>}
                            {revenueTrend === 'declining' && <span className="material-symbols-outlined text-[14px] text-red-500">trending_down</span>}
                            {revenueTrend === 'stable' && <span className="material-symbols-outlined text-[14px] text-yellow-500">trending_flat</span>}
                            {revenueTrend}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-text-muted mb-0.5">Seller</div>
                        <div className="font-bold text-text-main dark:text-white flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">account_circle</span>
                            {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Connect"}
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-xs text-text-muted italic">
                        This is how your listing will appear in the marketplace.
                    </span>
                </div>
            </div>
        </div>
    );
};
