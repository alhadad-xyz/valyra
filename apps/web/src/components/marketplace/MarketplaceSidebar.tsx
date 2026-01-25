"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function MarketplaceSidebar() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleFilterChange = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null) {
            params.delete(key);
        } else {
            // Check if toggling off same value for exclusive filters
            if (params.get(key) === value) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }

        // Reset page
        params.delete('skip');

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const currentAssetType = searchParams.get('asset_type');
    const minPrice = searchParams.get('min_price');
    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white dark:bg-background-dark-elevated rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg text-text-main dark:text-white">Filter</h2>
                    <button
                        onClick={() => router.push('?', { scroll: false })}
                        className="text-xs text-text-muted hover:text-primary transition-colors"
                    >
                        Reset
                    </button>
                </div>

                {/* Verification Level */}
                <div className="mb-8">
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Verification Level</h3>
                    <div className="space-y-3">
                        {[
                            { label: "Basic", value: "1", icon: null },
                            { label: "Standard", value: "2", icon: "shield", iconColor: "text-blue-500" },
                            { label: "Enhanced", value: "3", icon: "verified", iconColor: "text-yellow-500" }
                        ].map((level) => {
                            const currentLevels = searchParams.get('verification_level')?.split(',') || [];
                            const isChecked = currentLevels.includes(level.value);

                            return (
                                <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        checked={isChecked}
                                        onChange={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            let newLevels = [...currentLevels];

                                            if (isChecked) {
                                                newLevels = newLevels.filter(l => l !== level.value);
                                            } else {
                                                newLevels.push(level.value);
                                            }

                                            if (newLevels.length > 0) {
                                                params.set('verification_level', newLevels.join(','));
                                            } else {
                                                params.delete('verification_level');
                                            }

                                            // Reset pagination
                                            params.delete('skip');

                                            router.push(`?${params.toString()}`, { scroll: false });
                                        }}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                        type="checkbox"
                                    />
                                    <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                        {level.icon && (
                                            <span className={`material-symbols-outlined ${level.iconColor} text-[18px] filled`}>{level.icon}</span>
                                        )}
                                        {level.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Asset Types */}
                <div className="mb-8">
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Asset Types</h3>
                    <div className="space-y-3">
                        {["SaaS", "E-commerce", "Content Site", "Community", "Other"].map((type, idx) => {
                            const valueMap: Record<string, string> = {
                                "SaaS": "saas",
                                "E-commerce": "ecommerce",
                                "Content Site": "content",
                                "Community": "community",
                                "Other": "other"
                            };
                            const value = valueMap[type];
                            return (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        checked={currentAssetType === value}
                                        onChange={() => handleFilterChange('asset_type', value)}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                        type="checkbox"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                        {type}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="mb-8">
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Revenue Trend</h3>
                    <div className="space-y-3">
                        {["Growing", "Stable", "Declining"].map((trend, idx) => {
                            const currentTrends = searchParams.get('revenue_trend')?.split(',') || [];
                            const isChecked = currentTrends.includes(trend.toLowerCase());
                            return (
                                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        checked={isChecked}
                                        onChange={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            let newTrends = [...currentTrends];
                                            const value = trend.toLowerCase();

                                            if (isChecked) {
                                                newTrends = newTrends.filter(t => t !== value);
                                            } else {
                                                newTrends.push(value);
                                            }

                                            if (newTrends.length > 0) {
                                                params.set('revenue_trend', newTrends.join(','));
                                            } else {
                                                params.delete('revenue_trend');
                                            }

                                            // Reset pagination
                                            params.delete('skip');

                                            router.push(`?${params.toString()}`, { scroll: false });
                                        }}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                        type="checkbox"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                        {trend}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-sm text-text-main dark:text-white">Monthly Revenue</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <input
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-white outline-none transition-all"
                                type="number"
                                placeholder="Min MRR"
                                value={searchParams.get('min_mrr') || ''}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (e.target.value) params.set('min_mrr', e.target.value);
                                    else params.delete('min_mrr');
                                    router.push(`?${params.toString()}`, { scroll: false });
                                }}
                            />
                        </div>
                        <div className="relative">
                            <input
                                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-white outline-none transition-all"
                                type="number"
                                placeholder="Max MRR"
                                value={searchParams.get('max_mrr') || ''}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (e.target.value) params.set('max_mrr', e.target.value);
                                    else params.delete('max_mrr');
                                    router.push(`?${params.toString()}`, { scroll: false });
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Asking Price */}
                <div>
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Asking Price</h3>
                    <div className="space-y-3">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">IDRX</span>
                            <input
                                className="w-full pl-12 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-white outline-none transition-all"
                                type="number"
                                placeholder="Min Price"
                                value={searchParams.get('min_price') || ''}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (e.target.value) params.set('min_price', e.target.value);
                                    else params.delete('min_price');
                                    router.push(`?${params.toString()}`, { scroll: false });
                                }}
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">IDRX</span>
                            <input
                                className="w-full pl-12 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-white outline-none transition-all"
                                type="number"
                                placeholder="Max Price"
                                value={searchParams.get('max_price') || ''}
                                onChange={(e) => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    if (e.target.value) params.set('max_price', e.target.value);
                                    else params.delete('max_price');
                                    router.push(`?${params.toString()}`, { scroll: false });
                                }}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="mt-4 flex flex-col gap-2">
                            {[
                                { label: "Under 100M IDRX", max: 100000000 },
                                { label: "100M - 500M IDRX", min: 100000000, max: 500000000 },
                                { label: "500M IDRX+", min: 500000000 }
                            ].map((range, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (range.min) params.set('min_price', range.min.toString());
                                        else params.delete('min_price');

                                        if (range.max) params.set('max_price', range.max.toString());
                                        else params.delete('max_price');

                                        router.push(`?${params.toString()}`, { scroll: false });
                                    }}
                                    className={`w-full py-2 text-xs border rounded-lg transition-colors ${(range.min?.toString() === minPrice || (!range.min && !minPrice && searchParams.get('max_price')))
                                        ? 'bg-primary text-white border-primary'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
