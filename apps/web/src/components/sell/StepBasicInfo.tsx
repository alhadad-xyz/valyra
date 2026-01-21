import { FC } from 'react';
import { Input, Button } from 'ui';
import { useSellStore, AssetType } from '../../stores/useSellStore';

export const StepBasicInfo: FC = () => {
    const { title, description, websiteUrl, assetType, includeDomain, includeCode, includeCustomerData, setField } = useSellStore();

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">description</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">Project Details</h3>
                            <p className="text-text-muted text-sm">Provide the core information about your asset.</p>
                        </div>
                    </div>
                    {/* Developer Autofill Button */}
                    <Button
                        onClick={() => {
                            setField('title', 'DevTools Pro SaaS Starter');
                            setField('websiteUrl', 'https://devtools-pro-starter.com');
                            setField('assetType', 'saas');
                            setField('includeDomain', true);
                            setField('includeCode', true);
                            setField('includeCustomerData', true);
                            setField('description', 'A comprehensive Next.js SaaS starter kit with Stripe, Supabase, and AI integration. Perfect for launching micro-SaaS projects quickly. Includes 50+ pre-built components and an email database of 500 early-access users.');
                            // Tech & Stats (Step 2)
                            setField('techStack', ['Next.js', 'React', 'Tailwind', 'Supabase', 'Stripe']);
                            setField('customerCount', '500');
                            // Financials (Step 3)
                            setField('mrr', '1200');
                            setField('annualRevenue', '14000');
                            setField('monthlyProfit', '800');
                            setField('monthlyExpenses', '400');
                            setField('revenueTrend', 'growing');
                            // Pricing
                            setField('price', '5000');
                        }}
                        variant="secondary"
                        size="sm"
                        className="!py-1 !px-3 font-mono text-xs border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300"
                        title="Auto-fill form with test data"
                    >
                        🪄 Magic Fill
                    </Button>
                </div>



                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6 space-y-6">

                    {/* Title & URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Project Title</label>
                            <Input
                                placeholder="e.g. AI Content Generator SaaS"
                                value={title}
                                onChange={(e) => setField('title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Website URL</label>
                            <Input
                                placeholder="https://valyra.xyz"
                                value={websiteUrl}
                                onChange={(e) => setField('websiteUrl', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Asset Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main dark:text-white">Business Model</label>
                        <div className="relative">
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-gray-700 dark:text-white appearance-none pr-10"
                                value={assetType}
                                onChange={(e) => setField('assetType', e.target.value as AssetType)}
                            >
                                <option value="saas">SaaS (Software as a Service)</option>
                                <option value="ecommerce">E-commerce</option>
                                <option value="content">Content / Media</option>
                                <option value="community">Community / Membership</option>
                                <option value="other">Other</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[20px]">expand_more</span>
                        </div>
                    </div>

                    {/* Included Assets */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-text-main dark:text-white">Assets Included in Sale</label>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-background-dark px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeDomain}
                                    onChange={(e) => setField('includeDomain', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">Domain Name</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-background-dark px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeCode}
                                    onChange={(e) => setField('includeCode', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">Source Code & IP</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-background-dark px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                                <input
                                    type="checkbox"
                                    checked={includeCustomerData}
                                    onChange={(e) => setField('includeCustomerData', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">User/Customer Data</span>
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main dark:text-white">Project Description</label>
                        <textarea
                            className="w-full min-h-[150px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Provide a detailed overview of your business, key features, technology stack, and growth opportunities..."
                            value={description}
                            onChange={(e) => setField('description', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
