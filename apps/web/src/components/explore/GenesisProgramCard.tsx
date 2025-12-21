"use client";

import { Button, Badge } from "ui";

interface GenesisProgramCardProps {
    participantCount?: number;
    spotsRemaining?: number;
}

export function GenesisProgramCard({ participantCount = 42, spotsRemaining = 8 }: GenesisProgramCardProps) {
    const participants = [
        "https://i.pravatar.cc/150?u=1",
        "https://i.pravatar.cc/150?u=2",
        "https://i.pravatar.cc/150?u=3",
        "https://i.pravatar.cc/150?u=4",
    ];

    return (
        <div className="bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 rounded-3xl p-8 flex flex-col relative overflow-hidden h-full">
            {/* Background Blur Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-4xl text-white">rocket_launch</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-text-main dark:text-white">Genesis Seller Program</h3>
                    <Badge variant="warning" size="sm">First 50 Only</Badge>
                </div>

                <p className="text-text-muted dark:text-gray-400 mb-8 leading-relaxed">
                    Be among the first 50 verified sellers to list for <span className="text-primary font-bold">FREE</span>.
                    No $50 stake required. Get Build ID verification support and featured placement.
                </p>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="flex -space-x-3">
                            {participants.map((avatar, i) => (
                                <img
                                    key={i}
                                    className="size-8 rounded-full border-2 border-white dark:border-background-dark-elevated"
                                    src={avatar}
                                    alt={`Participant ${i + 1}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-text-muted dark:text-gray-400">
                            <span className="text-text-main dark:text-white font-bold">+{participantCount}</span> joined
                        </span>
                    </div>

                    <Button variant="primary" fullWidth size="md">
                        <div className="flex items-center justify-center gap-2">
                            <span>Claim Your Genesis Spot</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
