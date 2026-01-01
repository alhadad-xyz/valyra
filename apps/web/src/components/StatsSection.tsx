"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function StatsSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.6 });

    const stats = [
        { label: "Transaction Speed", value: "< 2s" },
        { label: "Platform Fee", value: "2.5%" },
        { label: "Escrow Security", value: "100%" },
    ];

    return (
        <section
            ref={ref as any}
            className="bg-gray-50 dark:bg-[#1a190b] py-20 border-y border-gray-200 dark:border-gray-800"
        >
            <div
                className={`px-4 md:px-10 lg:px-40 max-w-8xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <div className="flex flex-col md:flex-row gap-12 items-start md:items-center justify-between">
                    <div className="max-w-md">
                        <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                            Built for speed and transparency
                        </h2>
                        <p className="text-text-muted dark:text-gray-400">
                            Lightning-fast transactions on Base L2 with complete fee transparency.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full md:w-auto">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-1 p-6 bg-white dark:bg-background-dark rounded-lg shadow-sm border border-gray-100 dark:border-gray-800"
                            >
                                <p className="text-sm font-medium text-text-muted uppercase tracking-wider">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
