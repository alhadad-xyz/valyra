"use client";

import { GoogleConnectButton } from "@/components/auth/GoogleConnectButton";
import { StripeConnectButton } from "@/components/auth/StripeConnectButton";
import { Button } from "ui";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthSession } from "@/utils/authSession";
import { useState } from "react";

interface SettingsConnectionsProps {
    address?: string;
}

export function SettingsConnections({ address }: SettingsConnectionsProps) {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    const isGoogleConnected = !!user?.google_id;
    const isStripeConnected = !!user?.stripe_account_id;

    const handleDisconnect = async (provider: 'google' | 'stripe') => {
        if (!user) return;
        if (!confirm(`Are you sure you want to disconnect your ${provider} account?`)) return;

        setDisconnecting(provider);
        try {
            // Retrieve session
            const authSession = getAuthSession(user.wallet_address);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/disconnect`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-Wallet-Address": user.wallet_address,
                    "X-Signature": authSession?.signature || "",
                    "X-Timestamp": authSession?.timestamp || "",
                },
                body: JSON.stringify({ provider })
            });

            if (!res.ok) throw new Error("Failed to disconnect");

            await queryClient.invalidateQueries({ queryKey: ['user-me'] });
            toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected successfully`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to disconnect account");
        } finally {
            setDisconnecting(null);
        }
    };

    return (
        <section className="mb-12">
            <h2 className="text-xl font-bold mb-6 text-text-main dark:text-white">Connected Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Google Card */}
                <div className="bg-surface dark:bg-surface-dark p-6 rounded-xl border border-border dark:border-gray-800 shadow-sm flex flex-col justify-between group">
                    <div>
                        <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
                            <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"></path>
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"></path>
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"></path>
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                    fill="#EA4335"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-text-main dark:text-white">Google</h3>

                        <div className="flex items-center gap-1.5 mb-4">
                            {isGoogleConnected ? (
                                <>
                                    <span className="material-symbols-outlined text-green-500 text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check_circle</span>
                                    <span className="text-sm text-green-500 font-medium">Connected</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-text-muted text-sm">info</span>
                                    <span className="text-sm text-text-muted font-medium">Not Connected</span>
                                </>
                            )}
                        </div>

                        {!isGoogleConnected && (
                            <p className="text-xs text-text-muted dark:text-gray-400 leading-relaxed mb-6">Link your Google account for identity verification.</p>
                        )}
                    </div>

                    {!isGoogleConnected && (
                        address ? (
                            <GoogleConnectButton userId={address} /> // Pass address as userId logic
                        ) : (
                            <div className="text-sm text-yellow-600">Connect wallet first</div>
                        )
                    )}
                    {isGoogleConnected && (
                        <Button
                            variant="outline"
                            className="w-full text-sm font-bold border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/50"
                            onClick={() => handleDisconnect('google')}
                            loading={disconnecting === 'google'}
                            disabled={disconnecting === 'google'}
                        >
                            Disconnect
                        </Button>
                    )}
                </div>

                {/* GitHub Card */}
                <div className="bg-surface dark:bg-surface-dark p-6 rounded-xl border border-border dark:border-gray-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
                            <svg className="size-6 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-text-main dark:text-white">GitHub</h3>
                        <div className="flex items-center gap-1.5 mb-4">
                            <span className="material-symbols-outlined text-text-muted text-sm">info</span>
                            <span className="text-sm text-text-muted font-medium">Coming Soon</span>
                        </div>
                        <p className="text-xs text-text-muted dark:text-gray-400 leading-relaxed mb-6">Connect GitHub to display your developer reputation.</p>
                    </div>
                    <Button variant="outline" disabled className="w-full text-sm font-bold border-gray-200 dark:border-gray-800 text-gray-400">
                        Coming Soon
                    </Button>
                </div>

                {/* Stripe Card */}
                <div className={`bg-surface dark:bg-surface-dark p-6 rounded-xl border-2 ${isStripeConnected ? 'border-primary/40 dark:border-primary/30' : 'border-dashed border-gray-200 dark:border-gray-700'} shadow-sm flex flex-col justify-between`}>
                    <div>
                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 border border-primary/20">
                            <svg className="size-7 text-primary" fill="currentColor" viewBox="0 0 40 40">
                                <path d="M34.5 18.5h-29c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h29c1.1 0 2-.9 2-2v-10c0-1.1-.9-2-2-2zm-14.5 9c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm10.5-11.5v-3.5c0-4.1-3.4-7.5-7.5-7.5s-7.5 3.4-7.5 7.5v3.5h-3v-3.5c0-5.8 4.7-10.5 10.5-10.5s10.5 4.7 10.5 10.5v3.5h-3z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-text-main dark:text-white">Stripe Connect</h3>
                        <div className="flex items-center gap-1.5 mb-3">
                            {isStripeConnected ? (
                                <>
                                    <span className="material-symbols-outlined text-green-500 text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check_circle</span>
                                    <span className="text-sm text-green-500 font-medium">Connected</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-text-muted text-sm">info</span>
                                    <span className="text-sm text-text-muted font-medium">Not Connected</span>
                                </>
                            )}
                        </div>

                        {!isStripeConnected && (
                            <p className="text-xs text-text-muted dark:text-gray-400 leading-relaxed mb-6">Connect Stripe to receive payouts and manage your revenue dashboard.</p>
                        )}
                    </div>
                    {isStripeConnected ? (
                        <Button
                            variant="outline"
                            className="w-full text-sm font-bold border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/50"
                            onClick={() => handleDisconnect('stripe')}
                            loading={disconnecting === 'stripe'}
                            disabled={disconnecting === 'stripe'}
                        >
                            Disconnect
                        </Button>
                    ) : (
                        address ? (
                            <StripeConnectButton userId={address} />
                        ) : (
                            <div className="text-sm text-yellow-600">Connect wallet first</div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}
