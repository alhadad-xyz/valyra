import { useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useCallback } from 'react';
import { getAuthSession, setAuthSession } from '@/utils/authSession';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserStats {
    total_spent: number;
    total_earned: number;
    trust_score: number;
}

export function useUserStats() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const fetchStats = useCallback(async (): Promise<UserStats> => {
        if (!address) {
            throw new Error('Wallet not connected');
        }

        // Auth Logic (Reused from useOffers - ideally extract to a helper)
        let session = getAuthSession(address);
        let signature = session?.signature;
        let timestamp = session?.timestamp;

        if (!session) {
            timestamp = Math.floor(Date.now() / 1000).toString();
            const message = `Login to Valyra at ${timestamp}`;
            try {
                signature = await signMessageAsync({ message });
                setAuthSession({ address, signature, timestamp });
            } catch (err) {
                console.error('Failed to sign:', err);
                throw new Error('Authentication signature required');
            }
        }

        if (!signature || !timestamp) throw new Error('Auth failed');

        const response = await fetch(`${API_URL}/users/me/stats`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Wallet-Address': address,
                'X-Signature': signature,
                'X-Timestamp': timestamp,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    }, [address, signMessageAsync]);

    return useQuery({
        queryKey: ['user-stats', address],
        queryFn: fetchStats,
        enabled: !!address,
    });
}
