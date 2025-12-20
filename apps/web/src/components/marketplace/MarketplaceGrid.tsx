"use client";

import { ListingCard } from "@/components/listings/ListingCard";

export function MarketplaceGrid() {
    // Dummy data matching the template
    const listings = [
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxRyXe8cSoQH1xCEpjELxjtEbul5emIbT48nx64bJABJeiWX4pXk6X05oWqmjM9n6kMbqXWxRaaQbf7YdGP8tZWz-NT43nRDylLOOt28VB-x2BOPdSKyLzvDMgPQTayAVXtKywu5Nbp6iUU4Mb0dle-nWJRrxzaQqVos0h6C8tmqCc--6k4pVG8ZM71Yz5X91V9b6Gmj9i2g6JthfpMq5__2QgK0n4O-0bp5UUWHLPjkXigK8fhTOvjrHIZ_X3Wle2AmJffhseIxQt",
            category: "SaaS • B2B • Analytics",
            title: "SaaS Analytics Platform",
            description: "Detailed analytics for SaaS businesses.",
            askingPrice: "45M IDRX",
            mrr: "50M IDRX",
            aiValue: "High",
            aiValueStatus: "good" as const,
            trustScore: 100,
            techStack: ["React", "Node.js"],
            platformFee: "2.5%",
            isActive: true
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDGRSGjh_SaPNLN7S0m8bDYuc2hPNH7Llw6h8pjGbgaWA98hUQsFR8TeALF_CPUOPli62xkfRyWkPa5gjMsFDBp8zq1PlswOsP0pF34Pzfb1hpmovey4HsEGg691llnHTQe79cHG-IpHE8ZHtVHKSYnKOvfRz5gH0rQNSguqKVcmet0RbOIAxvzyLT9xu6H5yJa2Vtdoe-7NAuuc0A4vXsmyaGULudTzYazZjLOH0_ptegcEKnp_CQXzQduug_zrh_LMGJUlocRYQK",
            category: "AI • SaaS • Content",
            title: "AI Copywriting Tool",
            description: "Generate content with AI.",
            askingPrice: "23M IDRX",
            mrr: "15M IDRX",
            aiValue: "Med",
            aiValueStatus: "fair" as const,
            trustScore: 96,
            techStack: ["Python", "OpenAI"],
            isActive: true
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC99UwjRuhrLms6iYr56rsUjKXFPiHtLS37I_l0ZgkBVwyKOgjPuZfg5fvCoAmR70G7oNKYy9wQJTkzpzlwioQjG3o3vOiS_A0yqQfXfWedJtnoGkgA_LhNVXsq_jCnFDsuF0Ir4UqBLzeE1l1RHh7Q5TG3yPybKwKm-8aZdUBCx3KpBi0ILVCu58ZxSVo8OSeskAkndX_m6vmdYWXNvtWG2Ryauu_M_gxzRWQ7BmgN57WMcvPRaxy9swwGXSF3vrQhXNLe9SBKI0LX",
            category: "App • Finance • iOS",
            title: "Fintech Dashboard UI",
            description: "iOS UI Kit for Fintech.",
            askingPrice: "9M IDRX",
            mrr: "Asset Sale",
            aiValue: "Low",
            aiValueStatus: "warning" as const,
            trustScore: 96,
            techStack: ["Swift", "SwiftUI"],
            isActive: true
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD93ymxVaqoD57pcFaFjqo62J9JCld0CX4dP9mNp6VUh7LlxrnG8-JgfpzV_9lRA5BBT9Bkbn4KYpZBmoUo4H_lYHAnKAAd23jNjysut6Y1q2nFk9HjzOfB_KjEd3fbXmV-6GjPnP3hknmQOh0xyXqDCpPdzKK0Ee-QSDn6ShYIxbvSV4shQlZWZTmE8ags2LrJhRzDBbmS6H8nTHtVTWCPLVZxpqfGgNUeUskbE18LDLv9sUrGxtE9p5hAcJPxQK00co2rQErgdpNA",
            category: "Content • Affiliate • SEO",
            title: "Tech Review Blog",
            description: "High traffic tech blog.",
            askingPrice: "35M IDRX",
            mrr: "40% Margin",
            aiValue: "High",
            aiValueStatus: "good" as const,
            trustScore: 94,
            techStack: ["WordPress", "PHP"],
            isActive: true,
            isFeatured: true
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9R0TCu7q_hsMFCo41qGmVQ2Xx3WpoWIv7FiHv2IfZ3LRHkhWkia62t4VH9ASXWdbUSqNoA21nD4AasTKnp_xJdPnmJ5VTLOVdfmfUE6wd-HBT6qr0FSTgZyIoJZs9e9iUuT7I3HydX6agDrV9TUVtuAnoFiYMT-Zk1x3OvfuQvMEpOVbBOF7gJ-rSpbRTk_WXBLar1kTMFKSfDjee4PnJSsDw1h9hTWyPbEKTvhzfXPR-C4Si7G0ccXaUrMo9ipi4BS-saNyQ_tzO",
            category: "SaaS • B2B • HR",
            title: "HR Management SaaS",
            description: "Manage employees efficiently.",
            askingPrice: "92M IDRX",
            mrr: "High Growth",
            aiValue: "High",
            aiValueStatus: "good" as const,
            trustScore: 98,
            techStack: ["React", "Laravel"],
            isActive: true
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWttil32PkFqx9POFlhU6h-765BcF3ZcIDRx5BpaJRDgZ4ice-oxgLsbsssj-r-vmNS7VCocP83coZwjvwbIB4wD0MrcOvrrcS2Q0KL5LOUr9WGfIZQBnTPddgoQuyi7MoxbehwN8lsMjSowyHfIb5DON6yn0-6AdImOdOCWIDrrtyn9IWDnuU_FZm9iwXPyP612o5aAqCkRdhvJd_-0uF0IMQ3rOUBHRyFlCxP3YLwlzVbcJaHToud7gcvCXVyCj_l6x38Bd0jOuN",
            category: "App • Video • Subscription",
            title: "Niche Streaming Service",
            description: "Video streaming platform for niche content.",
            askingPrice: "6M IDRX",
            mrr: "Pre-revenue",
            aiValue: "Med",
            aiValueStatus: "fair" as const,
            trustScore: 90,
            techStack: ["Flutter", "Firebase"],
            isActive: true
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXYTxuR7t1WEdm9aCND57WpufUvnsEvT4t8zZpt_uWp0g6NxAHGQ4r5xmj6EoSlTHJP0yOAsdeCdwF3gClUKC15ARPq-txRN8DUnekm8X2wKCIkulME8ZdAsD_qk0MYQOfDX2DgrpCChxBIKxIO2f8x9u15PGtZh-KaFJsF4Gs9TSJsUfnbXY1OjASptPwgkaH5cSnymy9fyIJujgJave2P29BFuT_2AyGBGp_j8HaZEFIvDlPIBVOb-hrLz7i6-KHC1HJhwgfwnPV",
            category: "SaaS • Vertical • B2B",
            title: "Automotive CRM",
            description: "CRM for car dealerships.",
            askingPrice: "7M IDRX",
            mrr: "Churn < 2%",
            aiValue: "High",
            aiValueStatus: "good" as const,
            trustScore: 96,
            techStack: ["Vue", "Django"],
            isActive: true
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9sjrxgoWm7aYe-MXbaHdk-mFj9h0ZER0_4PTrJD-x6pSh6WVa1vYawtJjRZj6NV1Q3JGppn-LSCNgCAxq95hOCBDd8a1fP8ONbkCaawnXf03BH_0onubwK8GGUQwksugnk7bA8SgT8ahWwk1HOi3QtJ0uzNG7MyGWXLEsXQj3gkTEKITbBUYdyEM3YacwVQzlsRZD6Y-u3zgOSiizcrV02BF11j0VYisbyIQe394j9LAzYa0fqRGZTe96xJEtY70jey3ksIRKWUGc",
            category: "SaaS • Productivity",
            title: "Remote Work Toolkit",
            description: "Tools for remote teams.",
            askingPrice: "45M IDRX",
            mrr: "50M IDRX",
            aiValue: "High",
            aiValueStatus: "good" as const,
            trustScore: 98,
            techStack: ["React", "Express"],
            isActive: true
        }
    ];

    return (
        <section className="flex-1 min-w-0">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-text-main dark:text-white">
                        1 - 16 over 7,000 results for <span className="text-primary">"SaaS"</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted dark:text-gray-400">Sort by:</span>
                        <div className="relative group">
                            <button className="flex items-center gap-2 text-sm font-medium text-text-main dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 hover:border-primary transition-colors">
                                Best Match
                                <span className="material-symbols-outlined text-lg text-gray-400">expand_more</span>
                            </button>
                        </div>
                    </div>
                    <button className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                        <span className="material-symbols-outlined text-xl">grid_view</span>
                    </button>
                </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                {["Profitable", "Verified Traffic", "Under 1.5M IDRX", "MRR > 15M IDRX"].map((tag, idx) => (
                    <button
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-text-muted dark:text-gray-300 hover:border-primary group transition-all"
                    >
                        {tag}
                        <span className="material-symbols-outlined text-gray-400 text-sm group-hover:text-primary">close</span>
                    </button>
                ))}
                <button className="text-primary text-xs font-medium ml-2 hover:underline">Clear All Filters</button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((item, idx) => (
                    <ListingCard key={idx} {...item} />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12 mb-8">
                <nav className="flex items-center gap-2">
                    <button className="size-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white font-medium text-sm shadow-md">1</button>
                    <button className="size-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium text-sm transition-colors">2</button>
                    <button className="size-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium text-sm transition-colors">3</button>
                    <span className="text-gray-400">...</span>
                    <button className="size-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium text-sm transition-colors">10</button>
                    <button className="size-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </nav>
            </div>
        </section>
    );
}
