"use client";

import { useMemo } from "react";

import { Button } from "ui";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function DemoListingCTA() {
    const scrollOptions = useMemo(() => ({ threshold: 0.2 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-8 max-w-8xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="relative overflow-hidden rounded-2xl bg-[#181811] text-white p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex flex-col gap-3 relative z-10 max-w-lg text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="material-symbols-outlined text-primary">science</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Sandbox Environment
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black">Not ready to commit?</h2>
                    <p className="text-gray-300 leading-relaxed">
                        Explore a live Demo Listing to see exactly what data points, code analysis, and revenue metrics we provide before you connect your wallet.
                    </p>
                </div>

                <Button
                    size="lg"
                    variant="primary"
                    className="relative z-10 hover:scale-105 transition-transform"
                >
                    View Demo Listing
                </Button>
            </div>
        </section>
    );
}
