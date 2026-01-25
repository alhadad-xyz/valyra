"use client";

import { Button } from "ui";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ABI } from "@/abis/EscrowV1";

const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`;

interface TransitionHoldProps {
    escrowId: string;
    userRole: 'buyer' | 'seller' | 'viewer';
    escrow?: any;
}

export function TransitionHold({ escrowId, userRole, escrow }: TransitionHoldProps) {
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleClaimRetainer = () => {
        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'claimTransitionRetainer',
            args: [BigInt(escrowId)],
        });
    };

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="material-symbols-outlined text-text-main dark:text-white">account_balance_wallet</span>
                </div>
                <span className="text-xs font-bold text-text-muted bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">Smart Contract</span>
            </div>

            <div>
                <h4 className="text-lg font-bold text-text-main dark:text-white mb-1">Transition Hold</h4>
                <p className="text-sm text-text-muted mb-4">Funds distribution logic</p>
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-primary w-[90%]"></div>
                    </div>
                    <span className="text-xs font-bold text-text-main dark:text-white">90%</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted font-medium">
                    <span>Immediate Release</span>
                    <span>10% Retained (30d)</span>
                </div>
            </div>

            {isSuccess && (
                <div className="my-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg p-3">
                    <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Retainer claimed successfully!
                    </p>
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                {userRole === 'seller' ? (
                    <Button
                        onClick={handleClaimRetainer}
                        disabled={isPending || isConfirming || isSuccess}
                        className="w-full text-sm font-bold"
                    >
                        {isPending || isConfirming ? (
                            <>
                                <span className="material-symbols-outlined animate-spin mr-2 text-[16px]">progress_activity</span>
                                {isPending ? "Confirm in Wallet..." : "Claiming..."}
                            </>
                        ) : isSuccess ? (
                            <>
                                <span className="material-symbols-outlined mr-2 text-[16px]">check_circle</span>
                                Claimed
                            </>
                        ) : (
                            "Claim Retainer"
                        )}
                    </Button>
                ) : (
                    <button className="w-full text-left text-sm font-bold text-text-main dark:text-white hover:text-primary transition-colors flex items-center justify-between group">
                        View Hold Conditions
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                )}
            </div>
        </div>
    );
}
