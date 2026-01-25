"use client";

import { Button } from "ui";
import { useState } from "react";

interface StripeConnectButtonProps {
    userId: string;
    isLinked?: boolean;
}

export const StripeConnectButton = ({ userId, isLinked = false }: StripeConnectButtonProps) => {
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        try {
            setLoading(true);
            // Fetch the Stripe Auth URL from backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/stripe/login?user_id=${userId}`);
            if (!response.ok) throw new Error("Failed to get auth url");

            const data = await response.json();
            if (data.url) {
                // Redirect to Stripe
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Stripe Connect Error:", error);
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
            {loading ? "Connecting..." : isLinked ? "Stripe Connected ✓" : "Connect Stripe"}
        </Button>
    );
};
