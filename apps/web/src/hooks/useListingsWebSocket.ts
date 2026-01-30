import { useEffect, useRef, useState } from 'react';
import { WS_URL } from '@/utils/constants';

type ListingEvent = {
    type: 'listing.create' | 'listing.update';
    data: any;
};

export function useListingsWebSocket() {
    const [lastEvent, setLastEvent] = useState<ListingEvent | null>(null);
    const ws = useRef<WebSocket | null>(null);



    useEffect(() => {
        // Use centralized WebSocket URL
        const wsUrl = WS_URL;

        // console.log(`Connecting to WebSocket: ${wsUrl}`);

        try {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                // console.log('WebSocket Connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    // console.log('WebSocket Message:', message);
                    setLastEvent(message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            ws.current.onclose = () => {
                // console.log('WebSocket Disconnected');
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
