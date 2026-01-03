/**
 * Hook to automatically track listing views after user engagement.
 * Tracks after 3 seconds to avoid counting quick bounces.
 */
import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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
