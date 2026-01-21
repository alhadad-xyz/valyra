"use client";

import { Button } from "ui";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ABI } from "@/abis/EscrowV1";
import { toast } from "sonner";

const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`;

interface Step4ConfirmationProps {
    escrowId: string;
    userRole: 'buyer' | 'seller' | 'viewer';
    escrow?: any;
}

export function Step4Confirmation({ escrowId, userRole, escrow }: Step4ConfirmationProps) {
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [disputeEvidence, setDisputeEvidence] = useState("");

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleConfirmReceipt = () => {
        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'confirmReceipt',
            args: [BigInt(escrowId)],
        });
    };

    const handleRaiseDispute = () => {
        if (!disputeEvidence.trim()) {
            toast.error("Please provide dispute evidence");
            return;
        }

        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'raiseDispute',
            args: [BigInt(escrowId), 0, disputeEvidence], // 0 = DisputeType.DELIVERY
        });
        setShowDisputeModal(false);
    };

    // Buyer view - show confirmation actions
    if (userRole === 'buyer') {
        return (
            <>
                <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-text-main">
                                <span className="material-symbols-outlined text-[24px]">thumb_up</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white">Confirm Receipt</h3>
                                <p className="text-text-muted text-sm">Verify that you have received and tested all assets</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6 mb-8">
                            <h4 className="flex items-center gap-2 font-bold text-yellow-800 dark:text-yellow-500 mb-2">
                                <span className="material-symbols-outlined text-[20px]">warning</span>
                                Important Notice
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400/90 leading-relaxed">
                                By confirming receipt, you authorize the smart contract to release funds to the seller.
                                This action <strong>cannot be undone</strong>. Please ensure you have full access to all listed assets.
                            </p>
                        </div>

                        {isSuccess && (
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4 mb-6">
                                <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    Transaction confirmed! Funds will be released.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleConfirmReceipt}
                                disabled={isPending || isConfirming || isSuccess}
                                className="flex-1 h-12 bg-primary hover:bg-[#e4e005] text-text-main font-bold rounded-full flex items-center justify-center gap-2 transition-all shadow-md"
                            >
                                {isPending || isConfirming ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        {isPending ? "Confirm in Wallet..." : "Processing..."}
                                    </>
                                ) : isSuccess ? (
                                    <>
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Confirmed
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Confirm & Release Funds
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowDisputeModal(true)}
                                disabled={isPending || isConfirming || isSuccess}
                                className="px-6 h-12 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 font-bold"
                            >
                                <span className="material-symbols-outlined mr-2">gavel</span>
                                Raise Dispute
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dispute Modal */}
                {showDisputeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold mb-4 text-text-main dark:text-white">Raise Dispute</h3>
                            <p className="text-sm text-text-muted mb-4">Provide evidence for your dispute:</p>
                            <textarea
                                value={disputeEvidence}
                                onChange={(e) => setDisputeEvidence(e.target.value)}
                                placeholder="IPFS hash or evidence description..."
                                className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white mb-4"
                            />
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleRaiseDispute}
                                    disabled={!disputeEvidence.trim()}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Submit Dispute
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDisputeModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Seller view - show waiting state
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">hourglass_empty</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-text-main dark:text-white">Waiting for Buyer Confirmation</h3>
                    <p className="text-text-muted text-sm">Buyer is verifying assets before releasing funds</p>
                </div>
            </div>
        </div>
    );
}
