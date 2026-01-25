"use client";

import { useMemo } from "react";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function TrustBar() {
    const scrollOptions = useMemo(() => ({ threshold: 1 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);

    return (
        <section
            ref={ref as any}
            className={`py-10 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark/50 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            <div className="px-4 md:px-10 lg:px-40 max-w-8xl mx-auto flex flex-col gap-6 items-center">
                <p className="text-sm font-bold uppercase tracking-widest text-text-muted">
                    Built for Indonesian indie hackers • Trade in IDRX • Settle on Base
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-xl font-black text-gray-400 font-display">
                        BASE
                    </span>
                    <span className="text-xl font-black text-gray-400 font-display">
                        COINBASE
                    </span>
                    <span className="text-xl font-black text-gray-400 font-display">
                        OPTIMISM
                    </span>
                    <span className="text-xl font-black text-gray-400 font-display">
                        ETHEREUM
                    </span>
                    <span className="text-xl font-black text-gray-400 font-display">
                        SOLIDITY
                    </span>
                </div>
            </div>
        </section>
    );
}
