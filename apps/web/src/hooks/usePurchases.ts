import { useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useCallback } from 'react';
import { getAuthSession, setAuthSession } from '@/utils/authSession';
import { Listing } from '@/types/listing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PurchasedListing extends Listing {
    purchase_price: number;
    purchase_date: string;
}

export function usePurchases() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const fetchPurchases = useCallback(async (): Promise<PurchasedListing[]> => {
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

        const response = await fetch(`${API_URL}/users/me/purchases`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Wallet-Address': address,
                'X-Signature': signature || '',
                'X-Timestamp': timestamp || '',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch purchases');
        return response.json();
    }, [address, signMessageAsync]);

    return useQuery({
        queryKey: ['user-purchases', address],
        queryFn: fetchPurchases,
        enabled: !!address,
        retry: 1,
    });
}
