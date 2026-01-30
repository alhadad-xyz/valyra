import { useEffect, useRef } from 'react';

type EscrowEventType =
    | 'escrow.created'
    | 'escrow.funded'
    | 'escrow.confirmed'
    | 'escrow.disputed'
    | 'escrow.resolved'
    | 'escrow.completed'
    | 'escrow.extended';

export type EscrowRealtimeEvent = {
    type: EscrowEventType;
    data: any;
};

export function useEscrowWebSocket(onEvent?: (event: EscrowRealtimeEvent) => void) {
    const ws = useRef<WebSocket | null>(null);

    // Use ref to keep latest handler without triggering effect re-run
    const onEventRef = useRef(onEvent);

    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        // Determine WebSocket URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

        // Robust construction
        let baseUrl = apiUrl.replace(/\/$/, '').replace(/\/api\/v1$/, '');
        const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
        const wsBaseUrl = baseUrl.replace(/^https?/, wsProtocol);

        const wsUrl = `${wsBaseUrl}/ws/listings`; // reusing endpoint

        // console.log(`[EscrowWS] Connecting to: ${wsUrl}`);

        try {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                // console.log('[EscrowWS] Connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type && message.type.startsWith('escrow.')) {
                        // console.log('[EscrowWS] Event:', message);
                        if (onEventRef.current) {
                            onEventRef.current(message);
                        }
                    }
                } catch (error) {
                    console.error('[EscrowWS] Parse Error:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error(`[EscrowWS] Connection Error:`, error);
            };

            ws.current.onclose = () => {
                // console.log('[EscrowWS] Disconnected');
            };
        } catch (err) {
            console.error('[EscrowWS] Init Failed:', err);
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []); // Empty dependency array = Connect ONCE on mount
}
