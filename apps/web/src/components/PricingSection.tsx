"use client";

import { Button } from "ui";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function PricingSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.4 });

    return (
        <section
            ref={ref as any}
            className="px-4 md:px-10 lg:px-40 py-24 max-w-8xl mx-auto"
        >
            <div
                className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <h2 className="text-3xl md:text-5xl font-black mb-4">
                    Choose Your Access
                </h2>
                <p className="text-text-muted text-lg">
                    Start trading today or become a Genesis member for exclusive perks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Standard Card */}
                <div
                    className={`flex flex-col p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full relative overflow-hidden group hover:border-gray-300 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                    style={{ transitionDelay: "0ms" }}
                >
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2">Standard</h3>
                        <p className="text-text-muted">For indie hackers and micro-investors</p>
                    </div>

                    <div className="mb-8">
                        <span className="text-4xl font-black">Free to list</span>
                        <p className="text-sm text-text-muted mt-2">2.5% fee only when you sell</p>
                    </div>

                    <ul className="flex flex-col gap-4 mb-8 flex-1">
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">
                                check
                            </span>
                            <span>Free Listing (no upfront cost)</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">
                                check
                            </span>
                            <span>2.5% Platform Success Fee</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">
                                check
                            </span>
                            <span>Smart Contract Escrow</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">
                                check
                            </span>
                            <span>AI Valuation & Due Diligence</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-green-500">
                                check
                            </span>
                            <span>Secure Credential Handover</span>
                        </li>
                    </ul>

                    <Button variant="secondary" size="lg" fullWidth>
                        Get Started
                    </Button>
                </div>

                {/* Genesis Card */}
                <div
                    className={`flex flex-col p-8 rounded-xl bg-primary text-white h-full relative overflow-hidden shadow-xl transform md:-translate-y-4 md:hover:-translate-y-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                    style={{ transitionDelay: "150ms" }}
                >
                    <div className="absolute top-0 right-0 bg-black text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                        LIMITED
                    </div>

                    <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-2">Genesis Seller</h3>
                        <p className="opacity-80">First 50 verified sellers only</p>
                    </div>

                    <div className="mb-8">
                        <span className="text-4xl font-black">Free</span>
                        <p className="text-sm opacity-80 mt-2">No staking requirement</p>
                    </div>

                    <ul className="flex flex-col gap-4 mb-8 flex-1">
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="font-medium">Zero Upfront Cost</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="font-medium">Skip $50 Seller Stake</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="font-medium">Full Platform Access</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="font-medium">Early Adopter Badge</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="font-medium">Limited Availability</span>
                        </li>
                    </ul>

                    <Button variant="secondary" size="lg" fullWidth className="bg-white text-primary hover:bg-gray-100">
                        Become Genesis Seller
                    </Button>
                </div>
            </div>
        </section>
    );
}
