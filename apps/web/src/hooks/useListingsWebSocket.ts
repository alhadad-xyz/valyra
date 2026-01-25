import { useEffect, useRef, useState } from 'react';

type ListingEvent = {
    type: 'listing.create' | 'listing.update';
    data: any;
};

export function useListingsWebSocket() {
    const [lastEvent, setLastEvent] = useState<ListingEvent | null>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Determine WebSocket URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

        // Robust construction:
        // 1. Remove trailing slash if present
        // 2. Remove /api/v1 suffix if present (to get base URL)
        // 3. Replace protocol
        let baseUrl = apiUrl.replace(/\/$/, '').replace(/\/api\/v1$/, '');
        const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
        const wsBaseUrl = baseUrl.replace(/^https?/, wsProtocol);

        const wsUrl = `${wsBaseUrl}/ws/listings`;

        console.log(`Connecting to WebSocket: ${wsUrl}`);

        try {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log('WebSocket Connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket Message:', message);
                    setLastEvent(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            ws.current.onclose = () => {
                console.log('WebSocket Disconnected');
            };
        } catch (err) {
            console.error('Failed to initialize WebSocket:', err);
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    return lastEvent;
}
