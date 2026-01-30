import { useEffect, useRef } from 'react';

type OfferEvent = {
    type: 'offer.created' | 'offer.accepted' | 'offer.rejected' | 'offer.cancelled';
    data: any;
};

export function useOffersWebSocket(onEvent?: (event: OfferEvent) => void) {
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Determine WebSocket URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

        // Robust construction (same as existing hook)
        let baseUrl = apiUrl.replace(/\/$/, '').replace(/\/api\/v1$/, '');
        const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
        const wsBaseUrl = baseUrl.replace(/^https?/, wsProtocol);

        const wsUrl = `${wsBaseUrl}/ws/listings`; // We reuse the single WS endpoint

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
                        if (onEvent) {
                            onEvent(message);
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
    }, [onEvent]);
}
