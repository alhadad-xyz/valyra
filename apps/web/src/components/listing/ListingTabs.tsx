"use client";

import { useState } from "react";
import { Button } from "ui";

interface ListingTabsProps {
    description?: string;
    techStack?: string[];
    metrics?: {
        mrr: string;
        annual: string;
        profit: string;
        growth: string;
    };
}

export function ListingTabs({
    description = "Auto-Blogger AI is a fully autonomous micro-SaaS that generates SEO-optimized blog posts for small businesses. Built on the Base L2 blockchain for payment processing, it leverages GPT-4 for content creation. The system includes a dashboard for users to manage keywords, schedule posts, and view analytics.",
    techStack = ["Next.js", "TypeScript", "PostgreSQL", "GPT-4 API", "Stripe", "Base L2"],
    metrics = {
        mrr: "450 IDRX",
        annual: "5.4K IDRX",
        profit: "380 IDRX/mo",
        growth: "+15%/mo"
    }
}: ListingTabsProps) {
    const [activeTab, setActiveTab] = useState("description");

    const tabs = [
        { id: "description", label: "Description" },
        { id: "metrics", label: "Metrics" },
        { id: "verification", label: "Verification" },
        { id: "tech_stack", label: "Tech Stack" },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "description":
                return (
                    <div className="prose prose-stone max-w-none text-text-main dark:text-white dark:prose-invert">
                        <h3 className="text-xl font-bold mb-4">About this Asset</h3>
                        <p className="text-text-muted leading-relaxed mb-6">{description}</p>

                        <h4 className="text-lg font-bold mb-3">What's Included</h4>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                                <span>Source Code</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                                <span>Domain Name</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                                <span>Customer Database</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                                <span>Documentation</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                                <span>IP Assignment</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                <span className="material-symbols-outlined text-gray-400 text-[20px]">cancel</span>
                                <span>Social Accounts</span>
                            </div>
                        </div>

                        <h4 className="text-lg font-bold mb-3">Revenue Sources</h4>
                        <ul className="list-disc list-inside space-y-2 text-text-muted">
                            <li>Monthly subscriptions (85% of revenue)</li>
                            <li>One-time setup fees (15% of revenue)</li>
                            <li>100% recurring via Stripe</li>
                        </ul>
                    </div>
                );

            case "metrics":
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Financial Metrics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl bg-gray-50 dark:bg-background-dark p-5">
                                    <div className="text-sm font-medium text-text-muted mb-1">Monthly Recurring Revenue</div>
                                    <div className="text-3xl font-black text-text-main dark:text-white">{metrics.mrr}</div>
                                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                        <span>Verified via Stripe OAuth</span>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-background-dark p-5">
                                    <div className="text-sm font-medium text-text-muted mb-1">Annual Revenue</div>
                                    <div className="text-3xl font-black text-text-main dark:text-white">{metrics.annual}</div>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-background-dark p-5">
                                    <div className="text-sm font-medium text-text-muted mb-1">Monthly Profit</div>
                                    <div className="text-3xl font-black text-text-main dark:text-white">{metrics.profit}</div>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-background-dark p-5">
                                    <div className="text-sm font-medium text-text-muted mb-1">Growth Rate</div>
                                    <div className="text-3xl font-black text-green-600">{metrics.growth}</div>
                                    <div className="text-xs text-text-muted mt-1">Month over month</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-3 text-text-main dark:text-white">Customer Metrics</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="text-sm font-medium text-text-muted">Active Customers</div>
                                    <div className="text-2xl font-black text-text-main dark:text-white">47</div>
                                </div>
                                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="text-sm font-medium text-text-muted">Churn Rate</div>
                                    <div className="text-2xl font-black text-text-main dark:text-white">8%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "verification":
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Verification Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 rounded-lg border border-transparent bg-green-50 dark:bg-green-900/10 p-4">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[24px]">verified</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-text-main dark:text-white">Enhanced Verification</div>
                                        <div className="text-xs text-text-muted mt-1">Seller identity verified via Coinbase</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border border-transparent bg-green-50 dark:bg-green-900/10 p-4">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[24px]">code</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-text-main dark:text-white">Build ID Verified</div>
                                        <div className="text-xs text-text-muted mt-1">Live site matches source code (commit: 8f4a2c9...)</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border border-transparent bg-green-50 dark:bg-green-900/10 p-4">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[24px]">payments</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-text-main dark:text-white">Revenue Verified</div>
                                        <div className="text-xs text-text-muted mt-1">Stripe OAuth connected - 99% accuracy match</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border border-transparent bg-yellow-50 dark:bg-yellow-900/10 p-4">
                                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-[24px]">trending_up</span>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-text-main dark:text-white">Churn Rate</div>
                                        <div className="text-xs text-text-muted mt-1">Slightly higher than industry average (8%)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-3 text-text-main dark:text-white">Security & Compliance</h4>
                            <div className="space-y-2 text-sm text-text-muted">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-[18px]">check</span>
                                    <span>No critical vulnerabilities found in code scan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-[18px]">check</span>
                                    <span>Content uniqueness verified (passed Copyscape)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-[18px]">check</span>
                                    <span>IP ownership clear - no disputes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "tech_stack":
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Technology Stack</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {techStack.map((tech) => (
                                    <span
                                        key={tech}
                                        className="inline-flex items-center rounded-full bg-primary/20 px-4 py-2 text-sm font-bold text-text-main dark:text-white border border-primary/30"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-3 text-text-main dark:text-white">Infrastructure</h4>
                            <div className="space-y-3">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-primary">cloud</span>
                                        <span className="font-bold text-sm">Hosting</span>
                                    </div>
                                    <div className="text-sm text-text-muted">Vercel (Pro Plan) - $20/month</div>
                                </div>
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-primary">storage</span>
                                        <span className="font-bold text-sm">Database</span>
                                    </div>
                                    <div className="text-sm text-text-muted">Supabase (Pro) - PostgreSQL</div>
                                </div>
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-primary">api</span>
                                        <span className="font-bold text-sm">APIs</span>
                                    </div>
                                    <div className="text-sm text-text-muted">OpenAI GPT-4, Stripe Payments</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-3 text-text-main dark:text-white">Monthly Costs</h4>
                            <div className="rounded-xl bg-gray-50 dark:bg-background-dark p-5">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Hosting (Vercel)</span>
                                        <span className="font-bold">20 IDRX</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Database (Supabase)</span>
                                        <span className="font-bold">25 IDRX</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">OpenAI API</span>
                                        <span className="font-bold">15 IDRX</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Domain</span>
                                        <span className="font-bold">10 IDRX</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between font-bold">
                                        <span>Total Operating Cost</span>
                                        <span className="text-primary">70 IDRX/mo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Sticky Tab Navigation */}
            <div className="sticky top-[72px] z-10 -mx-4 border-b border-gray-200 bg-background-light/95 px-4 backdrop-blur dark:border-gray-700 dark:bg-background-dark/95 md:mx-0 md:px-0">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            variant="ghost"
                            className={`relative px-4 py-4 text-sm font-bold transition-colors !rounded-none border-b-2 hover:bg-transparent ${activeTab === tab.id
                                    ? "text-primary border-primary"
                                    : "text-text-muted hover:text-text-main border-transparent"
                                }`}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    );
}
