"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "ui";
import { ExploreSearchBar } from "@/components/explore/ExploreSearchBar";

export function MarketplaceHeader() {
    return (
        <>
            {/* Top Bar - Support/Docs/Language */}
            <div className="bg-background-light dark:bg-background-dark-elevated border-b border-gray-200 dark:border-gray-700 px-6 py-2">
                <div className="max-w-8xl mx-auto flex items-center justify-end gap-6 text-xs font-medium text-text-muted dark:text-gray-400">
                    <Link href="#" className="hover:text-primary transition-colors">Support</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Docs</Link>
                    <Link href="#" className="hover:text-primary transition-colors h-auto text-xs font-medium text-text-muted dark:text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">language</span>
                        <span>English (US)</span>
                    </Link>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-background-light dark:bg-background-dark-elevated border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-8xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
                    {/* Logo */}
                    <Link href="/app" className="flex items-center gap-3 group">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <span className="material-symbols-outlined filled text-2xl font-bold">token</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-text-main dark:text-white group-hover:text-primary/90 transition-colors">
                            Valyra
                        </h1>
                    </Link>

                    {/* Search Bar - Center */}
                    <div className="flex-1 max-w-2xl hidden md:block">
                        <div className="flex items-center w-full h-12 bg-background-light dark:bg-background-dark rounded-full border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden pl-2">
                            <Button
                                variant="secondary"
                                className="px-4 py-1.5 h-8 bg-background-light dark:bg-background-dark-elevated rounded-full text-xs font-bold text-text-main dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                                rightIcon={<span className="material-symbols-outlined text-[16px]">expand_more</span>}
                            >
                                All Categories
                            </Button>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 placeholder:text-text-muted dark:placeholder:text-gray-500 dark:text-white h-full focus:outline-none"
                                placeholder="Search for micro-startups, SaaS, AI agents..."
                                type="text"
                            />
                            <Button
                                variant="primary"
                                className="size-10 rounded-full mr-1 hover:brightness-95 transition-all p-0 [&>span]:flex [&>span]:items-center [&>span]:justify-center"
                            >
                                <span className="material-symbols-outlined text-white">search</span>
                            </Button>
                        </div>
                    </div>

                    {/* Right Actions - Notifications & Profile */}
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            className="size-10 rounded-full bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-text-main dark:text-gray-300 transition-colors relative !px-3 [&>span]:flex [&>span]:items-center [&>span]:justify-center"
                        >
                            <span className="material-symbols-outlined">visibility</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="size-10 rounded-full bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-text-main dark:text-gray-300 transition-colors relative !px-3 [&>span]:flex [&>span]:items-center [&>span]:justify-center"
                        >
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-background-dark-elevated"></span>
                        </Button>

                        {/* Profile Button - Simulated Connected State */}
                        <Button
                            variant="ghost"
                            className="py-1 bg-background-light dark:bg-background-dark rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 h-auto [&>span]:flex [&>span]:items-center [&>span]:gap-2 !px-3"
                        >
                            <div className="size-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                            {/* Placeholder for user avatar - using div gradient for now or could use img if available */}
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-xs font-bold text-text-main dark:text-white">0x84...9a2</span>
                                <span className="text-[10px] font-medium text-text-muted">Connected</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </header>
        </>
    );
}
