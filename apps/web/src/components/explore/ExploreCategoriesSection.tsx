"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CategoryIcon } from "./CategoryIcon";

export function ExploreCategoriesSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

    const categories = [
        { icon: "smart_toy", label: "AI Tools" },
        { icon: "shopping_bag", label: "E-comm" },
        { icon: "cloud", label: "SaaS" },
        { icon: "currency_bitcoin", label: "DeFi" },
        { icon: "newspaper", label: "Newsletter" },
        { icon: "extension", label: "Plugins" },
        { icon: "school", label: "EdTech" },
    ];

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-12 max-w-8xl mx-auto w-full border-t border-gray-200 dark:border-gray-800 transition-all duration-1000 ease-out delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white">Browse by Niche</h3>
                <div className="flex gap-2">
                    <button className="size-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </button>
                    <button className="size-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((category, index) => (
                    <CategoryIcon key={index} icon={category.icon} label={category.label} />
                ))}
            </div>
        </section>
    );
}
