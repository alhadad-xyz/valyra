import Link from 'next/link';
import { Button, Badge } from 'ui';
import { Offer, OfferStatus } from '@/hooks/useOffers';
import { formatDistanceToNow } from 'date-fns';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract } from 'wagmi';
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

    // Watch for transaction completion
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash
    });

    useEffect(() => {
        if (writeError) {
            setAction(null);
            toast.error(`Unable to complete transaction: ${writeError.message}`);
        }
    }, [writeError]);

    useEffect(() => {
        if (isSuccess && action === 'accept') {
            setAction(null);
            toast.success("Offer accepted. Redirecting to transaction details...", { duration: 3000 });
            // For accept, we still rely on indexer to create the escrow link, 
            // but we can try to reload or just give it a moment.
            setTimeout(() => window.location.reload(), 2000);
        }
    }, [isSuccess, action]);


    const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;

    const handleAccept = async () => {
        if (!offer.on_chain_id) {
            toast.error("Offer synchronization error. Please try again later.");
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
            toast.error("Offer synchronization error. Please try again later.");
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
                toast.loading("Processing rejection on-chain...", { id: 'reject-offer' });
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
                        toast.success("Offer successfully rejected.", { id: 'reject-offer' });
                    } catch (e) {
                        toast.success("Rejection confirmed. Synchronizing data...", { id: 'reject-offer' });
                    }
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    toast.error("Transaction unable to complete.", { id: 'reject-offer' });
                    setAction(null);
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Unable to reject offer");
            setAction(null);
        }
    };


    const handleCancel = async () => {
        if (!offer.on_chain_id) {
            toast.error("Offer synchronization error. Please try again later.");
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
                toast.loading("Processing cancellation on-chain...", { id: 'cancel-offer' });
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
                        toast.success("Offer successfully cancelled.", { id: 'cancel-offer' });
                    } catch (e) {
                        toast.success("Cancellation confirmed. Synchronizing data...", { id: 'cancel-offer' });
                    }
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    toast.error("Transaction unable to complete.", { id: 'cancel-offer' });
                    setAction(null);
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Unable to cancel offer.");
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
                    {(() => {
                        // 1. Fetch Real-time State
                        const { data: escrowData } = useReadContract({
                            address: ESCROW_CONTRACT,
                            abi: ESCROW_ABI,
                            functionName: 'getEscrow',
                            args: offer.escrow_on_chain_id ? [BigInt(offer.escrow_on_chain_id)] : undefined,
                            query: {
                                enabled: !!offer.escrow_on_chain_id,
                                staleTime: 5000 // refresh every 5s
                            }
                        });

                        // Map contract state (number) to string
                        const stateMap = ['CREATED', 'FUNDED', 'DELIVERED', 'CONFIRMED', 'TRANSITION', 'DISPUTED', 'RESOLVED', 'COMPLETED', 'REFUNDED', 'EXPIRED'];

                        // Access state property
                        const contractStateVal = escrowData ? (escrowData as any).state : undefined;
                        const contractStateIdx = contractStateVal !== undefined ? Number(contractStateVal) : -1;

                        const liveState = contractStateIdx >= 0 ? stateMap[contractStateIdx] : null;

                        // Use live state if available, else backend
                        const rawState = liveState || offer.escrow_state;

                        // 2. Determine Display Status
                        const isAcceptedWithEscrow = offer.status === 'ACCEPTED' && rawState;
                        const statusToUse = isAcceptedWithEscrow ? rawState : offer.status;

                        // 3. Map to Friendly Label (Consistent with EscrowPage)
                        const labelMap: Record<string, string> = {
                            'CREATED': 'Created',
                            'FUNDED': 'Funded',
                            'DELIVERED': 'Delivered',
                            'CONFIRMED': 'Verified',
                            'TRANSITION': 'Transition',
                            'DISPUTED': 'Disputed',
                            'RESOLVED': 'Resolved',
                            'COMPLETED': 'Released',
                            'REFUNDED': 'Refunded',
                            'PENDING': 'Pending',
                            'ACCEPTED': 'Accepted',
                            'REJECTED': 'Rejected',
                            'EXPIRED': 'Expired'
                        };

                        const label = labelMap[statusToUse.toUpperCase()] || statusToUse;

                        // 4. Determine Variant
                        let variant: "warning" | "success" | "error" | "neutral" = "neutral";
                        if (isAcceptedWithEscrow) {
                            switch (statusToUse.toUpperCase()) {
                                case 'FUNDED':
                                case 'DELIVERED':
                                case 'TRANSITION':
                                    variant = 'warning';
                                    break;
                                case 'CONFIRMED':
                                case 'COMPLETED':
                                case 'RESOLVED':
                                    variant = 'success';
                                    break;
                                case 'DISPUTED':
                                    variant = 'error';
                                    break;
                                default:
                                    variant = 'neutral';
                            }
                        } else {
                            variant = statusVariants[offer.status] || 'neutral';
                        }

                        return (
                            <Badge
                                variant={variant}
                                size="sm"
                                className="text-[10px] font-black tracking-widest uppercase px-3 py-1"
                            >
                                {label}
                            </Badge>
                        );
                    })()}
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
                    {offer.escrow_id && (
                        <Link href={`/app/escrow/${offer.escrow_id}`}>
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<span className="material-symbols-outlined text-lg">visibility</span>}
                            >
                                View Transaction
                            </Button>
                        </Link>
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
