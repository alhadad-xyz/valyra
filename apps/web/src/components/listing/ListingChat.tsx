"use client";

import { Button } from "ui";

export function ListingChat() {
    return (
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-sm">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="font-bold text-text-main dark:text-white">Seller Chat</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-muted">Powered by XMTP</span>
                    <div className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-primary/30 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <span className="translate-x-4 inline-block size-3 transform rounded-full bg-primary shadow ring-0 transition duration-200 ease-in-out"></span>
                    </div>
                </div>
            </div>
            {/* Chat Body (Blurred) */}
            <div className="relative flex h-64 flex-col gap-4 p-6 opacity-30 blur-sm select-none">
                <div className="self-start rounded-2xl rounded-tl-none bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-text-main dark:text-white">
                    Hi, is the revenue strictly from subscriptions?
                </div>
                <div className="self-end rounded-2xl rounded-tr-none bg-primary px-4 py-2 text-sm text-text-main">
                    Yes, 100% recurring via Stripe.
                </div>
                <div className="self-start rounded-2xl rounded-tl-none bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-text-main dark:text-white">
                    Can I see the churn metrics?
                </div>
            </div>
            {/* Gated Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm p-6 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-text-main dark:bg-white text-primary">
                    <span className="material-symbols-outlined text-3xl">lock</span>
                </div>
                <h4 className="mb-2 text-lg font-bold text-text-main dark:text-white">Proof of Funds Required</h4>
                <p className="mb-6 max-w-sm text-sm text-text-muted">
                    To prevent spam, you must hold at least <strong>10 IDRX</strong> equivalent in your wallet to message the seller. This ensures serious inquiries only.
                </p>
                <Button
                    className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-text-main shadow-lg hover:shadow-xl transition-all"
                >
                    Connect Wallet to Access
                </Button>
            </div>
        </div>
    );
}
