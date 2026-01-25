"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
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

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { status } = useAccount();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isRedirectable, setIsRedirectable] = useState(false);

    useEffect(() => {
        // If user is disconnected, we allow a future redirect upon connection
        if (status === 'disconnected') {
            setIsRedirectable(true);
        }
    }, [status]);

    useEffect(() => {
        // Only redirect if we were previously disconnected (isRedirectable) and are now connected
        // This prevents redirecting when the wallet auto-connects on page load (status goes reconnecting -> connected)
        if (status === 'connected' && isRedirectable) {
            router.push('/app');
            setIsRedirectable(false); // Reset flag after redirect to prevent repeated redirects
        }
    }, [status, isRedirectable, router]);

    // Define navigation items with their paths
    const navItems = [
        { label: "Explore", href: "/explore" },
        { label: "Seller", href: "/seller" },
        { label: "Buyer", href: "/buyer" },
        { label: "Learn", href: "/learn" },
    ];

    // Detect scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`sticky z-50 w-full transition-all duration-300 ${isScrolled ? "top-4" : "top-0"}`}>
            <header
                className={`transition-all duration-300 ${isScrolled
                    ? "mx-4 md:mx-10 lg:mx-40 rounded-full border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg shadow-lg"
                    : "border-b border-transparent bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md"
                    }`}
            >
                <div className="px-4 md:px-10 py-4 flex items-center justify-between max-w-8xl mx-auto">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-4 text-text-main dark:text-white hover:opacity-80 transition-opacity">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-black">
                            <span className="material-symbols-outlined filled text-2xl text-white font-bold">
                                token
                            </span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight">
                            Valyra
                        </h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-8">
                        <div className="flex items-center gap-8">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        className="relative text-sm font-medium transition-colors group"
                                        href={item.href}
                                    >
                                        <span className="relative z-10">{item.label}</span>
                                        <span
                                            className={`absolute bottom-0 left-0 h-2 bg-primary-light transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"
                                                }`}
                                        ></span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex justify-end relative">
                            <Wallet>
                                <ConnectWallet
                                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-bold flex items-center gap-2"
                                />
                                <WalletDropdown>
                                    <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                        <Avatar />
                                        <Name />
                                        <Address />
                                        <EthBalance />
                                    </Identity>
                                    <WalletDropdownLink
                                        icon="dashboard"
                                        href="/app"
                                    >
                                        Dashboard
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
                                        My Purchases
                                    </WalletDropdownLink>
                                    <WalletDropdownLink
                                        icon="description"
                                        href="/app/offers"
                                    >
                                        My Offers
                                    </WalletDropdownLink>
                                    <WalletDropdownLink
                                        icon="receipt_long"
                                        href="/app/transactions"
                                    >
                                        Transactions
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

                    {/* Mobile Menu Icon */}
                    <button className="md:hidden p-2 text-text-main dark:text-white">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </header >
        </div >
    );
}

