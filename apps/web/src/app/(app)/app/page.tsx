"use client";

import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";
import { MarketplaceSidebar } from "@/components/marketplace/MarketplaceSidebar";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";

export default function MarketplacePage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />

            {/* Categories Row - recreating the template's secondary nav */}
            <div className="bg-background-light dark:bg-background-dark-elevated border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-8xl mx-auto px-6 py-3 flex items-center gap-8 overflow-x-auto no-scrollbar">
                    <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:brightness-105 transition-all whitespace-nowrap shadow-sm shadow-primary/20">
                        <span className="material-symbols-outlined">grid_view</span>
                        Browse Categories
                    </button>
                    <nav className="flex items-center gap-6">
                        <a className="relative text-sm font-medium transition-colors group whitespace-nowrap" href="#">
                            <span className="relative z-10 font-bold">SaaS</span>
                            <span className="absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out w-full"></span>
                        </a>
                        <a className="relative text-sm font-medium transition-colors group whitespace-nowrap" href="#">
                            <span className="relative z-10 font-bold">E-commerce</span>
                            <span className="absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                        </a>
                        <a className="relative text-sm font-medium transition-colors group whitespace-nowrap" href="#">
                            <span className="relative z-10 font-bold">Content</span>
                            <span className="absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                        </a>
                        <a className="relative text-sm font-medium transition-colors group whitespace-nowrap" href="#">
                            <span className="relative z-10 font-bold">Communities</span>
                            <span className="absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                        </a>
                        {/* Special Programs */}
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <a className="relative text-sm font-medium transition-colors group whitespace-nowrap flex items-center gap-1 text-primary hover:text-primary-dark" href="#">
                            <span className="material-symbols-outlined text-[16px] filled">verified</span>
                            <span className="relative z-10 font-bold">Genesis Listings</span>
                            <span className="absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                        </a>
                        <a className="relative text-sm font-medium transition-colors group whitespace-nowrap" href="#">
                            <span className="relative z-10 font-bold">High MRR</span>
                            <span className="absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                        </a>
                        <a className="relative text-sm font-medium transition-colors group whitespace-nowrap" href="#">
                            <span className="relative z-10 font-bold">Under $5k</span>
                            <span className="absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out w-0 group-hover:w-full"></span>
                        </a>
                    </nav>
                </div>
            </div>

            <main className="flex-1 max-w-8xl mx-auto w-full px-4 lg:px-6 py-8 flex gap-8">
                <MarketplaceSidebar />
                <MarketplaceGrid />
            </main>

            <Footer />
        </div>
    );
}
