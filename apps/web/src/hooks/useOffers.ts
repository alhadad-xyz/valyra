import { useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { useCallback } from 'react';
import { getAuthSession, setAuthSession } from '@/utils/authSession';

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Offer {
    id: string;
    listing_id: string;
    listing_on_chain_id?: number | null;
    escrow_on_chain_id?: number | null;
    escrow_id?: string | null;
    escrow_state?: string | null;
    listing_title: string;
    listing_image: string | null;
    buyer_address: string;
    seller_address: string;
    offer_amount: string;
    earnest_deposit: string;
    on_chain_id?: string;
    status: OfferStatus;
    created_at: string;
    updated_at: string;
    expires_at: string;
}

interface OffersStats {
    totalSent: number;
    totalReceived: number;
    pending: number;
    accepted: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useOffers() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const fetchOffers = useCallback(async (endpoint: string): Promise<Offer[]> => {
        if (!address) {
            throw new Error('Wallet not connected');
        }

        // Try to get existing session
        let session = getAuthSession(address);
        let signature = session?.signature;
        let timestamp = session?.timestamp;

        // If no valid session, sign and create new one
        if (!session) {
            timestamp = Math.floor(Date.now() / 1000).toString();
            const message = `Login to Valyra at ${timestamp}`;

            try {
                signature = await signMessageAsync({ message });
                // Save session
                setAuthSession({
                    address,
                    signature,
                    timestamp
                });
            } catch (err) {
                console.error('Failed to sign authentication message:', err);
                throw new Error('Authentication signature required');
            }
        }

        if (!signature || !timestamp) {
            throw new Error('Authentication credentials missing');
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-Wallet-Address': address,
                'X-Signature': signature,
                'X-Timestamp': timestamp,
            },
        });

        if (response.status === 401) {
            // If 401, session might be invalid/expired on backend -> clear and retry (simplified: user will need to refresh for now)
            localStorage.removeItem('valyra_auth_session');
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch offers: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to fetch offers: ${response.statusText}`);
        }

        return response.json();
    }, [address, signMessageAsync]);

    // Fetch sent offers
    const {
        data: sentOffers = [],
        isLoading: isSentLoading,
        error: sentError,
    } = useQuery({
        queryKey: ['offers-sent', address],
        queryFn: () => fetchOffers('/offers/me'),
        enabled: !!address,
        retry: 1,
    });

    // Fetch received offers
    const {
        data: receivedOffers = [],
        isLoading: isReceivedLoading,
        error: receivedError,
    } = useQuery({
        queryKey: ['offers-received', address],
        queryFn: () => fetchOffers('/offers/received'),
        enabled: !!address,
        retry: 1,
    });

    const isLoading = isSentLoading || isReceivedLoading;
    const error = sentError || receivedError;

    // Calculate stats
    const allOffers = [...sentOffers, ...receivedOffers];
    const stats: OffersStats = {
        totalSent: sentOffers.length,
        totalReceived: receivedOffers.length,
        pending: allOffers.filter(o => o.status === 'PENDING').length,
        accepted: allOffers.filter(o => o.status === 'ACCEPTED').length,
    };

    return {
        sent: sentOffers,
        received: receivedOffers,
        isLoading,
        error,
        stats,
        allOffers,
    };
}
