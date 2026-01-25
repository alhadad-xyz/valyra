
const AUTH_STORAGE_KEY = 'valyra_auth_session';

interface AuthSession {
    address: string;
    signature: string;
    timestamp: string;
}

export const getAuthSession = (currentAddress: string): AuthSession | null => {
    if (!currentAddress) return null;

    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) return null;

        const session: AuthSession = JSON.parse(stored);

        // Ensure session matches current wallet address
        if (session.address.toLowerCase() !== currentAddress.toLowerCase()) {
            clearAuthSession();
            return null;
        }

        // Check expiry (24 hours - matching backend)
        const sessionTime = parseInt(session.timestamp);
        const now = Math.floor(Date.now() / 1000);
        if (now - sessionTime > 86400) {
            clearAuthSession();
            return null;
        }

        return session;
    } catch (e) {
        return null;
    }
};

export const setAuthSession = (session: AuthSession) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
};
