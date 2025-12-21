"use client";

import { Button } from "ui";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function SellerHeroSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 1 });

    return (
        <section
            ref={ref as any}
            className={`relative flex flex-col items-center justify-center px-4 md:px-10 lg:px-40 py-12 md:py-20 max-w-8xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="flex flex-col gap-6 md:gap-8 order-2 lg:order-1">
                    <div className="flex flex-col gap-4 text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 w-fit">
                            <span className="material-symbols-outlined text-sm">sell</span>
                            <span className="text-xs font-bold uppercase tracking-wider">
                                For Sellers
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                            Sell your micro-startup{" "}
                            <span className="relative whitespace-nowrap z-10">
                                autonomously
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary -z-10 opacity-70"></span>
                            </span>
                            .
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg md:text-xl text-text-muted dark:text-gray-300 max-w-lg leading-relaxed">
                            Skip the brokers. Valyra uses AI valuation and smart contracts to settle sales
                            instantly on Base L2. 0% listing fees for early adopters.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            size="lg"
                            variant="primary"
                            rightIcon={<span className="material-symbols-outlined text-sm">arrow_forward</span>}
                        >
                            Start Selling
                        </Button>
                        <Button size="lg" variant="secondary">
                            How it works
                        </Button>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="order-1 lg:order-2 w-full aspect-square md:aspect-video lg:aspect-square relative rounded-xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2ZQp9WpBJrgKGRUzyQkuuAObvuL00K-cJtR2w4aekc99FpwKY0p2FTWLgLM8wNvxUcVVXjAgfRPriSM9SXT2nG4m30Yx_-5x_wLGBKxEZYzfGwEg0bYzfBD6TuIzvvLTMO9nZ0cQ1ZDjFvOoHPfTtU-ym2eQiYfkTZ4oUzDyHKDC6CyAzLson2yec3neOrQLFMZoyJ3_A3ipzh_pXXRaHJZPk_peLbv4F-Jaaia-GHMM02pSGiPkSCjjkvhyC8cqIHW49oLKI_DkA')",
                        }}
                    ></div>
                    {/* Floating Card */}
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Latest Sale
                            </span>
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Settled
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">SaaS Analytics Tool</h3>
                                <p className="text-sm text-gray-500">Acquired in 3 days</p>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-xl">$45,000</div>
                                <div className="text-xs text-gray-400">USDC</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
