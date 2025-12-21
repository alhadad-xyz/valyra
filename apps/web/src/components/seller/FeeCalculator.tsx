"use client";

import { Card } from "ui";
import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function FeeCalculator() {
    const [salePrice, setSalePrice] = useState(50000);
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.4 });

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
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <label className="font-bold text-lg">Expected Sale Price</label>
                        <span className="text-2xl font-black text-primary bg-primary/10 px-4 py-1 rounded-lg">
                            ${salePrice.toLocaleString()}
                        </span>
                    </div>
                    <input
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        max="250000"
                        min="5000"
                        step="5000"
                        type="range"
                        value={salePrice}
                        onChange={(e) => setSalePrice(Number(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                        <span>$5k</span>
                        <span>$250k</span>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Broker Card */}
                    <div className="rounded-xl p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex flex-col justify-between">
                        <div>
                            <h4 className="text-gray-500 dark:text-red-300 text-sm font-semibold uppercase tracking-wider mb-2">
                                Traditional Broker
                            </h4>
                            <div className="text-red-500 dark:text-red-400 font-bold text-2xl mb-1">
                                ${brokerFee.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">15% Fee</div>
                        </div>
                    </div>

                    {/* Valyra Card */}
                    <div className="rounded-xl p-6 bg-primary/10 border border-primary/20 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-16 bg-primary/20 rounded-bl-full -mr-8 -mt-8"></div>
                        <div>
                            <h4 className="text-gray-700 dark:text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2">
                                Valyra
                            </h4>
                            <div className="text-text-main dark:text-white font-bold text-2xl mb-1">
                                ${valyraFee.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">2.5% Fee</div>
                        </div>
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
        </section>
    );
}
