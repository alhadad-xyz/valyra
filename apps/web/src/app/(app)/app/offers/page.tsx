"use client";

import { useOffers } from "@/hooks/useOffers";
import { OfferList } from "@/components/offers/OfferList";
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Badge } from "ui";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";

export default function OffersPage() {
    const { sent, received, isLoading, stats } = useOffers();
    const [statusFilter, setStatusFilter] = useState<string>("ALL");


    if (isLoading) {
        return (
            <>
                <MarketplaceHeader />
                <div className="max-w-7xl mx-auto px-6 py-10 w-full space-y-10">
                    <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <MarketplaceHeader />
            <main className="max-w-7xl mx-auto px-6 py-10 w-full space-y-10">
                {/* Page Heading */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">My Offers</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">Manage your sent and received marketplace offers</p>
                    </div>
                    <Link href="/app">
                        <Button
                            variant="ghost"
                            size="md"
                            leftIcon={<span className="material-symbols-outlined">explore</span>}
                        >
                            Explore Marketplace
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                            Total Sent
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSent}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                            Total Received
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalReceived}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                            Pending
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                            <span className="size-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                            Accepted
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Filter by status</span>
                            <div className="flex items-center gap-2 relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-sm font-medium text-text-main dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 hover:border-primary transition-colors outline-none cursor-pointer appearance-none pr-8 relative"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    <option value="ALL">All Offers</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="ACCEPTED">Accepted</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="EXPIRED">Expired / Cancelled</option>
                                </select>
                                <span className="material-symbols-outlined text-lg text-gray-400 absolute right-2 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="received" className="w-full">

                        <TabsList>
                            <TabsTrigger value="received" className="flex items-center gap-2">
                                Received
                                <Badge variant="primary" size="sm" className="bg-primary/10 text-primary">
                                    {received.filter(o => statusFilter === 'ALL' || o.status === statusFilter).length}
                                </Badge>

                            </TabsTrigger>
                            <TabsTrigger value="sent" className="flex items-center gap-2">
                                Sent
                                <Badge variant="neutral" size="sm">
                                    {sent.filter(o => statusFilter === 'ALL' || o.status === statusFilter).length}
                                </Badge>

                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="received">
                            <OfferList
                                type="received"
                                offers={received.filter(o => statusFilter === 'ALL' || o.status === statusFilter)}
                            />
                        </TabsContent>

                        <TabsContent value="sent">
                            <OfferList
                                type="sent"
                                offers={sent.filter(o => statusFilter === 'ALL' || o.status === statusFilter)}
                            />
                        </TabsContent>
                    </Tabs>

                </div>
            </main>
            <Footer />
        </>
    );
}
