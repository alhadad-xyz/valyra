"use client";

import { useMemo } from "react";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function AssetCategoryGrid() {
    const scrollOptions = useMemo(() => ({ threshold: 0.2 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);

    const categories = [
        {
            icon: "cloud_circle",
            title: "Micro-SaaS",
            description: "Niche B2B tools with verified recurring revenue streams.",
            metric: "MRR: $1k+"
        },
        {
            icon: "extension",
            title: "Chrome Extensions",
            description: "Browser-based productivity tools with established user bases.",
            metric: "Users: 5k+"
        },
        {
            icon: "shopping_bag",
            title: "Shopify Apps",
            description: "Plugins and themes for the e-commerce ecosystem.",
            metric: "GMV: $50k"
        },
        {
            icon: "mail",
            title: "Newsletters",
            description: "Audience-first media assets with high engagement rates.",
            metric: "Subs: 10k"
        },
        {
            icon: "smart_toy",
            title: "AI Wrappers",
            description: "Applications leveraging LLM APIs for specific verticals.",
            metric: "Growth: 20%"
        }
    ];

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-10 max-w-8xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em]">What you can buy</h2>
                <a
                    className="hidden sm:flex items-center gap-1 text-sm font-bold hover:text-primary transition-colors text-text-main dark:text-white"
                    href="#"
                >
                    View Explore <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                    <div
                        key={index}
                        className={`group flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2b18] p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="size-12 rounded-lg bg-gray-100 dark:bg-[#3a3a30] flex items-center justify-center text-black dark:text-white group-hover:bg-primary group-hover:text-black transition-colors">
                                <span className="material-symbols-outlined">{category.icon}</span>
                            </div>
                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-bold">
                                {category.metric}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">{category.title}</h3>
                            <p className="text-sm text-text-muted dark:text-gray-400">
                                {category.description}
                            </p>
                        </div>
                    </div>
                ))}

                {/* View All Card */}
                <div
                    className={`group flex flex-col gap-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-[#fcfcfb] dark:bg-[#2c2b18]/50 p-6 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer items-center justify-center text-center h-full min-h-[160px] duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                    style={{ transitionDelay: `${categories.length * 100}ms` }}
                >
                    <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-primary transition-colors">
                        grid_view
                    </span>
                    <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">
                        View All Categories
                    </h3>
                </div>
            </div>
        </section>
    );
}
