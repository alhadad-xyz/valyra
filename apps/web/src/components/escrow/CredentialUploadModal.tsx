"use client";

import React, { FC, useState } from "react";
import { useAccount, useSignMessage, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "ui";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ESCROW_ABI } from "@/abis/EscrowV1";

interface CredentialUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    escrowId: string;
    onChainEscrowId?: bigint;
    onSuccess: () => void;
}

export const CredentialUploadModal: FC<CredentialUploadModalProps> = ({
    isOpen,
    onClose,
    escrowId,
    onChainEscrowId,
    onSuccess
}) => {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();

    const [formData, setFormData] = useState({
        domain_credentials: "",
        repo_url: "",
        repo_access_token: "",
        api_keys: {} as Record<string, string>,
        notes: ""
    });

    console.log("escrowId", escrowId);
    console.log("onChainEscrowId", onChainEscrowId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [backendIpfsHash, setBackendIpfsHash] = useState<string | null>(null);

    const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isTxError } = useWaitForTransactionReceipt({ hash });

    // Handle transaction confirmation or failure
    React.useEffect(() => {
        const handleTransactionResult = async () => {
            if (isConfirmed && backendIpfsHash) {
                toast.success("Credentials synced to blockchain!");
                setIsSubmitting(false);
                setBackendIpfsHash(null);
                onSuccess();
                onClose();
            } else if (isTxError && backendIpfsHash) {
                // Transaction failed - rollback backend upload
                toast.error("Blockchain transaction failed. Rolling back...");
                try {
                    const timestamp = Math.floor(Date.now() / 1000).toString();
                    const message = `Login to Valyra at ${timestamp}`;
                    const signature = await signMessageAsync({ message });

                    await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/escrow/${escrowId}/rollback-credentials`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-Wallet-Address": address!,
                                "X-Signature": signature,
                                "X-Timestamp": timestamp
                            }
                        }
                    );
                    toast.info("Backend upload rolled back");
                } catch (err) {
                    console.error("Rollback failed:", err);
                    toast.error("Failed to rollback. Please contact support.");
                }
                setIsSubmitting(false);
                setBackendIpfsHash(null);
            }
        };

        handleTransactionResult();
    }, [isConfirmed, isTxError, backendIpfsHash]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!address) {
                throw new Error("Wallet not connected");
            }

            // Step 1: Upload to backend vault
            toast.info("Uploading to backend vault...");
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const message = `Login to Valyra at ${timestamp}`;
            const signature = await signMessageAsync({ message });

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/escrow/${escrowId}/upload-credentials`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Wallet-Address": address,
                        "X-Signature": signature,
                        "X-Timestamp": timestamp
                    },
                    body: JSON.stringify({
                        domain_credentials: formData.domain_credentials || undefined,
                        repo_url: formData.repo_url || undefined,
                        repo_access_token: formData.repo_access_token || undefined,
                        api_keys: Object.keys(formData.api_keys).length > 0 ? formData.api_keys : undefined,
                        notes: formData.notes || undefined
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.text();

                // Handle case where state is already delivered (idempotency)
                if (errorData.includes("Escrow state is delivered")) {
                    console.log("Escrow already delivered, refreshing...");
                    onSuccess();
                    onClose();
                    return;
                }

                throw new Error(errorData || "Failed to upload credentials");
            }

            const result = await response.json();
            const ipfsHash = result.ipfs_hash || result.credentials_ipfs_hash;

            toast.success("Backend upload successful!");

            // Step 2: Upload hash to smart contract
            if (onChainEscrowId && ipfsHash) {
                toast.info("Syncing to blockchain...");

                // Use keccak256 to hash the IPFS string to get a proper bytes32
                const { keccak256, toBytes } = await import('viem');
                const hashBytes = keccak256(toBytes(ipfsHash));

                const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;
                writeContract({
                    address: ESCROW_CONTRACT,
                    abi: ESCROW_ABI,
                    functionName: 'uploadCredentialHash',
                    args: [onChainEscrowId, hashBytes]
                });

                toast.success("Contract transaction sent! Please confirm in your wallet.");
                setBackendIpfsHash(ipfsHash);
            } else {
                // If no on-chain ID, just close
                onSuccess();
                onClose();
            }

        } catch (err: any) {
            console.error("Upload failed:", err);
            // If the error message itself contains the string (from exception above)
            if (err.message && err.message.includes("Escrow state is delivered")) {
                onSuccess();
                onClose();
                return;
            }
            toast.error(err.message || "Failed to upload credentials");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Upload Credentials
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Upload asset credentials to encrypted vault
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">


                    <div className="space-y-4">
                        {/* Domain Credentials */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Domain Credentials
                            </label>
                            <textarea
                                value={formData.domain_credentials}
                                onChange={(e) => setFormData({ ...formData, domain_credentials: e.target.value })}
                                placeholder="e.g., Registrar: GoDaddy, Login: user@example.com"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows={3}
                            />
                        </div>

                        {/* Repository URL */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Repository URL
                            </label>
                            <input
                                type="url"
                                value={formData.repo_url}
                                onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                                placeholder="https://github.com/username/repo"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Repository Access Token */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Repository Access Token
                            </label>
                            <input
                                type="password"
                                value={formData.repo_access_token}
                                onChange={(e) => setFormData({ ...formData, repo_access_token: e.target.value })}
                                placeholder="ghp_••••••••••••••••••••••••••••••••••••"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional instructions or information for the buyer..."
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">lock</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                    Encrypted & Secure
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Credentials are encrypted with ECIES and stored on Lighthouse IPFS. Only the buyer can decrypt and access them.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-4">
                        {/* Debug Helper */}
                        {process.env.NODE_ENV === 'development' && (
                            <Button
                                type="button"
                                variant="outline"
                                className="mr-auto border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-500 dark:hover:bg-yellow-900/20"
                                onClick={() => setFormData({
                                    domain_credentials: "Registrar: Namecheap\nDomain: emojisaas.com\nLogin: admin@emojisaas.com\nPass: S3cur3P@ssw0rd!",
                                    repo_url: "https://github.com/valyra-demo/emoji-saas",
                                    repo_access_token: "ghp_valyra_demo_token_123456789",
                                    api_keys: {
                                        STRIPE_SECRET_KEY: "sk_test_51Mz...",
                                        OPENAI_API_KEY: "sk-proj-..."
                                    },
                                    notes: "This is a sample SaaS application for generating emojis. \n\nDeployment instructions:\n1. Clone repo\n2. npm install\n3. npm run build"
                                })}
                            >
                                ⚡ Fill Sample Data
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            loading={isSubmitting}
                        >
                            {isSubmitting ? "Uploading..." : "Upload Credentials"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
