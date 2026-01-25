"use client";

import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ActiveListingsTable } from "@/components/dashboard/ActiveListingsTable";
import { RecentAcquisitionsTable } from "@/components/dashboard/RecentAcquisitionsTable";
import { IncomingOffersList } from "@/components/dashboard/IncomingOffersList";
import { MyBidsList } from "@/components/dashboard/MyBidsList";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col font-display">
            <MarketplaceHeader />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-[1120px] mx-auto space-y-8 pb-10">
                        {/* Welcome & Key Action */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-bold text-text-main dark:text-white">Overview</h3>
                                <p className="text-text-muted dark:text-gray-400 mt-1">Manage your autonomous agents and marketplace activity.</p>
                            </div>
                            <button className="text-text-muted dark:text-gray-400 text-sm flex items-center gap-1 hover:text-text-main dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-[18px]">key</span>
                                Recover Encryption Key
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <DashboardStats />

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Left Column (Listings & Acquisitions) */}
                            <div className="xl:col-span-2 space-y-8">
                                <ActiveListingsTable />
                                <RecentAcquisitionsTable />
                            </div>

                            {/* Right Column (Offers) */}
                            <div className="flex flex-col gap-8">
                                <IncomingOffersList />
                                <MyBidsList />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
