"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Button } from "ui";
import { ExploreSearchBar } from "@/components/explore/ExploreSearchBar";
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
    WalletDropdownLink
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';
import { GenesisBadge } from "@/components/marketplace/GenesisBadge";

export function MarketplaceHeader() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    // Sync input with URL
    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        if (searchQuery.trim()) {
            params.set('search', searchQuery.trim());
        } else {
            params.delete('search');
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

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
                        <form onSubmit={handleSearch} className="flex items-center w-full h-12 bg-background-light dark:bg-background-dark rounded-full border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                            <span className="material-symbols-outlined text-text-muted dark:text-gray-500 ml-4">search</span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 placeholder:text-text-muted dark:placeholder:text-gray-500 dark:text-white h-full focus:outline-none"
                                placeholder="Search for micro-startups, SaaS, AI agents..."
                                type="text"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                className="size-10 rounded-full mr-1 hover:brightness-95 transition-all p-0 [&>span]:flex [&>span]:items-center [&>span]:justify-center"
                            >
                                <span className="material-symbols-outlined text-white">arrow_forward</span>
                            </Button>
                        </form>
                    </div>

                    {/* Right Actions - Notifications & Profile */}
                    <div className="flex items-center gap-3">
                        <GenesisBadge />

                        {/* Wallet with Dropdown */}
                        <Wallet>
                            <ConnectWallet className="py-1 bg-background-light dark:bg-background-dark rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600 h-auto flex items-center gap-2 px-3">
                                <Avatar className="size-8" />
                                <Name className="text-xs font-bold" />
                            </ConnectWallet>
                            <WalletDropdown>
                                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                    <Avatar />
                                    <Name />
                                    <Address />
                                    <EthBalance />
                                </Identity>
                                <WalletDropdownLink
                                    icon="dashboard"
                                    href="/app/dashboard"
                                >
                                    Overview
                                </WalletDropdownLink>
                                <WalletDropdownLink
                                    icon="storefront"
                                    href="/app/listings"
                                >
                                    My Listings
                                </WalletDropdownLink>
                                <WalletDropdownLink
                                    icon="shopping_bag"
                                    href="/buyer/purchases"
                                >
                                    My Acquisition
                                </WalletDropdownLink>
                                <WalletDropdownLink
                                    icon="description"
                                    href="/app/offers"
                                >
                                    My Offers
                                </WalletDropdownLink>
                                <WalletDropdownLink
                                    icon="settings"
                                    href="/app/settings"
                                >
                                    Settings
                                </WalletDropdownLink>
                                <WalletDropdownDisconnect />
                            </WalletDropdown>
                        </Wallet>
                    </div>
                </div>
            </header>
        </>
    );
}
