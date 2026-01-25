"use client";

import { Button } from "ui";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ABI } from "@/abis/EscrowV1";

const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`;

interface Step3VerificationProps {
    escrowId: string;
    userRole: 'buyer' | 'seller' | 'viewer';
    escrow?: any;
}

export function Step3Verification({ escrowId, userRole, escrow }: Step3VerificationProps) {
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleRequestExtension = () => {
        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'requestVerificationExtension',
            args: [BigInt(escrowId)],
        });
    };

    // Buyer view - show credential vault with actions
    if (userRole === 'buyer') {
        return (
            <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center relative z-10">
                    <div
                        className="w-full md:w-48 h-32 md:h-48 rounded-lg bg-cover bg-center shrink-0 border border-gray-200 dark:border-gray-800"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDiBAR3wE6bVUSbl7eMhZC7_PEwtvbSf_MitGWcRgZsH2jPVyX7rpa3uBSp3dWKu-EFuAQYTWKuoBiSaH0yMWr_NolpkBp2p-G-lxnyr3pN3vKXL-D_91xlaA8UUpael5ATyJ6m0k34FBGQ7krOYU4_s4ofvI2KbFB20F6yAzE9PvY78NT3hDs4aBd4eY1NeNnSlAEKyDsq4faMW-yYg39lxOCcrv5aOG5WjEZx-NepwcWSM0wrdUc0BzNemO69-raYCValtSNXbaYd')" }}
                    ></div>

                    <div className="flex-1 flex flex-col gap-4 w-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white leading-tight">Credential Vault</h3>
                                <p className="text-text-muted text-sm mt-1">Encrypted on-chain storage. Seller has uploaded assets.</p>
                            </div>
                            <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-mono font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">timer</span>
                                71:59:42
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-text-muted">
                            <div className="flex items-center gap-2 text-text-main dark:text-gray-200 font-medium mb-1">
                                <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                                Assets Locked
                            </div>
                            Contains: AWS Root Access keys, Domain Transfer Auth Code, Stripe Account Ownership Transfer.
                        </div>

                        {isSuccess && (
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-3">
                                <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Extension requested successfully!
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <Button className="flex-1 rounded-full flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">vpn_key</span>
                                Decrypt Credentials
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleRequestExtension}
                                disabled={isPending || isConfirming || isSuccess}
                                className="px-6 rounded-full text-text-muted hover:text-text-main dark:hover:text-white text-sm"
                            >
                                {isPending || isConfirming ? "Requesting..." : isSuccess ? "Extension Requested" : "Request Extension"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
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
                    <h3 className="text-xl font-bold text-text-main dark:text-white">Buyer Verification in Progress</h3>
                    <p className="text-text-muted text-sm">Waiting for buyer to verify credentials and confirm receipt</p>
                </div>
            </div>
        </div>
    );
}
