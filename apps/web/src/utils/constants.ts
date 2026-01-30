export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Derived Constants for WebSockets and Base URL
const apiBase = API_URL.replace(/\/$/, '').replace(/\/api\/v1$/, '');
const wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
export const WS_BASE_URL = apiBase.replace(/^https?/, wsProtocol);
export const WS_URL = `${WS_BASE_URL}/ws/listings`;

export const ITEMS_PER_PAGE = 10;
