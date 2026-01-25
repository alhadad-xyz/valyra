"use client";

import { useMemo } from "react";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function ProcessSection() {
    const scrollOptions = useMemo(() => ({ threshold: 0.6 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);

    const steps = [
        {
            icon: "account_balance_wallet",
            title: "1. Connect Wallet",
            description: "Securely connect your wallet to verify identity and ownership.",
        },
        {
            icon: "smart_toy",
            title: "2. AI Valuation",
            description: "Connect your Stripe/metrics to get an instant, data-backed price range.",
        },
        {
            icon: "list_alt",
            title: "3. List Asset",
            description: "Publish your listing to the autonomous marketplace with 0% listing fees.",
        },
        {
            icon: "payments",
            title: "4. Get Paid",
            description: "Funds are released instantly via escrow after verification and handover.",
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
                    Streamlined to sell in days, not months
                </h2>
                <p className="text-lg text-text-muted max-w-2xl">
                    Our autonomous process removes the friction of traditional M&A.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`flex flex-col gap-4 p-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                    >
                        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[28px]">
                                {step.icon}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold">{step.title}</h3>
                            <p className="text-text-muted dark:text-gray-400 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
