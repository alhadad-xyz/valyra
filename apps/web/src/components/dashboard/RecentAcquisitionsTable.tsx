"use client";

import { useOffers } from "@/hooks/useOffers";
import { Button } from "ui";

export function RecentAcquisitionsTable() {
    const { sent, isLoading } = useOffers();

    // Acquisitions are offers I sent that were ACCEPTED
    const acquisitions = sent.filter(offer => offer.status === 'ACCEPTED');

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-lg font-bold text-text-main dark:text-white">Recent Acquisitions</h4>
                <a className="text-sm font-bold text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white" href="/app/acquisitions">View All</a>
            </div>
            <div className="bg-surface dark:bg-background-dark-elevated border border-border dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-light dark:bg-background-dark border-b border-border dark:border-gray-700">
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">Asset Name</th>
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">Acquired Price</th>
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-medium text-text-muted dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                            ) : acquisitions.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center">No recent acquisitions.</td></tr>
                            ) : (
                                acquisitions.map((offer) => (
                                    <tr key={offer.id} className="hover:bg-background-light/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 bg-center bg-cover"></div>
                                                <span className="font-medium text-text-main dark:text-white">{offer.listing_title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-muted dark:text-gray-400">{Number(offer.offer_amount).toLocaleString()} IDRX</td>
                                        <td className="px-6 py-4 text-sm text-text-muted dark:text-gray-400">
                                            {new Date(offer.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="outline" className="h-8 text-xs rounded-full">Manage</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
