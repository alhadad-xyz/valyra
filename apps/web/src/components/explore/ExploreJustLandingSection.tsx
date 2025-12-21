"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ListingCard } from "@/components/listings/ListingCard";

export function ExploreJustLandingSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

    const justLandingListings = [
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXrs4dpCxDg9d2YzTQEWJpWAvaHQ3hIbelXvOGyjlgeUFPF2AClCpMVVez2D7BweyaXhTAyxTYsOAeV50Uzmudvi6CT-cgINxMSeXvJd0wNF_n2NwzXzgskUtwFFqYX4q8mcL8gOY1vjfPA3FArLXYEGn9pT_gjfdzCdpwvVOlcEn8ItJ9CcQHiYnhIOzvPPEvkYP7i-wR-UXAiChb7tvcO7z1xmB6vyhmm-FaT0WtRJZC4RiBQ-v0duShfmPx0h0kq0Eg6C5MYBYQ",
            category: "Productivity",
            title: "TaskFlow Automation",
            description: "Workflow automation tool.",
            askingPrice: "9M IDRX",
            mrr: "13M IDRX",
            aiValue: "9.2M IDRX",
            aiValueStatus: "good" as const,
            trustScore: 94,
            techStack: ["Angular", "Node"],
            isFeatured: true,
            isCodeVerified: true,
            verificationLevel: "Standard" as const,
            platformFee: "225K IDRX",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3NNXIwnxroqpiP3FPbb6TpD9P0RL1HIR7vLET8gy2uCqjKAgtXuQcCnxdDZApcyl9nF2ISPcQYHaA1-JZYuV4tPfvsCCfYu1egueFegwRxx5nIE8z4wF-dYrX1cFA5PBv8GhGhRG5gkGn9SHHbiud5ryiufXpFfd7Jz3xysX_xXS838LKKEGuuG_kPoXOsUFpF7legKXpgeZ2u5SAtLHf0wT6ojK0MHadsNVqgr1k-pKLu1KHOPtNCMipUorzD8pyOLt_LDq1b3ic",
            category: "Design",
            title: "ColorPal AI",
            description: "AI color palette generator.",
            askingPrice: "4.5M IDRX",
            mrr: "4.8M IDRX",
            aiValue: "4.6M IDRX",
            aiValueStatus: "good" as const,
            trustScore: 92,
            techStack: ["Python", "PyTorch"],
            verificationLevel: "Standard" as const,
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLiktnG-n3GV1OHAj07qthpLSqXOvDmHsEcSR6jpQ8CLU_YpN3DPFnAVwOhouKA7dYmK1atDRaMyuXeVYH9-yVbJUB8ouVwF2kGVcx_OmxPmDOcSCMCfmSVKKVASQLYznbtSd_8Z-21RGTOMroTtsYa4D4B9te6EZ28k5I_VLwZxAzkLlwim34V_y3kB7om-9pejq2nBKNnmd850hTtQVtv7uI7S1eG3DjlU3Co1RYcuTIWxDR4tppjzttMy3iNV1BS37_ibOs2u3v",
            category: "Security",
            title: "AuthGuard SDK",
            description: "Authentication security SDK.",
            askingPrice: "25M IDRX",
            mrr: "32M IDRX",
            aiValue: "18M IDRX",
            aiValueStatus: "fair" as const,
            trustScore: 96,
            techStack: ["Rust", "WASM"],
            isCodeVerified: true,
            verificationLevel: "Enhanced" as const,
            platformFee: "625K IDRX",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXihWkHlZFbdLWjoIl_VFVBb25U1fffg4Apv7R3MbHzzebwNTz4F2FShYQ4K4y14oqP5W2HRXL3f9gyZANOkHGAEzJUkEgdRLjA7bMvdpLJxhPkmzyp91X0Nic-o6MrYifQ33CDtGtlb0A2Ji-jR9Vbd7CLjuJXA8fvA9kHFSyc_OTmgLTLWgndO80mZNigzuwXnf0ck_Io0GFHpiT7b7_MHjGdct_LRBiGIeXvywhKd9-Y0FV0_Uu0UYhYjDFw6hqKdrA6CDXyGdJ",
            category: "E-Commerce",
            title: "Shopify Spy",
            description: "E-commerce analytics tool.",
            askingPrice: "11M IDRX",
            mrr: "14M IDRX",
            aiValue: "10.8M IDRX",
            aiValueStatus: "good" as const,
            trustScore: 89,
            techStack: ["Liquid", "JS"],
            verificationLevel: "Basic" as const,
        },
    ];

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-12 max-w-8xl mx-auto w-full border-t border-gray-200 dark:border-gray-800 transition-all duration-1000 ease-out delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-main dark:text-white">Just Landing</h2>
                <a
                    className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1"
                    href="#"
                >
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {justLandingListings.map((listing, index) => (
                    <ListingCard key={index} {...listing} />
                ))}
            </div>
        </section>
    );
}
