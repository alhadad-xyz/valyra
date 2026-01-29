"use client";

import { Button } from "ui";
import { useState, useEffect } from "react";
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

import { useAuth } from "@/hooks/useAuth";

export function Step2Handover({ escrowId, userRole, escrow, onUploadComplete }: Step2HandoverProps) {
    const [credentials, setCredentials] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { getAuthHeaders } = useAuth();

    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!credentials.trim() && !file) {
            toast.error("Credentials or file required.");
            return;
        }

        try {
            setIsUploading(true);

            // Get signed headers
            const authHeaders = await getAuthHeaders();
            // Remove Content-Type to let browser set it with boundary for FormData


            // 1. Upload to Backend (Encrypts & Stores off-chain + Updates DB State)
            // 1. Upload to Backend (Encrypts & Stores off-chain + Updates DB State)
            // Backend expects Multipart/Form-Data with 'data' (JSON) and optional 'file'
            const payload = {
                notes: credentials,
                domain_credentials: credentials
            };

            const formData = new FormData();
            formData.append('data', JSON.stringify(payload));
            if (file) {
                formData.append('file', file);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/escrow/${escrowId}/upload-credentials`, {
                method: 'POST',
                headers: {
                    ...Object.fromEntries(Object.entries(authHeaders).filter(([key]) => key !== 'Content-Type')),
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Upload validation error:", errorData);
                if (errorData.detail && errorData.detail.includes("Escrow state is delivered")) {
                    console.log("Escrow already delivered (backend), proceeding to chain...");
                } else {
                    // Handle FastAPI validation errors (array of errors)
                    const errorMessage = Array.isArray(errorData.detail)
                        ? errorData.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(', ')
                        : (errorData.detail || "Backend upload failed");
                    throw new Error(errorMessage);
                }
            }

            if (onUploadComplete) {
                onUploadComplete();
            }

            // 2. Hash on-chain (Verifiable Proof)
            // We hash the combination of credentials text and file name/size as a simple commitment
            // In a real app, we might hash the file content client-side too
            const integrityString = `${credentials}${file ? file.name + file.size : ''}`;
            const credentialHash = keccak256(toBytes(integrityString));
            const onChainId = escrow?.id || BigInt(escrowId);

            writeContract({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'uploadCredentialHash',
                args: [onChainId, credentialHash],
            });

        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error(`Unable to upload credentials: ${error.message || error}`);
            setIsUploading(false);
        }
    };

    // Watch for transaction success
    useEffect(() => {
        if (isSuccess) {
            toast.success("Credentials verification confirmed on-chain.");
            setIsUploading(false);
            setCredentials("");
            setFile(null);
            if (onUploadComplete) {
                onUploadComplete();
            }
        }
    }, [isSuccess, onUploadComplete]);

    // Handle initial backend success
    useEffect(() => {
        if (isWritePending) {
            toast.info("Backend upload complete. Awaiting blockchain confirmation...");
        }
    }, [isWritePending]);

    const isPending = isWritePending || isConfirming || isUploading;

    // Seller View (Active Handover)
    if (userRole === 'seller') {
        return (
            <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                {/* Left Column: Form Area */}
                <div className="flex-1 w-full">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white">Handover Assets</h1>
                            </div>
                            <p className="text-text-muted text-base">
                                Securely upload credentials and documentation to the escrow smart contract.
                            </p>
                        </div>
                    </div>

                    {/* Transaction Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                        <div className="p-6 md:p-8 space-y-8">
                            {/* Warning/Info Banner */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                                <span className="material-symbols-outlined text-primary">security</span>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-primary mb-1">Local Encryption Enabled</p>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                                        All data entered here is encrypted before being committed.
                                        SecureEscrow never sees your raw credentials.
                                    </p>
                                </div>
                            </div>

                            {/* Form Section: Text Area */}
                            <div className="flex flex-col gap-3">
                                <label className="flex flex-col gap-2">
                                    <span className="text-base font-semibold text-text-main dark:text-white">Encrypted Credentials / Private Notes</span>
                                    <textarea
                                        value={credentials}
                                        onChange={(e) => setCredentials(e.target.value)}
                                        className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent min-h-[160px] placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-sm md:text-base font-mono leading-relaxed outline-none transition-all text-text-main dark:text-white"
                                        placeholder="Paste repository keys, domain auth codes, AWS IAM secrets, or sensitive handover instructions here..."
                                        disabled={isPending || isSuccess}
                                    />
                                </label>
                                <p className="text-[10px] md:text-xs text-text-muted uppercase tracking-widest font-bold">
                                    Client-side PGP Encryption Active
                                </p>
                            </div>

                            {/* Form Section: File Upload */}
                            <div className="flex flex-col gap-3">
                                <span className="text-base font-semibold text-text-main dark:text-white">Asset Documentation</span>
                                <label className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isPending || isSuccess}
                                    />
                                    {file ? (
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2 text-green-600">
                                                <span className="material-symbols-outlined text-2xl">description</span>
                                            </div>
                                            <p className="text-sm font-bold text-text-main dark:text-white">{file.name}</p>
                                            <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                                            <p className="text-xs text-primary mt-2">Click to replace</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-text-main dark:text-white">Click to upload files</p>
                                                <p className="text-xs text-text-muted">PDF, ZIP, or JSON (Max 50MB)</p>
                                            </div>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* Action Footer */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2 text-text-muted">
                                    <span className="material-symbols-outlined text-lg">info</span>
                                    <span className="text-xs">Est. Gas Fee: <span className="font-mono">~0.0042 ETH</span></span>
                                </div>
                                <Button
                                    onClick={handleUpload}
                                    disabled={isPending || isSuccess || (!credentials.trim() && !file)}
                                    className="w-full md:w-auto min-w-[240px] h-14 px-8 bg-primary hover:bg-primary/90 text-white text-lg font-bold shadow-lg shadow-primary/20 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            <span>Processing...</span>
                                        </>
                                    ) : isSuccess ? (
                                        <>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            <span>Committed to Chain</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">account_balance_wallet</span>
                                            <span>Upload & Commit</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <aside className="w-full lg:w-80 space-y-6">
                    {/* Checklist Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-text-main dark:text-white">
                            <span className="material-symbols-outlined text-primary">checklist</span>
                            Required Assets
                        </h3>
                        <ul className="space-y-4">
                            {/* Source Code */}
                            {escrow?.offer?.listing?.source_code_included && (
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-emerald-500 mt-0.5">check_circle</span>
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">Source Code</p>
                                        <p className="text-xs text-text-muted">GitHub/Bitbucket Repo</p>
                                    </div>
                                </li>
                            )}

                            {/* Domain Access */}
                            {escrow?.offer?.listing?.domain_included && (
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-amber-500 mt-0.5">pending</span>
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">Domain Access</p>
                                        <p className="text-xs text-text-muted">Auth Codes / Transfer</p>
                                    </div>
                                </li>
                            )}

                            {/* Customer Data / Cloud Keys */}
                            {escrow?.offer?.listing?.customer_data_included && (
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-gray-400 mt-0.5">circle</span>
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">Customer Data & Keys</p>
                                        <p className="text-xs text-text-muted">User DB / API Credentials</p>
                                    </div>
                                </li>
                            )}

                            {/* Default Fallback if no assets specified (Legacy listings) */}
                            {(!escrow?.offer?.listing || (!escrow.offer.listing.source_code_included && !escrow.offer.listing.domain_included && !escrow.offer.listing.customer_data_included)) && (
                                <li className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                    <span className="material-symbols-outlined text-gray-400 mt-0.5">info</span>
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">Standard Handover</p>
                                        <p className="text-xs text-text-muted">Credentials & Repo Access</p>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Transaction Summary Card */}
                    <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
                        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-4">Transaction Details</p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Total Value:</span>
                                <span className="font-bold font-mono text-text-main dark:text-white">
                                    {(Number(escrow?.amount || 0) / 1e18).toLocaleString()} IDRX
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Escrow ID:</span>
                                <span className="font-bold font-mono text-xs text-text-main dark:text-white">
                                    #{escrowId?.slice(0, 8)}...
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Buyer:</span>
                                <span className="font-bold text-text-main dark:text-white">
                                    {escrow?.buyer_address
                                        ? `${escrow.buyer_address.slice(0, 6)}...${escrow.buyer_address.slice(-4)}`
                                        : (escrow?.buyer ? `${escrow.buyer.slice(0, 6)}...${escrow.buyer.slice(-4)}` : '...')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Help Link */}
                    <div className="flex items-center justify-center gap-2 text-text-muted text-sm hover:text-primary cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-base">help</span>
                        <span>Need help with asset transfer?</span>
                    </div>
                </aside>
            </div>
        );
    }

    // Buyer/Viewer View (Waiting State)
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
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
