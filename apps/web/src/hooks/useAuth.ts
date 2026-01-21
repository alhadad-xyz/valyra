import { useAccount, useSignMessage } from 'wagmi';
import { useCallback } from 'react';
import { getAuthSession, setAuthSession } from '@/utils/authSession';

export function useAuth() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const getAuthHeaders = useCallback(async () => {
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

        return {
            'Content-Type': 'application/json',
            'X-Wallet-Address': address,
            'X-Signature': signature,
            'X-Timestamp': timestamp,
        };
    }, [address, signMessageAsync]);

    return { getAuthHeaders };
}
