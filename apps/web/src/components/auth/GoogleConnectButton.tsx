"use client";

import { Button } from "ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from '@/utils/constants';

interface GoogleConnectButtonProps {
    userId: string;
    isLinked?: boolean;
}

export const GoogleConnectButton = ({ userId, isLinked = false }: GoogleConnectButtonProps) => {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        try {
            setLoading(true);
            // Fetch the Google Auth URL from backend
            const response = await fetch(`${API_URL}/auth/google/login?user_id=${userId}`);
            if (!response.ok) throw new Error("Failed to get auth url");

            const data = await response.json();
            if (data.url) {
                // Redirect to Google
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Google Connect Error:", error);
            setLoading(false);
        }
    };

    return (
        <Button
            variant={isLinked ? "outline" : "primary"}
            onClick={handleConnect}
            disabled={loading || isLinked}
            className="w-full sm:w-auto"
        >
            {loading ? "Connecting..." : isLinked ? "Google Connected ✓" : "Connect Google Account"}
        </Button>
    );
};
