import Link from 'next/link';
import { Button, Badge } from 'ui';
import { Offer, OfferStatus } from '@/hooks/useOffers';
import { formatDistanceToNow } from 'date-fns';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { ESCROW_ABI } from '@/abis/EscrowV1';
import { ERC20_ABI } from '@/abis/ERC20';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';


interface OfferCardProps {
    offer: Offer;
    type: 'sent' | 'received';
}

const statusVariants: Record<OfferStatus, "warning" | "success" | "error" | "neutral"> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "error",
    EXPIRED: "neutral",
};

export function OfferCard({ offer, type }: OfferCardProps) {
    const { address } = useAccount();
    const router = useRouter();
    const publicClient = usePublicClient();
    const isPendingStatus = offer.status === 'PENDING';
    const isAccepted = offer.status === 'ACCEPTED';
    const isCompleted = offer.status === 'REJECTED' || offer.status === 'EXPIRED'; // Accepted is not completed until paid

    const [action, setAction] = useState<'accept' | 'reject' | 'cancel' | 'pay' | null>(null);
    const { getAuthHeaders } = useAuth();


    const { writeContractAsync, isPending: isWritePending, data: hash, error: writeError } = useWriteContract();

    console.log(offer.es)
    // Watch for transaction completion
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash
    });

    useEffect(() => {
        if (writeError) {
            setAction(null);
            toast.error(`Transaction failed: ${writeError.message}`);
        }
    }, [writeError]);

    useEffect(() => {
        if (isSuccess && action === 'accept') {
            setAction(null);
            toast.success("Offer accepted! Redirecting to transaction details...", { duration: 3000 });
            // For accept, we still rely on indexer to create the escrow link, 
            // but we can try to reload or just give it a moment.
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isSuccess, action]);


    const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;

    const handleAccept = async () => {
        if (!offer.on_chain_id) {
            toast.error("This offer is not synced on-chain properly.");
            return;
        }
        setAction('accept');
        try {
            await writeContractAsync({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'acceptOffer',
                args: [BigInt(offer.on_chain_id), 0] // 0 = EncryptionMethod.None/Standard
            });
        } catch (error) {
            console.error(error);
            setAction(null);
        }
    };

    const handleReject = async () => {
        if (!offer.on_chain_id) {
            toast.error("This offer is not synced on-chain properly.");
            return;
        }
        setAction('reject');
        try {
            const hash = await writeContractAsync({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'rejectOffer',
                args: [BigInt(offer.on_chain_id)]
            });

            if (publicClient) {
                toast.loading("Confirming rejection...", { id: 'reject-offer' });
                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                if (receipt.status === 'success') {
                    // Sync with backend
                    try {
                        const headers = await getAuthHeaders();
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
                        await fetch(`${API_URL}/offers/${offer.id}/reject`, {
                            method: 'POST',
                            headers
                        });
                        toast.success("Offer rejected", { id: 'reject-offer' });
                    } catch (e) {
                        toast.success("Offer rejected on-chain. Syncing database...", { id: 'reject-offer' });
                    }
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    toast.error("Transaction failed", { id: 'reject-offer' });
                    setAction(null);
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to reject offer");
            setAction(null);
        }
    };


    const handleCancel = async () => {
        if (!offer.on_chain_id) {
            toast.error("This offer is not synced on-chain properly.");
            return;
        }
        setAction('cancel');
        try {
            const hash = await writeContractAsync({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'cancelOffer',
                args: [BigInt(offer.on_chain_id)]
            });

            if (publicClient) {
                toast.loading("Confirming cancellation...", { id: 'cancel-offer' });
                const receipt = await publicClient.waitForTransactionReceipt({ hash });

                if (receipt.status === 'success') {
                    // Sync with backend
                    try {
                        const headers = await getAuthHeaders();
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
                        await fetch(`${API_URL}/offers/${offer.id}/cancel`, {
                            method: 'POST',
                            headers
                        });
                        toast.success("Offer cancelled", { id: 'cancel-offer' });
                    } catch (e) {
                        toast.success("Offer cancelled on-chain. Syncing database...", { id: 'cancel-offer' });
                    }
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    toast.error("Transaction failed", { id: 'cancel-offer' });
                    setAction(null);
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to cancel offer");
            setAction(null);
        }
    };


    const handlePay = async () => {
        console.log("handlePay: Starting payment flow", { offer, ESCROW_CONTRACT });
        if (!ESCROW_CONTRACT) {
            console.error("handlePay: Escrow contract address missing");
            return;
        }
        setAction('pay');
        try {
            // 1. Approve
            const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS as `0x${string}`;

            // Calculate remaining amount (Total Offer Price - Earnest Deposit)
            // Or just approve full amount to be safe, contract matches exact need.
            // But technically we only transfer remaining.
            // Let's stick to full amount approval to keep it simple, or `offer_amount` wei.
            const amountWei = BigInt(Math.floor(parseFloat(offer.offer_amount) * 1e18));

            console.log("handlePay: Approving IDRX", {
                token: IDRX_ADDRESS,
                spender: ESCROW_CONTRACT,
                amount: amountWei.toString()
            });

            const approveHash = await writeContractAsync({
                address: IDRX_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [ESCROW_CONTRACT, amountWei]
            });
            console.log("handlePay: Approve Tx sent", approveHash);

            if (!offer.escrow_on_chain_id) {
                console.error("handlePay: Missing escrow_on_chain_id", offer);
                toast.error("Escrow not synced on-chain properly. Please wait for indexing.");
                setAction(null);
                return;
            }

            // 2. Complete Funding (was Deposit)
            console.log("handlePay: completing funding", {
                escrowId: offer.escrow_on_chain_id,
                amountApproved: amountWei.toString()
            });

            // Simulate first to catch reverts
            if (publicClient) {
                try {
                    console.log("handlePay: Simulating completeFunding...");
                    const { result } = await publicClient.simulateContract({
                        address: ESCROW_CONTRACT,
                        abi: ESCROW_ABI,
                        functionName: 'completeFunding',
                        args: [BigInt(offer.escrow_on_chain_id)],
                        account: address,
                    });
                    console.log("handlePay: Simulation successful, result:", result);
                } catch (simError: any) {
                    console.error("handlePay: Simulation FAILED", simError);
                    toast.error(`Transaction will fail: ${simError.shortMessage || simError.message}`);
                    setAction(null);
                    return;
                }
            }

            const hash = await writeContractAsync({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'completeFunding',
                args: [BigInt(offer.escrow_on_chain_id)]
            });
            console.log("handlePay: CompleteFunding Tx sent", hash);

            // 3. Wait and Redirect
            if (publicClient) {
                console.log("handlePay: Waiting for receipt...");
                const receipt = await publicClient.waitForTransactionReceipt({ hash });
                console.log("handlePay: Receipt received", receipt);
                console.log("handlePay: Receipt status", receipt.status);

                if (receipt.status === 'success') {
                    // Redirect to Escrow Page
                    // Redirect to Escrow Page
                    const escrowId = offer.escrow_id;
                    console.log("handlePay: Success, redirecting to", escrowId);
                    router.push(`/app/escrow/${escrowId}`);
                } else {
                    throw new Error("Transaction failed on-chain");
                }
            }

        } catch (e: any) {
            console.error("handlePay: Error", e);
            toast.error(e.message || "Payment failed");
            setAction(null);
        }
    };

    const isLoading = isWritePending || isConfirming;

    // Generate placeholder image
    const placeholderImage = `https://placehold.co/600x400/3156c4/FFFFFF?text=${encodeURIComponent(offer.listing_title)}`;
    const imageUrl = offer.listing_image || placeholderImage;

    // Format offer amount (assuming it's in IDRX with 18 decimals as string)
    const formatAmount = (amount: string) => {
        const num = parseFloat(amount);
        return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    // Format timestamp
    const timeAgo = formatDistanceToNow(new Date(offer.created_at), { addSuffix: true });

    // Determine which address to show
    const displayAddress = type === 'sent' ? offer.seller_address : offer.buyer_address;
    const addressLabel = type === 'sent' ? 'Seller' : 'Offer from';

    return (
        <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6 items-center group hover:shadow-md transition-shadow ${isCompleted ? 'grayscale opacity-60' : ''}`}>
            {/* Image */}
            <div
                className="size-32 shrink-0 rounded-xl bg-center bg-cover overflow-hidden bg-gray-100 dark:bg-gray-700"
                style={{ backgroundImage: `url('${imageUrl}')` }}
            />

            {/* Content */}
            <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                    <Badge
                        variant={statusVariants[offer.status]}
                        size="sm"
                        className="text-[10px] font-black tracking-widest uppercase px-3 py-1"
                    >
                        {offer.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{timeAgo}</span>
                </div>
                <Link href={`/app/listings/${offer.listing_id}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
                        {offer.listing_title}
                    </h3>
                </Link>
                <p className="text-gray-500 text-sm">
                    {addressLabel} <span className="font-mono text-primary">{displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}</span>
                </p>
                {/* Debug info if needed, or if ID missing */}
                {!offer.on_chain_id && isPendingStatus && (
                    <p className="text-xs text-red-500">Syncing to blockchain...</p>
                )}
            </div>

            {/* Price */}
            <div className="text-center md:text-right space-y-1">
                <p className="text-2xl font-black text-primary">{formatAmount(offer.offer_amount)} IDRX</p>
                <p className="text-xs text-gray-400">~${(parseFloat(offer.offer_amount) * 0.000068).toFixed(2)} USD</p>
            </div>

            {/* Actions */}
            {isPendingStatus && (
                <div className="flex gap-2 shrink-0">
                    {type === 'received' ? (
                        <>
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<span className="material-symbols-outlined text-lg">check_circle</span>}
                                onClick={handleAccept}
                                disabled={isLoading || !offer.on_chain_id}
                                loading={isLoading && action === 'accept'}
                            >
                                {isLoading && action === 'accept' ? 'Accepting...' : 'Accept'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                onClick={handleReject}
                                disabled={isLoading || !offer.on_chain_id}
                                loading={isLoading && action === 'reject'}
                            >
                                {isLoading && action === 'reject' ? 'Rejecting...' : 'Reject'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                            onClick={handleCancel}
                            disabled={isLoading || !offer.on_chain_id}
                            loading={isLoading && action === 'cancel'}
                        >
                            {isLoading && action === 'cancel' ? 'Canceling...' : 'Cancel'}
                        </Button>
                    )}
                </div>
            )}

            {/* Accepted State for Buyer - Pay Button or View Transaction */}
            {isAccepted && type === 'sent' && (
                <div className="shrink-0 flex items-center gap-2">
                    {offer.escrow_state && offer.escrow_state !== 'created' ? (
                        <Link href={`/app/escrow/${offer.escrow_id}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<span className="material-symbols-outlined text-lg">visibility</span>}
                            >
                                View Transaction
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handlePay}
                            disabled={isLoading}
                            loading={isLoading && action === 'pay'}
                            leftIcon={<span className="material-symbols-outlined text-lg">payments</span>}
                        >
                            {isLoading && action === 'pay' ? 'Processing...' : 'Pay Now'}
                        </Button>
                    )}
                </div>
            )}

            {/* Accepted State for Seller */}
            {isAccepted && type === 'received' && (
                <div className="shrink-0 flex items-center gap-2">
                    {offer.escrow_id && (
                        <Link href={`/app/escrow/${offer.escrow_id}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<span className="material-symbols-outlined text-lg">visibility</span>}
                            >
                                View Transaction
                            </Button>
                        </Link>
                    )}
                </div>
            )}

            {isCompleted && (
                <div className="shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="cursor-not-allowed"
                    >
                        Closed
                    </Button>
                </div>
            )}
        </div>
    );
}
