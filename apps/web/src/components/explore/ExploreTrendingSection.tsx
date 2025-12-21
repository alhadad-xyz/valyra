"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ListingCard } from "@/components/listings/ListingCard";

export function ExploreTrendingSection() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

    const trendingListings = [
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAM6KP51vPE_m9AnYlupBlHCbgo6_wkc2VQNZc0s-8Wgw0iwvAYr6bhh-QwxEeDrPMJXrtrGnyMzGU3me2c9VKlHWT-IuMsqxweekZn5lZmopi3zNTYtWlVxwde72F17dmPLXCjn34BKYYNiY4fm711atuCzf84jK0o5dJgYBnPHy4mMSObdE4FxbFgbQTmVNfX3B5hYH_8TYunDcR5i6G0WNJgay0egy4oMbsa4YBjksDIUCscjnM95ilX73kZsDgt-4vG5v4Mb4CC",
            category: "SAAS",
            title: "RankTracker.io",
            description: "Automated revenue attribution for Stripe connect accounts. Zero maintenance required.",
            askingPrice: "12.5M IDRX",
            mrr: "13M IDRX",
            aiValue: "9.5M IDRX",
            aiValueStatus: "fair" as const,
            trustScore: 95,
            techStack: ["Vue", "Firebase"],
            isCodeVerified: true,
            verificationLevel: "Standard" as const,
            sellerActivity: "Active 2h ago",
            platformFee: "312K IDRX",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWkYF67wZi78BAxHuE6u-8BaBwKXOiYv_ZIzEDqiMr5FXPrGjownoUa1UfNvaZLWXKaoK5h1Zgj-F_h3pwgk1v8K2R8sVOMbl97ba3MProASlZ_Wj8Z5o816qkL1Lzxe4r7KCVwbDurPDRDLctxWo_ZiH0KRFz7__gwDINOFb-4wov4Au73iRYFW8RykepnkwYIEWbQSBO1-c2tVbzBFDX92qTQiS9iRRwPiVQ61mXOXPAl-2_5TJ1Cr5Tuttu3Acp51Y55gqkA8mG",
            category: "SOCIAL",
            title: "InstaGrow",
            description: "Social media growth automation tool.",
            askingPrice: "5M IDRX",
            mrr: "6M IDRX",
            aiValue: "5.2M IDRX",
            aiValueStatus: "good" as const,
            trustScore: 88,
            techStack: ["React Native"],
            verificationLevel: "Basic" as const,
            sellerActivity: "Active 1d ago",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOltjvtmF0io8pwLZdS0hD7ozolVh0xlekBH6jvP1XOvZNyHcxudEsEZLNP5BflRWzoOVwnGOn3G8qgMhGIJs1GX0fnj-RyFFrSbi6jdtY-NSWlk2LODmpra1kU3ofTyjlvrXyRINt0p_Nj132fV--U1eTx3Y6rsnt4eDU6dw65USREHNrUuQZOM0kUE3di4K2fy7ZGls8Z85XXVPbmKZjMLZ9U_5CvH0NQUeBFEr5P6xvL7m7KesJv4nVY5DdUEhRA7yrw8lIZ3zg",
            category: "DEFI",
            title: "CoinSwap UI",
            description: "DeFi swap interface.",
            askingPrice: "22M IDRX",
            mrr: "18M IDRX",
            aiValue: "18M IDRX",
            aiValueStatus: "fair" as const,
            trustScore: 76,
            techStack: ["Solidity", "Web3.js"],
            isCodeVerified: true,
            verificationLevel: "Standard" as const,
            platformFee: "550K IDRX",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTovMk00iseZ_GwtmG-4r3WIIjo860-4bpc4pPaGEhaOIl1qP-6e-70iqTA0kNrviQ5lLdHMrM2dYcBEnJLOj7H-WzPEo73rs4uSPsXURSohmoINwRC55aQcrD3ptOWe2kT1wLPc35WDvyH2bM3DjS_77yiZBe33dIKIijjgzZPfT-7q_5eGFH5EQ2INmaehcZtlhARb0Fp88PwGJfnGalT9QACPk5BSlD22pM-S_bogC1TLbe49_0i-HZ5hf5kJwrG3dkoGphTkbl",
            category: "DEVTOOL",
            title: "GitFlow Pro",
            description: "Git workflow automation.",
            askingPrice: "8M IDRX",
            mrr: "9M IDRX",
            aiValue: "8.1M IDRX",
            aiValueStatus: "good" as const,
            trustScore: 92,
            techStack: ["Go", "Docker"],
            isCodeVerified: true,
            verificationLevel: "Enhanced" as const,
            sellerActivity: "Active 5m ago",
            platformFee: "200K IDRX",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTH7H3QgvdguHATMFUpWmgT4e43xbXyTSpbFn81EOkRnwjwbTbXgl85Kp7oMl4rtR-GXElalLg8UBW1_0hcLKkWYU-epVoeYVr_kXztRLTmVTdZU_eNGABXcSrc4_mzkXxKccy0QrWZrV210ReH5C5bpTv3mHsixhysE6ctE-KqKbBxpzHiqznYr8srscPj8rDjl3zIbH_V-ziNpL6qqA4-hloIFoWtGCmf3dTp5ZK61CYpImCnDhsblG9LyetH7s1y47mdPVRd0xB",
            category: "CONTENT",
            title: "BlogFast AI",
            description: "AI-powered blog content generator.",
            askingPrice: "18M IDRX",
            mrr: "27M IDRX",
            aiValue: "18.5M IDRX",
            aiValueStatus: "good" as const,
            trustScore: 98,
            techStack: ["Python", "GPT-4"],
            isCodeVerified: true,
            verificationLevel: "Enhanced" as const,
            sellerActivity: "Active just now",
            platformFee: "450K IDRX",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKsPYbdXz7bx6uYVQgRVccIjutNJ8iGFwFxKrVF1p8j4ipoOTnMS_7E_5CHD1wIeempG9PDhRLYF1hfncxn_kW0YJoSQo0wBF1fHPvOX2VLTjvL57mMlSvA6Dzd6BVLvQG0iBlCct2aW3O9pdgqYZxZ3TgIZ2cAgGYtC0zNqzVub4N1_8ZqILWWGz5N9WhAxSnrSMkPqhb2ez5iP24JpLycFormq3b5sVO_Fm4xT3m7N8J2z7wSbe5xeYrQSCNk3qlaMxhvLzV4ze1",
            category: "FINANCE",
            title: "BudgetBuddy",
            description: "Personal finance management app.",
            askingPrice: "3M IDRX",
            mrr: "2.2M IDRX",
            aiValue: "3.1M IDRX",
            aiValueStatus: "good" as const,
            trustScore: 90,
            techStack: ["Flutter"],
            verificationLevel: "Basic" as const,
        }
    ];

    const largeFeaturedListing = {
        category: "FinTech",
        title: "PayFlow Analytics",
        description: "Automated revenue attribution for Stripe connect accounts. Zero maintenance required.",
        askingPrice: "45M IDRX",
        mrr: "50M IDRX",
        aiValue: "46.5M IDRX",
        aiValueStatus: "good" as const,
        trustScore: 99,
        techStack: ["React", "Node.js", "Stripe"],
        isCodeVerified: true,
        verificationLevel: "Enhanced" as const,
        sellerActivity: "Active 12m ago",
        platformFee: "1.125M IDRX",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-OccPAZ2lKWRdSLUD5bqMCz5AivB_Pb4cXEjXklOjiNhT93WM7OVBR-MXeK2TbNHQCMdS11KaVO6zAA5khjp7v374J5h-h_tOTGeq255DWOSA5wO1SarORpizOGSSypbY-2slkTwjn6TrGjttnae2xaSC79bHzVP-oeGetX1tHWRnR_d3_unAha_5J_ljAhBSCrsLtIT5qCbFlkpe_4tRe7TI7pRTtRQU-MWU_HHIm1X2SvkA3g5wfWOiAcgJORDsgtCR8-ahH_OG",
    };

    return (
        <section
            ref={ref as any}
            className={`px-4 md:px-10 lg:px-40 py-12 max-w-8xl mx-auto w-full border-t border-gray-200 dark:border-gray-800 transition-all duration-1000 ease-out delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white">Trending on Valyra</h2>
                    <p className="text-text-muted dark:text-gray-400 mt-1">
                        Top performing micro-startups by view count and bid activity.
                    </p>
                </div>
                <a
                    className="text-sm font-bold text-primary hover:text-primary-light flex items-center gap-1"
                    href="#"
                >
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <ListingCard
                        {...largeFeaturedListing}
                        size="large"
                        isFeatured
                    />
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingListings.map((listing, index) => (
                        <ListingCard key={index} {...listing} />
                    ))}
                </div>
            </div>
        </section>
    );
}
