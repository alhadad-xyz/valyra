"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FeaturedHero } from "./FeaturedHero";
import { GenesisProgramCard } from "./GenesisProgramCard";

export function ExploreHeroSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

    return (
        <section ref={ref as any} className="flex flex-col gap-12 px-4 md:px-10 lg:px-40 py-12 max-w-8xl mx-auto w-full">
            {/* Tagline Animation */}
            <div
                className={`text-center max-w-3xl mx-auto space-y-3 transition-all duration-1000 ease-out delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-text-main to-text-muted dark:from-white dark:to-gray-400 leading-tight">
                    Turn Your Micro-Startup Into{" "}
                    <span className="relative whitespace-nowrap z-10 text-text-main dark:text-white">
                        Cash
                        <span className="absolute bottom-1 left-0 w-full h-3 bg-primary -z-10 opacity-70"></span>
                    </span>{" "}
                    in Minutes
                </h1>
                <p className="text-text-muted dark:text-gray-400 text-lg">
                    Autonomous M&A platform on Base L2. Verified listings, AI valuations, and instant settlement.
                </p>
            </div>

            {/* Featured Section Animation */}
            <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[420px] transition-all duration-1000 ease-out delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <div className="lg:col-span-8">
                    <FeaturedHero
                        image="https://lh3.googleusercontent.com/aida-public/AB6AXuDo5K864hu0-5zBXWxJzZdvgtEI5po9g0-Se1LsMowAmfiiNGwbetHD5rNj35d9IOaG7A7_NaBXGjvL46kav1TIr73TTMyoNf_CjkX4bcnByWpAbodVc_WTTzWDPGntQ3oG-krDZUh8etSlBgcpzKmg57Kqj_MWJ61AfkNihxIuIk_SK7zQLCa6zqdpFomHlJCz3PxPrZ7JCqGMJn75_-W-kh1T2kPvkCO3Hj1MDBNoZeewOULbrXc7UiaIDSySd7_NMgU-IJGHh1bj"
                        title="AI Copywriter SaaS"
                        description="Autonomous content engine on Base L2. Build ID verified ✓ Revenue authenticated via Stripe OAuth ✓ Instant liquidity with transparent 2.5% platform fee."
                        mrr="12K IDRX"
                        trustScore={9.8}
                        techStack={["Next.js", "Solidity"]}
                        isCodeVerified={true}
                        verificationLevel="Enhanced"
                    />
                </div>
                <div className="lg:col-span-4">
                    <GenesisProgramCard />
                </div>
            </div>
        </section>
    );
}
