"use client";

import { useMemo } from "react";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function ComparisonTable() {
    const scrollOptions = useMemo(() => ({ threshold: 0.4 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);

    const features = [
        {
            name: "Listing Fee",
            valyra: { value: "Free (Genesis Program)", highlight: true },
            traditional: "Up to $500 upfront",
        },
        {
            name: "Success Fee",
            valyra: { value: "2.5%", highlight: true, color: "green" },
            traditional: "10% - 15%",
        },
        {
            name: "Time to Sell",
            valyra: { value: "Days", highlight: false },
            traditional: "3-6 Months",
        },
        {
            name: "Due Diligence",
            valyra: { value: "AI-Verified", highlight: false, icon: "auto_awesome" },
            traditional: "Manual Review",
        },
        {
            name: "Escrow",
            valyra: { value: "Smart Contract", highlight: false },
            traditional: "Third-party Service",
        },
    ];

    return (
        <section
            ref={ref as any}
            className="px-4 md:px-10 lg:px-40 py-20 max-w-8xl mx-auto"
        >
            <div
                className={`flex flex-col gap-4 mb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Why Valyra is the smart choice
                </h2>
                <p className="text-lg text-text-muted max-w-2xl">
                    Compare our transparent pricing and features with traditional brokers.
                </p>
            </div>
            <div className="max-w-[960px] mx-auto">
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-black/20">
                            <tr>
                                <th className="p-6 text-sm font-bold uppercase text-gray-500 dark:text-gray-400 w-1/3">
                                    Feature
                                </th>
                                <th className="p-6 text-sm font-black uppercase text-black dark:text-white bg-primary/10 w-1/3 border-x border-primary/10">
                                    Valyra
                                </th>
                                <th className="p-6 text-sm font-bold uppercase text-gray-500 dark:text-gray-400 w-1/3">
                                    Traditional Brokers
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {features.map((feature, index) => (
                                <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                    <td className="p-6 text-sm font-medium">{feature.name}</td>
                                    <td className="p-6 bg-primary/5 border-x border-primary/10">
                                        {feature.valyra.highlight ? (
                                            <span
                                                className={`inline-flex items-center rounded-full px-6 py-1 text-sm font-bold ${feature.valyra.color === "green"
                                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                                                    : "bg-primary/20 text-black dark:text-white"
                                                    }`}
                                            >
                                                {feature.valyra.value}
                                            </span>
                                        ) : feature.valyra.icon ? (
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <span className="material-symbols-outlined text-primary text-[18px]">
                                                    {feature.valyra.icon}
                                                </span>
                                                {feature.valyra.value}
                                            </div>
                                        ) : (
                                            <span className="text-sm font-bold">{feature.valyra.value}</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-sm text-gray-500">{feature.traditional}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
