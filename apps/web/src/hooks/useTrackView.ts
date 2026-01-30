/**
 * Hook to automatically track listing views after user engagement.
 * Tracks after 3 seconds to avoid counting quick bounces.
 */
import { useEffect } from 'react';
import { API_URL } from '@/utils/constants';



export function useTrackView(listingId: string | undefined) {
    useEffect(() => {
        if (!listingId) return;

        // Track view after 3 seconds (to avoid counting quick bounces)
        const timer = setTimeout(async () => {
            try {
                await fetch(`${API_URL}/listings/${listingId}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            } catch (error) {
                // Silent fail - view tracking shouldn't block user experience
                console.debug('View tracking failed:', error);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [listingId]);
}
