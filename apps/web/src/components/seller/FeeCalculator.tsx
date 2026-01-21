"use client";

import { Card } from "ui";
import { useState, useMemo } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function FeeCalculator() {
    const [salePrice, setSalePrice] = useState(50000);
    const scrollOptions = useMemo(() => ({ threshold: 0.4 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);

    // Calculate fees
    const brokerFee = salePrice * 0.15;
    const valyraFee = salePrice * 0.025;
    const savings = brokerFee - valyraFee;

    return (
        <section
            ref={ref as any}
            className="px-4 md:px-10 lg:px-40 py-24 max-w-8xl mx-auto"
        >
            <div
                className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <h2 className="text-3xl md:text-5xl font-black mb-4">Calculate your savings</h2>
                <p className="text-text-muted text-lg">
                    See how much more you keep with Valyra compared to traditional brokers.
                </p>
            </div>
            <Card variant="elevated" padding="lg" className="md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="font-bold text-lg">Expected Sale Price</label>
                            <span className="text-2xl font-black text-primary bg-primary/10 px-4 py-1 rounded-lg">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(salePrice)}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1000000"
                            max="1000000000"
                            step="1000000"
                            value={salePrice}
                            onChange={(e) => setSalePrice(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mb-4"
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">2.5% Fee</div>
                    </div>

                    {/* Savings Card */}
                    <div className="rounded-xl p-6 bg-black dark:bg-white text-white dark:text-black flex flex-col justify-center items-center text-center shadow-lg transform md:scale-105">
                        <h4 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-2">
                            You Keep Extra
                        </h4>
                        <div className="font-black text-4xl mb-1">${savings.toLocaleString()}</div>
                        <div className="text-xs opacity-60">
                            That's {((savings / salePrice) * 100).toFixed(1)}% more profit
                        </div>
                    </div>
                </div>
            </Card>
        </section >
    );
}
