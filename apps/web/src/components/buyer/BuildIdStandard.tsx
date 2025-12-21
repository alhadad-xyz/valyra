"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function BuildIdStandard() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

    const steps = [
        {
            icon: "javascript",
            title: "1. Code Ingestion",
            description: "Secure upload of GitHub repository and Stripe revenue data for initial processing.",
            badge: null
        },
        {
            icon: "psychology",
            title: "2. AI Audit",
            description: "LLMs scan for critical vulnerabilities, IP theft, and check revenue consistency against code activity.",
            badge: "AUTOMATED"
        },
        {
            icon: "deployed_code",
            title: "3. On-Chain Verification",
            description: "A verified 'Build ID' is minted on Base L2, creating an immutable record of the asset's state.",
            badge: null
        }
    ];

    return (
        <section
            ref={ref as any}
            className={`flex flex-col gap-10 px-4 md:px-10 lg:px-40 py-16 max-w-8xl mx-auto border-t border-gray-200 dark:border-gray-800 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/20 text-black dark:text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Security First
                    </span>
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-[-0.015em]">The Build ID Standard</h2>
                <p className="text-text-muted dark:text-gray-300 text-base font-normal leading-normal max-w-[720px]">
                    Every asset on Valyra goes through a rigorous automated due diligence process before
                    listing. We verify so you don't have to guess. Plus, all purchases include a <strong>10% Transition Hold</strong> to ensure a smooth handover.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-gray-200 via-primary to-gray-200 dark:from-gray-800 dark:via-primary dark:to-gray-800 -z-0"></div>

                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`flex flex-col gap-4 items-start md:items-center text-left md:text-center group z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                        style={{ transitionDelay: `${index * 150}ms` }}
                    >
                        <div className="size-16 rounded-full bg-white dark:bg-[#2c2b18] border-2 border-gray-200 dark:border-gray-800 group-hover:border-primary transition-colors flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-3xl text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                                {step.icon}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-white dark:bg-[#2c2b18] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm w-full md:w-auto h-full">
                            <div className="flex items-center gap-2 md:justify-center">
                                <h3 className="text-lg font-bold leading-tight">{step.title}</h3>
                                {step.badge && (
                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {step.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-text-muted dark:text-gray-400 text-sm">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
