
import { useReadContract } from 'wagmi';
import { ESCROW_ABI } from '@/abis/EscrowV1';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as Address;

export enum EscrowState {
    CREATED = 0,
    FUNDED = 1,
    DELIVERED = 2,
    CONFIRMED = 3,
    TRANSITION = 4,
    DISPUTED = 5,
    RESOLVED = 6,
    COMPLETED = 7,
    REFUNDED = 8,
    EXPIRED = 9,
    EMERGENCY = 10
}

export enum EncryptionMethod {
    ECIES_WALLET = 0,
    EPHEMERAL_KEYPAIR = 1
}

export interface EscrowTransaction {
    id: bigint;
    listingId: bigint;
    buyer: Address;
    seller: Address;
    amount: bigint;
    platformFee: bigint;
    sellerPayout: bigint;
    depositedAt: bigint;
    handoverDeadline: bigint;
    verifyDeadline: bigint;
    credentialHash: `0x${string}`;
    state: EscrowState;
    encryptionMethod: EncryptionMethod;
    verifyExtensionUsed: boolean;
}

export interface TransitionHold {
    escrowId: bigint;
    retainedAmount: bigint;
    releaseTime: bigint;
    isReleased: boolean;
    isClaimed: boolean;
    assistanceNotes: string;
}

export function useEscrowDetails(escrowId?: bigint) {
    const { data: escrowData, isLoading: isEscrowLoading, refetch: refetchEscrow } = useReadContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'getEscrow',
        args: escrowId !== undefined ? [escrowId] : undefined,
        query: {
            enabled: !!escrowId
        }
    });

    const { data: transitionHoldData, isLoading: isTransitionLoading } = useReadContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'getTransitionHold',
        args: escrowId !== undefined ? [escrowId] : undefined,
        query: {
            enabled: !!escrowId
        }
    });

    // Fetch listing details if we have the listingId
    const listingId = escrowData ? escrowData.listingId.toString() : null;

    const { data: listing, isLoading: isListingLoading } = useQuery({
        queryKey: ['listing', listingId],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings/${listingId}`);
            if (!res.ok) throw new Error('Listing not found');
            return res.json();
        },
        enabled: !!listingId,
    });

    return {
        escrow: escrowData as EscrowTransaction | undefined,
        transitionHold: transitionHoldData as TransitionHold | undefined,
        listing,
        isLoading: isEscrowLoading || isTransitionLoading || isListingLoading,
        refetchEscrow
    };
}
