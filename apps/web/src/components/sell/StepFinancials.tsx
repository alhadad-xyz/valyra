import { FC } from 'react';
import { Input } from 'ui';
import { useSellStore, RevenueTrend } from '../../stores/useSellStore';

export const StepFinancials: FC = () => {
    const { mrr, annualRevenue, monthlyProfit, monthlyExpenses, revenueTrend, setField } = useSellStore();

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">trending_up</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Financial Performance</h3>
                        <p className="text-text-muted text-sm">Key business metrics and revenue history</p>
                    </div>
                </div>



                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6 space-y-6">

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Monthly Recurring Revenue (MRR)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={mrr}
                                    onChange={(e) => setField('mrr', e.target.value)}
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">$</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Annual Run Rate (ARR)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={annualRevenue}
                                    onChange={(e) => setField('annualRevenue', e.target.value)}
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">$</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Net Profit (Monthly)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={monthlyProfit}
                                    onChange={(e) => setField('monthlyProfit', e.target.value)}
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">$</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-main dark:text-white">Operating Expenses (Monthly)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="0.0"
                                    value={monthlyExpenses}
                                    onChange={(e) => setField('monthlyExpenses', e.target.value)}
                                    className="pl-8"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-500 text-sm font-bold">$</span>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Trend */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-main dark:text-white">Growth Trajectory</label>
                        <div className="relative">
                            <select
                                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-background-dark dark:border-gray-700 dark:text-white appearance-none pr-10"
                                value={revenueTrend}
                                onChange={(e) => setField('revenueTrend', e.target.value as RevenueTrend)}
                            >
                                <option value="growing">Growing (&gt;10% per month)</option>
                                <option value="stable">Stable</option>
                                <option value="declining">Declining</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[20px]">expand_more</span>
                        </div>
                        <p className="text-xs text-text-muted">
                            Based on performance over the last 12 months
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
