import { useWriteContract } from 'wagmi';
import EscrowABI from '@/abis/Escrow.json';

// TODO: Replace with actual deployed address
const ESCROW_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useEscrow() {
    const { writeContract, isPending, isSuccess, error } = useWriteContract();

    const deposit = async (listingId: string | number) => {
        writeContract({
            address: ESCROW_ADDRESS,
            abi: EscrowABI,
            functionName: 'deposit',
            args: [BigInt(listingId)],
        });
    };

    return {
        deposit,
        isPending,
        isSuccess,
        error
    };
}
