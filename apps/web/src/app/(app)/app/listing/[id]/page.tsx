"use client";

import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { ListingHeader } from "@/components/listing/ListingHeader";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { ListingTabs } from "@/components/listing/ListingTabs";
import { ListingChat } from "@/components/listing/ListingChat";
import { ListingPriceCard } from "@/components/listing/ListingPriceCard";
import { ListingSellerCard } from "@/components/listing/ListingSellerCard";
import { ListingSafetyCard } from "@/components/listing/ListingSafetyCard";

export default function ListingDetailPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <MarketplaceHeader />

            <main className="flex-1 px-4 py-6 md:px-8 lg:px-20 xl:px-40">
                <div className="mx-auto max-w-7xl">
                    <ListingHeader
                        title="Auto-Blogger AI"
                        description="Automated content generation platform on Base L2"
                        breadcrumbs={[
                            { label: "Marketplace", href: "/app" },
                            { label: "SaaS", href: "/app?category=saas" },
                            { label: "Micro-SaaS: Auto-Blogger AI", href: "#" },
                        ]}
                        isVerified={true}
                        isGrowth={true}
                    />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Column (Content) */}
                        <div className="flex flex-col gap-10 lg:col-span-8">
                            <ListingGallery
                                images={[
                                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2370&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=2376&auto=format&fit=crop",
                                ]}
                            />

                            {/* Tabs with Content */}
                            <ListingTabs />

                            {/* Chat Section */}
                            <ListingChat />
                        </div>

                        {/* Right Column (Sticky Actions) */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 flex flex-col gap-6">
                                <ListingPriceCard
                                    price="4.5K IDRX"
                                    usdPrice="≈ 4.5K USD"
                                    lastSold="1.2K IDRX (3 months ago)"
                                />
                                <ListingSellerCard
                                    name="AlexDev_88"
                                    avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuAr0Zfz6-3Hd6SkUvbpJi73oV2bMNezHPMOfVheWPuu8GqXl5g5Zy99MRr6o3Kv2qxg6ec_zbPQJnJSziNZJfjB2ZBDWbUwJVgMo-xoKjGmJSxA_4fv8I6dUqWXFOBpXp-IKOKsBFNazCogZdRHCOWtqOBg0KVUbqkZaIVgvnLHLVYmAJUQCf416ZIM5w8vlNCsLyWC0xd3TCjxnKTVghDy5MahK-E3G2pEorK4d3Bq2qeW7mySUt8q96J53epkHfsoCZDWieuPQcBe"
                                    joinedDate="2023"
                                    responseRate="98%"
                                />
                                <ListingSafetyCard />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
