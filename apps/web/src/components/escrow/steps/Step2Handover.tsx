"use client";

import { Button } from "ui";
import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ESCROW_ABI } from "@/abis/EscrowV1";
import { keccak256, toBytes } from "viem";
import { toast } from "sonner";

const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;

interface Step2HandoverProps {
    escrowId: string;
    userRole: 'buyer' | 'seller' | 'viewer';
    escrow?: any;
    onUploadComplete?: () => void;
}

export function Step2Handover({ escrowId, userRole, escrow, onUploadComplete }: Step2HandoverProps) {
    const [credentials, setCredentials] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleUpload = async () => {
        if (!credentials.trim()) {
            toast.error("Please enter credentials");
            return;
        }

        try {
            setIsUploading(true);

            // 1. Upload to Backend (Encrypts & Stores off-chain + Updates DB State)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/escrow/${escrowId}/upload-credentials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure we have auth if needed, though usually cookie or header managed
                },
                body: JSON.stringify({
                    notes: credentials
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Handle case where state is already delivered (idempotency)
                if (errorData.detail && errorData.detail.includes("Escrow state is delivered")) {
                    console.log("Escrow already delivered (backend), proceeding to chain...");
                    // We consider this a success for the backend part, so we proceed to chain step
                } else {
                    throw new Error(errorData.detail || "Backend upload failed");
                }
            }

            console.log("Backend upload successful");

            // Trigger refresh immediately after backend success
            if (onUploadComplete) {
                onUploadComplete();
            }

            // 2. Hash on-chain (Verifiable Proof)
            // Generate hash from credentials
            const credentialHash = keccak256(toBytes(credentials));

            // Call smart contract
            // Use onChainId from escrow object if available (preferred), otherwise try parsing escrowId
            const onChainId = escrow?.id || BigInt(escrowId);

            await writeContract({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'uploadCredentialHash',
                args: [onChainId, credentialHash],
            });

        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error(`Failed to upload credentials: ${error.message || error}`);
            setIsUploading(false);
        }
    };

    // Reset uploading state on success
    if (isSuccess && isUploading) {
        setIsUploading(false);
        setCredentials("");
    }

    // Seller view - show upload form
    if (userRole === 'seller') {
        return (
            <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">upload_file</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">Upload Credentials</h3>
                            <p className="text-text-muted text-sm">Provide the encrypted credentials to the buyer</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                        <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                            Credentials Hash Input
                        </label>
                        <textarea
                            value={credentials}
                            onChange={(e) => setCredentials(e.target.value)}
                            placeholder="Enter credentials or any string to hash..."
                            className="w-full h-32 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-text-main dark:text-white"
                            disabled={isPending || isConfirming || isSuccess}
                        />
                        <p className="text-xs text-text-muted mt-2">
                            This will be hashed on-chain using keccak256
                        </p>
                    </div>

                    {isSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4 mb-6">
                            <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                Credentials uploaded successfully!
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleUpload}
                            disabled={isPending || isConfirming || isSuccess || !credentials.trim()}
                            className="h-12 px-6 bg-primary hover:bg-[#e4e005] text-text-main font-bold rounded-full"
                        >
                            {isPending || isConfirming ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                                    {isPending ? "Confirm in Wallet..." : "Uploading..."}
                                </>
                            ) : isSuccess ? (
                                <>
                                    <span className="material-symbols-outlined mr-2">check_circle</span>
                                    Uploaded
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined mr-2">upload</span>
                                    Upload Credentials
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Buyer/viewer view - show waiting state
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">upload_file</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Assets Uploaded & Encrypted</h3>
                        <p className="text-text-muted text-sm">Seller has transferred digital assets to the vault</p>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 text-[24px]">verified_user</span>
                                <span className="font-bold text-text-main dark:text-white">5 Items Verified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 text-[24px]">lock</span>
                                <span className="font-bold text-text-main dark:text-white">Encrypted via Smart Wallet</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 text-[24px]">history</span>
                                <span className="font-bold text-text-main dark:text-white">Version Controlled (Git)</span>
                            </div>
                        </div>

                        <div className="w-full md:w-px h-px md:h-24 bg-gray-200 dark:border-gray-800"></div>

                        <div className="flex-1 w-full text-sm text-text-muted">
                            <p className="mb-2">Assets in bundle:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Source Code Repository Access</li>
                                <li>Domain Name Transfer Auth Code</li>
                                <li>AWS Root Credentials</li>
                                <li>Stripe Account Ownership Transfer</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="text-sm text-text-muted italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                        Waiting for buyer verification start...
                    </div>
                </div>
            </div>
        </div>
    );
}
