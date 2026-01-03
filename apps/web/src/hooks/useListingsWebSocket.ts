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
        // If NEXT_PUBLIC_API_URL is set, replace http/https with ws/wss
        // Otherwise default to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
        let wsUrl = apiUrl.replace(/^http/, 'ws').replace(/\/api\/v1$/, '');
        wsUrl = `${wsUrl}/ws/listings`;

        console.log(`Connecting to WebSocket: ${wsUrl}`);

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

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    return lastEvent;
}
