"use client";

import { Button } from "ui";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function BuyerHeroSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

    return (
        <section
            ref={ref as any}
            className={`relative flex flex-col items-center justify-center px-4 md:px-10 lg:px-40 py-12 md:py-20 max-w-8xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="flex flex-col gap-6 md:gap-8 flex-1">
                    <div className="flex flex-col gap-4 text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 w-fit">
                            <span className="material-symbols-outlined text-sm">shopping_bag</span>
                            <span className="text-xs font-bold uppercase tracking-wider">
                                For Buyers
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em]">
                            Buy Micro-Startups with{" "}
                            <span className="relative whitespace-nowrap z-10">
                                Certainty
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary -z-10 opacity-70"></span>
                            </span>
                        </h1>
                        <h2 className="text-lg md:text-xl text-text-muted dark:text-gray-300 max-w-lg leading-relaxed">
                            Valyra uses Base L2, <strong>escrow-secured payments</strong>, and AI to verify revenue and code. Experience
                            the future of autonomous M&A without the risk.
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            size="lg"
                            variant="primary"
                            className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Browse Assets
                        </Button>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="bg-white dark:bg-[#2c2b18] border border-[#e6e6db] dark:border-[#3a3a30]"
                        >
                            How it Works
                        </Button>
                    </div>
                </div>

                {/* Visual Content */}
                <div className="w-full flex-1 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-[#e6e6db] dark:border-[#3a3a30] relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-background-light to-white dark:from-background-dark dark:to-[#2c2b18] opacity-90"></div>

                    {/* Abstract visualization of secure transaction */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-white dark:bg-[#181811] p-6 rounded-xl shadow-lg border border-[#f5f5f0] dark:border-[#3a3a30] max-w-[280px] w-full transform group-hover:scale-105 transition-transform duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                    <span className="material-symbols-outlined">verified_user</span>
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Revenue Verified</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Stripe API • 100% Match</div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full mb-2 overflow-hidden">
                                <div className="h-full bg-primary w-[92%]"></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                                <span>Confidence Score</span>
                                <span>92/100</span>
                            </div>
                        </div>
                    </div>

                    <img
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 pointer-events-none"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTIcd5FQvbRat2cdmyP0ob_IadDGrShdp96BKOga5o0dXfgYFZ-9XO6IdaXiWJ6Q8TkBAgfCwurig2b2MWT0qYUUAJ01IIpVYPKrQaLSXhttw05abqwZO1z2A18J51PGhsozlJYHElUroOWQF6Vqp6mKryemlbk1fHT_8BN-IHr1M8TjfjCLfchnakLd1o3bJ0Clqi3utJPZ3GSf_NIjVWY6uJVCHeNTP8DBj8vVYgY5GaYTzyJO7iUZHllb9nbid_9ZXZrX06Bb08"
                    />
                </div>
            </div>
        </section>
    );
}
