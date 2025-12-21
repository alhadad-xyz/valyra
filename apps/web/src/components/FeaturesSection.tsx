"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function FeaturesSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.4 });

    const features = [
        {
            icon: "analytics",
            title: "AI Due Diligence",
            description:
                "Instant analysis of revenue claims and codebase quality using advanced LLMs. Get a health score in seconds.",
        },
        {
            icon: "lock_person",
            title: "Trustless Escrow",
            description:
                "Funds are locked in a verified smart contract and only released when ownership is cryptographically transferred.",
        },
        {
            icon: "terminal",
            title: "Code Verification",
            description:
                "Automated verification of GitHub repositories to ensure asset integrity. No more buying vaporware.",
        },
        {
            icon: "payments",
            title: "Local Currency (IDRX)",
            description:
                "Pay in Indonesian Rupiah stablecoin. No FX risk, no mental math. Auto-swap from USDC available.",
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
                    Why Valyra?
                </h2>
                <p className="text-lg text-text-muted max-w-2xl">
                    Our autonomous agents handle the complexity of due diligence and asset
                    transfer so you can trade with absolute confidence.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`flex flex-col gap-4 p-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                    >
                        <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[28px]">
                                {feature.icon}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-text-muted dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
