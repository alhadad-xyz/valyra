import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Button } from 'ui';
import { ESCROW_ABI } from '@/abis/EscrowV1';
import { ERC20_ABI } from '@/abis/ERC20';
import { toast } from 'sonner';

const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;
const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS as `0x${string}`;
const EARNEST_PCT = 0.05; // 5% Earnest Money

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: bigint;
    listingUuid: string; // UUID for API calls
    listingPrice?: string; // Display string
    onSuccess?: () => void;
}

export function OfferModal({ isOpen, onClose, listingId, listingUuid, listingPrice, onSuccess }: OfferModalProps) {
    const { address, isConnected } = useAccount(); // Get connected address
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const [amount, setAmount] = useState('');
    const [step, setStep] = useState<'input' | 'approve' | 'offer'>('input');

    // 1. Read Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: IDRX_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, ESCROW_ADDRESS] : undefined,
    });

    // Write Hooks
    const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
    const { writeContract: writeOffer, data: offerHash, isPending: isOfferPending } = useWriteContract();

    // Transaction Receipts
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess, error: approveError } = useWaitForTransactionReceipt({
        hash: approveHash
    });
    const { isLoading: isOfferConfirming, isSuccess: isOfferSuccess, status: offerStatus, error: offerError } = useWaitForTransactionReceipt({
        hash: offerHash
    });

    // Verify Network
    useEffect(() => {
        if (chainId && chainId !== 84532) { // 84532 = Base Sepolia
            toast.error("Wrong Network! Please switch your wallet to Base Sepolia.");
            try {
                switchChain({ chainId: 84532 });
            } catch (e) { console.error("Auto-switch failed", e); }
        }
    }, [chainId, switchChain]);

    // Check for existing offer using smart contract
    const { data: hasActiveOfferData, isLoading: isCheckingOffer, refetch: refetchHasActiveOffer } = useReadContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'hasActiveOffer',
        args: address && listingId ? [listingId, address] : undefined,
        query: {
            enabled: !!address && !!listingId && isOpen,
        }
    });

    const hasExistingOffer = hasActiveOfferData === true;

    // Show toast when duplicate offer is detected
    useEffect(() => {
        if (hasExistingOffer && isOpen) {
            toast.error('You already have an active offer on this listing!');
        }
    }, [hasExistingOffer, isOpen]);

    // Effect: Handle Approve Success - Auto-submit offer
    useEffect(() => {
        if (isApproveSuccess && step === 'approve') {
            toast.success('Approval successful! Submitting offer...');
            refetchAllowance().then(() => {
                setStep('offer');
                // Auto-submit the offer after a brief delay to ensure state updates
                setTimeout(() => {
                    handleMakeOffer();
                }, 500);
            });
        }
    }, [isApproveSuccess, refetchAllowance]);

    // Effect: Handle Offer Success
    useEffect(() => {
        if (isOfferSuccess) {
            toast.success('Offer submitted successfully! Redirecting to your offers...');
            setTimeout(() => {
                window.location.href = '/app/offers';
            }, 1500);
        } else if (offerError) {
            toast.error("Transaction failed: " + (offerError as Error).message);
        }
    }, [isOfferSuccess, onSuccess, onClose, isOfferConfirming, offerHash, offerStatus, offerError]);


    // Calculate derived values
    const offerAmount = amount && !isNaN(Number(amount)) ? parseUnits(amount, 18) : 0n;
    const earnestMoney = offerAmount * BigInt(EARNEST_PCT * 100) / 100n; // 1%

    // Determine Step based on Earnest Money and Allowance
    useEffect(() => {
        if (offerAmount > 0n) {
            if (allowance !== undefined && allowance >= earnestMoney) {
                setStep('offer');
            } else {
                setStep('approve');
            }
        }
    }, [offerAmount, allowance, earnestMoney]);

    const handleApprove = () => {
        if (hasExistingOffer) {
            toast.error('You have already made an offer on this listing!');
            return;
        }
        console.log("handleApprove called", { address: IDRX_ADDRESS, spender: ESCROW_ADDRESS, amount: earnestMoney });
        try {
            writeApprove({
                address: IDRX_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [ESCROW_ADDRESS, offerAmount], // APPROVING FULL AMOUNT to be safe (contract might pull full or partial)
            }, {
                onError: (e) => console.error("Approve Write Error:", e),
                onSuccess: (h) => console.log("Approve Write Success, Hash:", h)
            });
        } catch (err: any) {
            console.error("Approve Try-Catch Error:", err);
            toast.error(err.message || 'Approval failed');
        }
    };

    const handleMakeOffer = () => {
        if (hasExistingOffer) {
            toast.error('You have already made an offer on this listing!');
            return;
        }

        try {
            writeOffer({
                address: ESCROW_ADDRESS,
                abi: ESCROW_ABI,
                functionName: 'makeOffer',
                args: [listingId, offerAmount],
            }, {
                onError: (e) => console.error("Offer Write Error:", e),
                onSuccess: (h) => console.log("Offer Write Success, Hash:", h)
            });
        } catch (err: any) {
            console.error("Offer Try-Catch Error:", err);
            toast.error(err.message || 'Offer failed');
        }
    };

    if (!isOpen) return null;

    const isLoading = isApprovePending || isApproveConfirming || isOfferPending || isOfferConfirming;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-surface-dark animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-text-main dark:text-white">Make an Offer</h3>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <p className="mb-6 text-sm text-text-muted">
                    Enter your offer amount. A 5% Earnest Money deposit is required to show serious intent.
                </p>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-text-main dark:text-gray-300">Offer Amount (IDRX)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                }}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:text-white"
                                placeholder={listingPrice || "0.00"}
                                min="0"
                                step="0.01"
                                disabled={isLoading}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">
                                IDRX
                            </div>
                        </div>
                    </div>

                    {/* Earnest Money Display */}
                    {offerAmount > 0n && (
                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-blue-800 dark:text-blue-300">Earnest Money Deposit (5%)</span>
                                <span className="font-bold text-blue-800 dark:text-blue-300">{formatUnits(earnestMoney, 18)} IDRX</span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                This amount will be held in escrow. If your offer is rejected, it will be fully refunded.
                            </p>
                        </div>
                    )}



                    <div className="mt-4 flex gap-3">
                        <Button type="button" variant="outline" fullWidth onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>

                        {step === 'approve' ? (
                            <Button
                                type="button"
                                variant="primary"
                                fullWidth
                                onClick={handleApprove}
                                disabled={isLoading || !amount || offerAmount <= 0n}
                            >
                                {isApprovePending || isApproveConfirming ? 'Approving...' : `Approve ${formatUnits(earnestMoney, 18)} IDRX`}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="primary"
                                fullWidth
                                onClick={handleMakeOffer}
                                disabled={isLoading || !amount || offerAmount <= 0n}
                                loading={isOfferPending || isOfferConfirming}
                            >
                                {isOfferPending || isOfferConfirming ? 'Confirming...' : 'Confirm Offer'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
