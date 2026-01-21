"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthSession } from "@/utils/authSession";

export function SettingsNotifications() {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const [updating, setUpdating] = useState(false);

    // Local state for immediate UI feedback
    const [emailOffer, setEmailOffer] = useState(true);
    const [emailStatus, setEmailStatus] = useState(true);
    const [marketing, setMarketing] = useState(true);

    // Sync local state with user data
    useEffect(() => {
        if (user) {
            setEmailOffer(user.email_on_offer === 1);
            setEmailStatus(user.email_on_status === 1);
            setMarketing(user.marketing_drops === 1);
        }
    }, [user]);

    const handleUpdate = async (field: string, value: boolean) => {
        if (!user) return;

        // Optimistic update
        if (field === "email_on_offer") setEmailOffer(value);
        if (field === "email_on_status") setEmailStatus(value);
        if (field === "marketing_drops") setMarketing(value);

        setUpdating(true);
        try {
            const authSession = getAuthSession(user.wallet_address);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-Wallet-Address": user.wallet_address,
                    "X-Signature": authSession?.signature || "",
                    "X-Timestamp": authSession?.timestamp || "",
                },
                body: JSON.stringify({
                    [field]: value ? 1 : 0
                })
            });

            if (!response.ok) throw new Error("Failed to update settings");

            await queryClient.invalidateQueries({ queryKey: ['user-me'] });
            toast.success("Preferences updated");
        } catch (error) {
            console.error("Failed to update preferences:", error);
            toast.error("Failed to update preferences");
            // Revert on error
            if (user) {
                if (field === "email_on_offer") setEmailOffer(user.email_on_offer === 1);
                if (field === "email_on_status") setEmailStatus(user.email_on_status === 1);
                if (field === "marketing_drops") setMarketing(user.marketing_drops === 1);
            }
        } finally {
            setUpdating(false);
        }
    };

    if (!user) return null;

    return (
        <section className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-gray-800 shadow-sm overflow-hidden mb-12">
            <div className="p-6 border-b border-border dark:border-gray-800">
                <h3 className="text-xl font-bold text-text-main dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-text-muted dark:text-gray-400">Control how and when you receive marketplace updates.</p>
            </div>
            <div className="divide-y divide-border dark:divide-gray-800">
                {/* Toggle Row 1 */}
                <div className="p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted">
                            <span className="material-symbols-outlined">local_offer</span>
                        </div>
                        <div>
                            <p className="font-bold text-text-main dark:text-white">Email on New Offer</p>
                            <p className="text-xs text-text-muted dark:text-gray-400">Receive an email immediately when someone makes an offer on your NFTs.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={emailOffer}
                            onChange={(e) => handleUpdate("email_on_offer", e.target.checked)}
                            disabled={updating}
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {/* Toggle Row 2 */}
                <div className="p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted">
                            <span className="material-symbols-outlined">analytics</span>
                        </div>
                        <div>
                            <p className="font-bold text-text-main dark:text-white">Email on Status Changes</p>
                            <p className="text-xs text-text-muted dark:text-gray-400">Get notified about order fulfillment, metadata updates, or transfer completions.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={emailStatus}
                            onChange={(e) => handleUpdate("email_on_status", e.target.checked)}
                            disabled={updating}
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {/* Toggle Row 3 */}
                <div className="p-6 flex items-center justify-between hover:bg-background-light dark:hover:bg-gray-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted">
                            <span className="material-symbols-outlined">campaign</span>
                        </div>
                        <div>
                            <p className="font-bold text-text-main dark:text-white">Marketing & Drops</p>
                            <p className="text-xs text-text-muted dark:text-gray-400">Be the first to know about curated drops and exclusive community events.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={marketing}
                            onChange={(e) => handleUpdate("marketing_drops", e.target.checked)}
                            disabled={updating}
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </section>
    );
}
