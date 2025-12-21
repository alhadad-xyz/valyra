"use client";

import { Button } from "ui";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function GenesisProgramCTA() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-8 max-w-8xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="relative overflow-hidden rounded-2xl bg-[#181811] text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0052FF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                <div className="flex flex-col gap-6 relative z-10 max-w-2xl text-center md:text-left">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="material-symbols-outlined text-primary">diamond</span>
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                Genesis Program
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black leading-tight">
                            Founders Deserve Better.<br className="hidden md:block" />
                            <span className="text-primary">Join the Genesis Cohort.</span>
                        </h2>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            We are selecting 50 high-quality micro-startups for our launch. Genesis sellers receive{" "}
                            <span className="text-white font-bold">Free Listing (No Stake Required)</span>, boosted
                            visibility, and exclusive Early Adopter Reputation badges.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 relative z-10 min-w-max">
                    <Button
                        size="lg"
                        variant="primary"
                        leftIcon={<span className="material-symbols-outlined">wallet</span>}
                        className="hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,82,255,0.4)]"
                    >
                        Check Eligibility
                    </Button>
                    <p className="text-xs text-gray-500">Connect wallet to check status</p>
                </div>
            </div>
        </section>
    );
}
