"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EscrowState, useEscrowDetails } from "@/hooks/useEscrowDetails";
import { ESCROW_ABI } from "@/abis/EscrowV1";
import { formatDistanceToNow, format } from "date-fns";
import { Badge, Button } from "ui";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Confetti from 'react-confetti';
import { toast } from 'sonner';
import { CredentialUploadModal } from "@/components/escrow/CredentialUploadModal";
import { DecryptModal } from "@/components/escrow/DecryptModal";

import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";

export default function EscrowPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // id is UUID
    const { address } = useAccount();
    const router = useRouter();

    // 1. Fetch Backend Data (UUID)
    const { data: backendEscrow, isLoading: isBackendLoading, refetch: refetchBackend } = useQuery({
        queryKey: ['escrow-backend', id],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/escrow/${id}`);
            if (!res.ok) throw new Error('Escrow not found');
            return res.json();
        }
    });

    const onChainId = backendEscrow?.on_chain_id ? BigInt(backendEscrow.on_chain_id) : undefined;

    // Legacy escrowId support (for contract write calls later in file)
    // If loading, this might be undefined, buttons should handle it.
    const escrowId = onChainId;

    // 2. Fetch Contract Data (OnChainID)
    const { escrow: contractEscrow, transitionHold, listing, isLoading: isContractLoading, refetchEscrow: refetchContract } = useEscrowDetails(onChainId);

    // Merge Data
    const escrow = { ...backendEscrow, ...contractEscrow, id: onChainId || backendEscrow?.on_chain_id, uuid: id };
    const isLoading = isBackendLoading || (onChainId ? isContractLoading : false);

    // Combined refetch
    const refetchEscrow = () => { refetchBackend(); refetchContract(); };
    const [showConfetti, setShowConfetti] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
    const [devMode, setDevMode] = useState(false);

    const { writeContract, isPending: isWritePending, data: hash } = useWriteContract();
    const { isSuccess: isTxSuccess, isLoading: isTxConfirming } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isTxSuccess) {
            refetchEscrow();
            if (escrow?.state === EscrowState.COMPLETED) {
                setShowConfetti(true);
            }
        }
    }, [isTxSuccess, refetchEscrow, escrow]);

    const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;
    const IDRX_TOKEN = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS as `0x${string}`;

    const handleConfirmReceipt = () => {
        if (!escrowId) {
            toast.error("Escrow ID not found");
            return;
        }
        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'confirmReceipt',
            args: [escrowId]
        });
    };

    const handleClaimRetainer = () => {
        if (!escrowId) {
            toast.error("Escrow ID not found");
            return;
        }
        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'claimTransitionRetainer',
            args: [escrowId]
        });
    };

    const handleReportIssue = () => {
        const issue = window.prompt("Please describe the issue with the transition assistance:");
        if (!issue) return;

        if (!escrowId) {
            toast.error("Escrow ID not found");
            return;
        }
        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'reportTransitionIssue',
            args: [escrowId, issue]
        });
    }

    const handleRequestExtension = () => {
        if (!escrowId) {
            toast.error("Escrow ID not found");
            return;
        }
        writeContract({
            address: ESCROW_CONTRACT,
            abi: ESCROW_ABI,
            functionName: 'requestVerificationExtension',
            args: [escrowId]
        });
    }

    const handleCompleteFunding = async () => {
        if (!escrowId || !escrow?.amount) {
            toast.error("Escrow data not available");
            return;
        }

        // amount and totalFunded are already BigInts in wei from the contract
        const totalAmount = BigInt(escrow.amount);
        const depositedAmount = escrow.totalFunded ? BigInt(escrow.totalFunded) : BigInt(0);
        const remainingAmount = totalAmount - depositedAmount;

        // Step 1: Approve IDRX
        toast.info(`Approving ${(Number(remainingAmount) / 1e18).toFixed(2)} IDRX...`);
        try {
            const ERC20_ABI = [{ "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }];

            await writeContract({
                address: IDRX_TOKEN,
                abi: ERC20_ABI as any,
                functionName: 'approve',
                args: [ESCROW_CONTRACT, remainingAmount]
            });

            // Wait a bit for approval to process
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 2: Complete funding
            toast.info("Funding escrow...");
            writeContract({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'completeFunding',
                args: [escrowId]
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to complete funding");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <MarketplaceHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-sm font-medium text-gray-500">Loading escrow details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!escrow) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
                <MarketplaceHeader />
                <div className="flex-1 p-10 text-center">Escrow not found</div>
                <Footer />
            </div>
        );
    }

    const mapBackendStateToEnum = (backendState?: string): EscrowState => {
        if (!backendState) return EscrowState.CREATED;
        switch (backendState.toLowerCase()) {
            case 'funded': return EscrowState.FUNDED;
            case 'delivered': return EscrowState.DELIVERED;
            case 'confirmed': return EscrowState.CONFIRMED;
            case 'transition': return EscrowState.TRANSITION;
            case 'disputed': return EscrowState.DISPUTED;
            case 'resolved': return EscrowState.RESOLVED;
            case 'completed': return EscrowState.COMPLETED;
            case 'refunded': return EscrowState.REFUNDED;
            default: return EscrowState.CREATED;
        }
    };

    const contractState = contractEscrow?.state;
    const backendStateEnum = mapBackendStateToEnum(backendEscrow?.escrow_state);

    // Prefer contract state if available and not CREATED (unless backend also says CREATED)
    // This allows backend to "boost" the state if the indexer is ahead or contract call is pending/stale
    const currentState = (contractState !== undefined && contractState !== EscrowState.CREATED)
        ? contractState
        : Math.max(contractState || 0, backendStateEnum);


    const isBuyer = address?.toLowerCase() === (escrow.buyer_address || escrow.buyer)?.toLowerCase();
    const isSeller = address?.toLowerCase() === (escrow.seller_address || escrow.seller)?.toLowerCase();

    // Helper for steps
    const steps = [
        { label: "Funded", state: EscrowState.FUNDED, icon: "check" },
        { label: "Delivered", state: EscrowState.DELIVERED, icon: "inventory_2" },
        { label: "Verified", state: EscrowState.CONFIRMED, icon: "verified" }, // Confirmed means verified
        { label: "Transition", state: EscrowState.TRANSITION, icon: "handshake" },
        { label: "Released", state: EscrowState.COMPLETED, icon: "celebration" }
    ];

    const currentStepIndex = steps.findIndex(s => s.state === currentState);
    console.log("Escrow state:", escrow);
    // Approximate mapping:
    // CREATED (0) -> Funded (1) (Actually before funded)
    // FUNDED (1) -> Step 1 active
    // DELIVERED (2) -> Step 2 active
    // CONFIRMED (3) -> Step 3 active (Verified)
    // TRANSITION (4) -> Step 4 active
    // DISPUTED (5) -> Error state
    // COMPLETED (7) -> Step 5 active

    const renderStep = (step: any, index: number) => {
        const stepStateVal = step.state;
        let isActive = false;
        let isCompleted = false;

        // Simplistic progress logic
        if (currentState === EscrowState.COMPLETED) {
            isCompleted = true;
        } else if (currentState === EscrowState.TRANSITION) {
            if (stepStateVal <= EscrowState.TRANSITION) isCompleted = true; // Wait transition is current
            if (stepStateVal === EscrowState.TRANSITION) { isCompleted = false; isActive = true; }
        } else if (currentState >= stepStateVal) {
            isCompleted = true;
            if (currentState === stepStateVal) { isCompleted = false; isActive = true; }
        }

        // Fix for specific flows
        if (currentState === EscrowState.CONFIRMED && step.label === "Verified") { isActive = true; isCompleted = false; }
        if (currentState > EscrowState.CONFIRMED && step.label === "Verified") isCompleted = true;

        if (currentState === EscrowState.TRANSITION && step.label === "Transition") { isActive = true; isCompleted = false; }


        return (
            <div key={index} className={`flex flex-col items-center gap-2 relative ${isActive ? '' : isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                {isActive && (
                    <div className="absolute -top-12 bg-text-main text-white dark:bg-primary dark:text-black text-[10px] font-bold px-2 py-1 rounded mb-1 animate-bounce whitespace-nowrap">
                        Current Step
                    </div>
                )}
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-sm
                    ${isCompleted ? 'bg-primary' : isActive ? 'bg-white border-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                    {isCompleted ? (
                        <span className="material-symbols-outlined text-black text-sm font-bold">check</span>
                    ) : isActive ? (
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                    ) : (
                        <span className="text-xs font-bold text-gray-500">{index + 1}</span>
                    )}
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-500'}`}>{step.label}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />
            <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-10">
                {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
                {/* Transaction Header & Stepper */}
                <div className="mb-10 flex flex-col gap-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                                    Transaction #{escrowId.toString()}
                                </h1>
                                <Badge variant={
                                    currentState === EscrowState.COMPLETED ? "success" :
                                        currentState === EscrowState.DISPUTED ? "error" :
                                            "warning"
                                }>
                                    {EscrowState[currentState]}
                                </Badge>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">
                                Listing: <Link href={`/app/listings/${listing?.id}`} className="hover:text-primary underline">{listing?.title || "Loading..."}</Link> • Started on {format(new Date(Number(escrow.depositedAt) * 1000), "PPP")}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="flex items-center gap-2 px-4 h-10 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 text-sm font-bold transition-colors"
                                onClick={() => toast.info("Dispute feature coming in next version")}
                            >
                                <span className="material-symbols-outlined text-[18px]">gavel</span>
                                Raise Dispute
                            </button>
                        </div>
                    </div>

                    {/* Visual Stepper */}
                    <div className="w-full overflow-x-auto pb-4">
                        <div className="min-w-[768px] flex items-center justify-between relative px-4">
                            {/* Progress Line Background */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full"></div>
                            {steps.map((step, i) => renderStep(step, i))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Main Workspace (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Main Action Area */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                            {/* Dynamic Content based on State */}
                            {currentState === EscrowState.CREATED && isBuyer && (
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Complete Payment</h3>
                                    <p className="text-gray-500 mb-4">
                                        You've paid a {escrow.totalFunded ? Math.round((Number(escrow.totalFunded) / Number(escrow.amount)) * 100) : 5}% deposit.
                                        Complete the remaining payment to start the escrow process.
                                    </p>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                                            <span className="font-semibold">{(Number(escrow.amount || 0) / 1e18).toLocaleString()} IDRX</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Already Paid:</span>
                                            <span className="text-green-600 dark:text-green-400">-{(Number(escrow.totalFunded || 0) / 1e18).toLocaleString()} IDRX</span>
                                        </div>
                                        <div className="border-t border-blue-200 dark:border-blue-800 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Remaining:</span>
                                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                {((Number(escrow.amount || 0) - Number(escrow.totalFunded || 0)) / 1e18).toLocaleString()} IDRX
                                            </span>
                                        </div>
                                    </div>
                                    <Button onClick={handleCompleteFunding} className="w-full">
                                        Pay Now & Fund Escrow
                                    </Button>
                                </div>
                            )}

                            {currentState === EscrowState.FUNDED && isSeller && (
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Upload Credentials</h3>
                                    <p className="text-gray-500 mb-4">The buyer has deposited funds. Please upload the credentials to the vault.</p>
                                    <Button onClick={() => setIsUploadModalOpen(true)}>
                                        Upload to Vault
                                    </Button>
                                </div>
                            )}

                            {currentState === EscrowState.DELIVERED && isBuyer && (
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Verify Assets</h3>
                                    <p className="text-gray-500 mb-4">Seller has uploaded credentials. Please verify them within the deadline.</p>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setIsDecryptModalOpen(true)}>
                                            Decrypt Credentials
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleConfirmReceipt}
                                            loading={isWritePending || isTxConfirming}
                                            disabled={isWritePending || isTxConfirming}
                                        >
                                            Confirm & Release
                                        </Button>
                                        {!escrow.verifyExtensionUsed && (
                                            <Button
                                                variant="outline"
                                                onClick={handleRequestExtension}
                                                loading={isWritePending || isTxConfirming}
                                                disabled={isWritePending || isTxConfirming}
                                            >
                                                Request 24h Extension
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentState === EscrowState.TRANSITION && (
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Transition Period</h3>
                                    <p className="text-gray-500 mb-4">90% of funds released. 10% held for transition assistance.</p>

                                    {isSeller && (() => {
                                        const releaseTime = Number(transitionHold?.releaseTime || 0);
                                        const currentTime = Math.floor(Date.now() / 1000);
                                        const canClaim = (currentTime >= releaseTime) || devMode;
                                        const retainerAmount = Number(transitionHold?.retainedAmount || 0) / 1e18;

                                        return (
                                            <div className="space-y-3">
                                                {!canClaim && !devMode && (
                                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-xl">schedule</span>
                                                            <div>
                                                                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                                                    Retainer Available {formatDistanceToNow(new Date(releaseTime * 1000), { addSuffix: true })}
                                                                </p>
                                                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                                    {retainerAmount.toLocaleString()} IDRX will be claimable on {format(new Date(releaseTime * 1000), "PPP 'at' p")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {(canClaim || devMode) && (
                                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-3">
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>
                                                            <div>
                                                                <p className="font-semibold text-green-800 dark:text-green-200 mb-1">
                                                                    {devMode && !(currentTime >= releaseTime) ? "Retainer Claimable (Dev Bypass Active)" : "Retainer Ready to Claim!"}
                                                                </p>
                                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                                    {retainerAmount.toLocaleString()} IDRX is {devMode && !(currentTime >= releaseTime) ? "now claimable for testing" : "now available"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={handleClaimRetainer}
                                                    loading={isWritePending || isTxConfirming}
                                                    disabled={!canClaim || isWritePending || isTxConfirming}
                                                    className="w-full"
                                                >
                                                    {canClaim
                                                        ? `Claim ${retainerAmount.toLocaleString()} IDRX Retainer`
                                                        : `Available ${formatDistanceToNow(new Date(releaseTime * 1000), { addSuffix: true })}`
                                                    }
                                                </Button>
                                            </div>
                                        );
                                    })()}

                                    {isBuyer && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">info</span>
                                                <div>
                                                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                                        Transition Assistance Period
                                                    </p>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        If you need help with 2FA, DNS, or account transfers, contact the seller now.
                                                        Report any issues before {format(new Date(Number(transitionHold?.releaseTime || 0) * 1000), "PPP")}.
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        className="mt-3 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                                                        onClick={handleReportIssue}
                                                        disabled={isWritePending || isTxConfirming}
                                                    >
                                                        Report Transition Issue
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentState === EscrowState.COMPLETED && (
                                <div className="text-center py-8">
                                    <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
                                    <h3 className="text-2xl font-bold text-green-600">Transaction Completed</h3>
                                    <p className="text-gray-500">Funds released to seller. Assets transferred.</p>
                                </div>
                            )}

                            {/* Default/Waiting states */}
                            {currentState === EscrowState.FUNDED && isBuyer && <p>Waiting for seller to upload credentials...</p>}
                            {currentState === EscrowState.DELIVERED && isSeller && <p>Waiting for buyer to verify...</p>}

                        </div>

                        {/* Secondary Actions Grid - Transition Hold Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-500">account_balance_wallet</span>
                                    <span className="font-bold">Escrow Details</span>
                                </div>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Smart Contract</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-mono font-bold">{(Number(escrow.amount) / 1e18).toLocaleString()} IDRX</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Platform Fee (2.5%)</span>
                                    <span className="font-mono text-red-500">-{(Number(escrow.platformFee) / 1e18).toLocaleString()} IDRX</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="font-bold">Seller Payout</span>
                                    <span className="font-mono font-bold text-green-600">{(Number(escrow.sellerPayout) / 1e18).toLocaleString()} IDRX</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col">
                            <div className="flex border-b border-gray-100 dark:border-gray-700">
                                <button className="flex-1 py-3 text-sm font-bold border-b-2 border-primary bg-primary/5">Activity Log</button>
                                <button className="flex-1 py-3 text-sm font-medium text-gray-500">Chat</button>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto">
                                {/* Placeholder Activity Log */}
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                                            <div className="w-px h-full bg-gray-200"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400">{format(new Date(Number(escrow.depositedAt) * 1000), "p")}</p>
                                            <p className="text-sm">Funds Deposited</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <CredentialUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                escrowId={id}
                onChainEscrowId={escrow.on_chain_id}
                onSuccess={() => {
                    refetchEscrow();
                    setIsUploadModalOpen(false);
                }}
            />

            <DecryptModal
                isOpen={isDecryptModalOpen}
                onClose={() => setIsDecryptModalOpen(false)}
                escrowId={id}
            />

            <Footer />

            {/* Dev Tools Panel */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 left-4 z-50">
                    <div className={`bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 p-4 transition-all duration-300 ${devMode ? 'w-64' : 'w-12 h-12 flex items-center justify-center cursor-pointer overflow-hidden'}`}
                        onClick={() => !devMode && setDevMode(true)}>
                        {devMode ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-yellow-400 text-sm">terminal</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">Dev Tools</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setDevMode(false); }} className="text-gray-400 hover:text-white">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>
                                <div className="h-px bg-gray-800 w-full"></div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-400">UI Restriction Bypass</span>
                                        <button
                                            className={`w-8 h-4 rounded-full relative transition-colors ${devMode ? 'bg-primary' : 'bg-gray-700'}`}
                                            onClick={(e) => { e.stopPropagation(); setDevMode(!devMode); }}
                                        >
                                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${devMode ? 'translate-x-4' : ''}`}></div>
                                        </button>
                                    </div>
                                    <div className="h-px bg-gray-800 w-full my-1"></div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            writeContract({
                                                address: ESCROW_CONTRACT,
                                                abi: ESCROW_ABI,
                                                functionName: 'setTransitionPeriod',
                                                args: [0n]
                                            });
                                        }}
                                        className="text-[10px] bg-gray-800 hover:bg-gray-700 text-yellow-400 py-1 px-2 rounded border border-gray-700 flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">timer_off</span>
                                        Set Transition 0s
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!escrowId) return;
                                            writeContract({
                                                address: ESCROW_CONTRACT,
                                                abi: ESCROW_ABI,
                                                functionName: 'adminReleaseRetainer',
                                                args: [BigInt(escrowId)]
                                            });
                                        }}
                                        className="text-[10px] bg-gray-800 hover:bg-gray-700 text-red-400 py-1 px-2 rounded border border-gray-700 flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">release_alert</span>
                                        Force Release (Admin)
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 italic mt-1 leading-tight">
                                    Owner/Admin functions to truly bypass the contract timers.
                                </p>
                            </div>
                        ) : (
                            <span className="material-symbols-outlined text-yellow-400">terminal</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
