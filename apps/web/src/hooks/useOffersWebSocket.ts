import { useEffect, useRef } from 'react';
import { WS_URL } from '@/utils/constants';

type OfferEvent = {
    type: 'offer.created' | 'offer.accepted' | 'offer.rejected' | 'offer.cancelled';
    data: any;
};

export function useOffersWebSocket(onEvent?: (event: OfferEvent) => void) {
    const ws = useRef<WebSocket | null>(null);

    // Use ref to keep latest handler without triggering effect re-run
    const onEventRef = useRef(onEvent);

    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        // Use centralized WebSocket URL
        const wsUrl = WS_URL;

        // console.log(`[OffersWS] Connecting to: ${wsUrl}`);

        try {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                // console.log('[OffersWS] Connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type && message.type.startsWith('offer.')) {
                        // console.log('[OffersWS] Event:', message);
                        if (onEventRef.current) {
                            onEventRef.current(message);
                        }
                    }
                } catch (error) {
                    console.error('[OffersWS] Parse Error:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error(`[OffersWS] Error connecting to ${wsUrl}:`, error);
            };

            ws.current.onclose = () => {
                // console.log('[OffersWS] Disconnected');
            };
        } catch (err) {
            console.error('[OffersWS] Init Failed:', err);
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []); // Empty dependency array = Connect ONCE on mount
}
