import { useReadContract } from 'wagmi';
import { MARKETPLACE_ABI } from '@/abis/MarketplaceV1';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

export const useGenesisCheck = (address?: string) => {
    const { data: isGenesis, isLoading, error } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'isGenesisSeller',
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
            staleTime: 1000 * 60 * 60, // Cache for 1 hour
        }
    });

    return {
        isGenesis: !!isGenesis,
        isLoading,
        error
    };
};
