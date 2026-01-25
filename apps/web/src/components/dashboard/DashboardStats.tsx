"use client";

import { useUserStats } from "@/hooks/useUserStats";

export function DashboardStats() {
    const { data: stats, isLoading } = useUserStats();

    // Default values if loading
    const totalSpent = stats?.total_spent ?? 0;
    const totalEarned = stats?.total_earned ?? 0;
    const trustScore = stats?.trust_score ?? 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface dark:bg-background-dark-elevated rounded-xl p-6 border border-border dark:border-gray-700 flex flex-col gap-1 shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-text-muted dark:text-gray-400 text-sm font-medium">Total Spent</p>
                    <span className="material-symbols-outlined text-text-muted dark:text-gray-400 bg-background-light dark:bg-background-dark rounded-full p-1 text-[20px]">payments</span>
                </div>
                <p className="text-text-main dark:text-white text-3xl font-bold tracking-tight mt-2">{isLoading ? '...' : `${totalSpent.toLocaleString()} IDRX`}</p>
                {/* <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>+1.2% this month</span>
                </div> */}
            </div>

            <div className="bg-surface dark:bg-background-dark-elevated rounded-xl p-6 border border-border dark:border-gray-700 flex flex-col gap-1 shadow-sm">
                <div className="flex justify-between items-start">
                    <p className="text-text-muted dark:text-gray-400 text-sm font-medium">Total Earned</p>
                    <span className="material-symbols-outlined text-text-muted dark:text-gray-400 bg-background-light dark:bg-background-dark rounded-full p-1 text-[20px]">account_balance</span>
                </div>
                <p className="text-text-main dark:text-white text-3xl font-bold tracking-tight mt-2">{isLoading ? '...' : `${totalEarned.toLocaleString()} IDRX`}</p>
                {/* <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>+5.4% this month</span>
                </div> */}
            </div>

            <div className="bg-surface dark:bg-background-dark-elevated rounded-xl p-6 border border-border dark:border-gray-700 flex flex-col gap-1 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                    <p className="text-text-muted dark:text-gray-400 text-sm font-medium">Trust Score</p>
                    <span className="material-symbols-outlined text-text-muted dark:text-gray-400 bg-background-light dark:bg-background-dark rounded-full p-1 text-[20px]">verified_user</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2 relative z-10">
                    <p className="text-text-main dark:text-white text-3xl font-bold tracking-tight">{isLoading ? '...' : trustScore}</p>
                    <span className="text-text-muted dark:text-gray-400 font-medium">/ 100</span>
                </div>
                {/* <div className="flex items-center gap-1 text-green-600 text-sm font-medium mt-1 relative z-10">
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    <span>2 pts increase</span>
                </div> */}
                <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full border-[6px] border-primary/20 dark:border-primary/10"></div>
                <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full border-[6px] border-transparent border-t-primary transform -rotate-45"></div>
            </div>
        </div>
    );
}
