import { useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useCallback } from 'react';
import { getAuthSession, setAuthSession } from '@/utils/authSession';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserProfile {
    id: string;
    wallet_address: string;
    basename?: string;
    email?: string;
    google_id?: string;
    stripe_account_id?: string;
    verification_level: string;
    reputation_score: number;
    created_at: string;
    email_on_offer?: number;
    email_on_status?: number;
    marketing_drops?: number;
}

export function useUser() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const fetchUser = useCallback(async (): Promise<UserProfile> => {
        if (!address) throw new Error('Wallet not connected');

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
                console.error(err);
                throw new Error('Authentication failed');
            }
        }

        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Wallet-Address': address,
                'X-Signature': signature || '',
                'X-Timestamp': timestamp || '',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch user profile');
        return response.json();
    }, [address, signMessageAsync]);

    return useQuery({
        queryKey: ['user-me', address],
        queryFn: fetchUser,
        enabled: !!address,
        retry: 1,
    });
}
