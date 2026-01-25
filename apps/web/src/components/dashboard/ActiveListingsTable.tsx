"use client";

import { useMyListings } from "@/hooks/useListings";
import { Button } from "ui";

export function ActiveListingsTable() {
    const { data: listings, isLoading } = useMyListings();

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-lg font-bold text-text-main dark:text-white">Active Listings</h4>
                <a className="text-sm font-bold text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white" href="/app/listings">View All</a>
            </div>
            <div className="bg-surface dark:bg-background-dark-elevated border border-border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-light dark:bg-background-dark border-b border-border dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">Startup Name</th>
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider text-right">Agent Health</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                            ) : listings?.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center">No active listings found.</td></tr>
                            ) : listings?.map((listing: any) => (
                                <tr key={listing.id} className="hover:bg-background-light/50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 bg-center bg-cover" ></div>
                                            <span className="font-medium text-text-main dark:text-white">{listing.asset_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-muted dark:text-gray-400">{Number(listing.asking_price).toLocaleString()} IDRX</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface dark:bg-background-dark border border-border dark:border-gray-600 text-xs font-bold text-text-main dark:text-white hover:bg-background-light dark:hover:bg-gray-700 transition-colors group">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                            </span>
                                            Heartbeat
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
