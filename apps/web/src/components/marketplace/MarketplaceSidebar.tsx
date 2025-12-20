"use client";

import { useState } from "react";

export function MarketplaceSidebar() {
    return (
        <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white dark:bg-background-dark-elevated rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg text-text-main dark:text-white">Filter</h2>
                    <button className="text-xs text-text-muted hover:text-primary transition-colors">Reset</button>
                </div>

                {/* Verification Level */}
                <div className="mb-8">
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Verification Level</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                type="checkbox"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                Basic
                            </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                defaultChecked
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                type="checkbox"
                            />
                            <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-blue-500 text-[18px] filled">shield</span>
                                Standard
                            </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                type="checkbox"
                            />
                            <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-yellow-500 text-[18px] filled">verified</span>
                                Enhanced
                            </span>
                        </label>
                    </div>
                </div>

                {/* Asset Types */}
                <div className="mb-8">
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Asset Types</h3>
                    <div className="space-y-3">
                        {["SaaS", "E-commerce", "Content Site", "Community", "Other"].map((type, idx) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    defaultChecked={idx < 2}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                    type="checkbox"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                    {type}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="mb-8">
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Revenue Trend</h3>
                    <div className="space-y-3">
                        {["Growing", "Stable", "Declining"].map((trend, idx) => (
                            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20 dark:bg-gray-800 dark:border-gray-600"
                                    type="checkbox"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                                    {trend}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-sm text-text-main dark:text-white">Monthly Revenue</h3>
                        <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md">50M IDRX+</span>
                    </div>
                    {/* Simplified Range Slider */}
                    <div className="relative w-full h-8 flex items-center">
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full relative">
                            <div className="absolute left-[10%] w-[60%] h-full bg-primary rounded-full"></div>
                            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow cursor-pointer"></div>
                            <div className="absolute left-[70%] top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow cursor-pointer"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>500M IDRX</span>
                    </div>
                </div>

                {/* Asking Price */}
                <div>
                    <h3 className="font-semibold text-sm text-text-main dark:text-white mb-3">Asking Price</h3>
                    <div className="space-y-3">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">IDRX</span>
                            <input
                                className="w-full pl-12 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-white outline-none transition-all"
                                type="text"
                                defaultValue="15M"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">IDRX</span>
                            <input
                                className="w-full pl-12 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary text-text-main dark:text-white outline-none transition-all"
                                type="text"
                                defaultValue="5B"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        {["Under 100M IDRX", "100M - 500M IDRX", "500M IDRX+"].map((label, idx) => (
                            <button
                                key={idx}
                                className="w-full py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
