"use client";

import { Button } from "ui";
import { format } from "date-fns";

interface Step5ReleasedProps {
    escrowId: string;
    userRole: 'buyer' | 'seller' | 'viewer';
    escrow?: any;
}

export function Step5Released({ escrowId, userRole, escrow }: Step5ReleasedProps) {
    const totalAmount = Number(escrow?.amount || 0);
    const sellerPayout = Number(escrow?.sellerPayout || 0);
    const completedAt = escrow?.updatedAt || Date.now() / 1000; // Fallback to now if not tracked, but usually status change updates timestamp

    // Formatting helper
    const fmt = (val: number) => (val / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col items-center text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                        <span className="material-symbols-outlined text-[40px]">celebration</span>
                    </div>

                    <h3 className="text-2xl font-black text-text-main dark:text-white mb-2">Transaction Complete!</h3>
                    <p className="text-text-muted mb-8 max-w-md">
                        Funds have been successfully released to the seller. Ownership of assets has been transferred.
                    </p>

                    <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-8 text-left">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-sm font-bold text-text-main dark:text-white">Settlement Details</span>
                            <span className="text-xs text-green-600 flex items-center gap-1 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Success
                            </span>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Total Released</span>
                                <span className="font-bold text-text-main dark:text-white">{fmt(sellerPayout || totalAmount)} IDRX</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Escrow ID</span>
                                <span className="text-primary hover:underline font-mono cursor-pointer">#{escrowId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Time</span>
                                <span className="text-text-main dark:text-white">
                                    {format(new Date(Number(completedAt) * 1000), "PPP p")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" className="rounded-full">
                            View Receipt
                        </Button>
                        <a
                            href={`https://sepolia.basescan.org/address/${process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="rounded-full bg-primary text-text-main font-bold">
                                View on Explorer
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
