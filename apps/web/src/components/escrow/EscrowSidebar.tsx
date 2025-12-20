"use client";

import { useState } from "react";

export function EscrowSidebar() {
    const [activeTab, setActiveTab] = useState<"activity" | "chat">("activity");

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-[600px] overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab("activity")}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "activity"
                            ? "text-text-main dark:text-white border-b-2 border-primary bg-primary/5"
                            : "text-text-muted hover:text-text-main dark:hover:text-white"
                        }`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "chat"
                            ? "text-text-main dark:text-white border-b-2 border-primary bg-primary/5"
                            : "text-text-muted hover:text-text-main dark:hover:text-white"
                        }`}
                >
                    Secure Chat
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                {activeTab === "activity" ? (
                    <>
                        {/* Event Item 1 */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                <div className="w-px h-full bg-gray-200 dark:bg-gray-800 my-1"></div>
                            </div>
                            <div className="pb-2">
                                <p className="text-xs font-bold text-text-muted mb-1">Today, 10:42 AM</p>
                                <p className="text-sm font-medium text-text-main dark:text-white">Credentials Encrypted & Uploaded</p>
                                <p className="text-xs text-text-muted mt-1 font-mono">Tx: 0x4a...99b2</p>
                            </div>
                        </div>
                        {/* Event Item 2 */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                                <div className="w-px h-full bg-gray-200 dark:bg-gray-800 my-1"></div>
                            </div>
                            <div className="pb-2">
                                <p className="text-xs font-bold text-text-muted mb-1">Yesterday, 4:15 PM</p>
                                <p className="text-sm font-medium text-text-main dark:text-white">Legal Agreement Signed</p>
                                <div className="flex gap-1 mt-1">
                                    <span className="px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[10px] text-text-muted">Buyer</span>
                                    <span className="px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[10px] text-text-muted">Seller</span>
                                </div>
                            </div>
                        </div>
                        {/* Event Item 3 */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                                <div className="w-px h-full bg-gray-200 dark:bg-gray-800 my-1"></div>
                            </div>
                            <div className="pb-2">
                                <p className="text-xs font-bold text-text-muted mb-1">Oct 24, 09:30 AM</p>
                                <p className="text-sm font-medium text-text-main dark:text-white">Escrow Funded (15.4 ETH)</p>
                            </div>
                        </div>
                        {/* Event Item 4 */}
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                            </div>
                            <div className="pb-2">
                                <p className="text-xs font-bold text-text-muted mb-1">Oct 23, 11:20 PM</p>
                                <p className="text-sm font-medium text-text-main dark:text-white">Transaction Created</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                        <span className="material-symbols-outlined text-4xl mb-2">lock</span>
                        <p className="text-sm">End-to-end encrypted chat</p>
                        <p className="text-xs mt-1">Start messaging the seller</p>
                    </div>
                )}
            </div>

            {/* Chat Input Placeholder (Sticky Bottom) */}
            <div className="p-3 bg-white dark:bg-background-dark-elevated border-t border-gray-200 dark:border-gray-800">
                <div className="relative">
                    <input
                        className="w-full h-10 pl-4 pr-10 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white"
                        placeholder="Message Seller..."
                        type="text"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-primary-dark transition-colors">
                        <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
