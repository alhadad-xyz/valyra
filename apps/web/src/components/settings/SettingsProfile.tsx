"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthSession } from "@/utils/authSession";
import { Button } from "ui";

export function SettingsProfile() {
    const { data: user } = useUser();
    const queryClient = useQueryClient();
    const [updating, setUpdating] = useState(false);

    // Form state
    const [basename, setBasename] = useState("");
    const [email, setEmail] = useState("");

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setBasename(user.basename || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setUpdating(true);
        try {
            const authSession = getAuthSession(user.wallet_address);

            // Construct payload (only include fields if they have values or are explicitly cleared)
            // But UserUpdate allows optional, so we can send both.
            // Backend validation: basename min 2.

            const payload: any = {};
            if (basename) payload.basename = basename;
            if (email) payload.email = email;

            // If user clears the input, should we send empty string or null? 
            // Pydantic schema expects Optional[str]. 
            // If we want to allow clearing, we might need to send null.
            if (basename === "") payload.basename = null; // Or handle as empty string if backend allows? Schema says min_length=2. So null is better if empty.
            if (email === "") payload.email = null;

            // Wait, if I clear basename, length 0 < 2. So I must send None/null if I want to remove it.
            // But JSON.stringify(null) is 'null'.

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-Wallet-Address": user.wallet_address,
                    "X-Signature": authSession?.signature || "",
                    "X-Timestamp": authSession?.timestamp || "",
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update profile");
            }

            await queryClient.invalidateQueries({ queryKey: ['user-me'] });
            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Failed to update profile:", error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const hasChanges = user && (basename !== (user.basename || "") || email !== (user.email || ""));

    if (!user) return null;

    return (
        <section className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-gray-800 shadow-sm overflow-hidden mb-12">
            <div className="p-6 border-b border-border dark:border-gray-800">
                <h3 className="text-xl font-bold text-text-main dark:text-white">Profile Settings</h3>
                <p className="text-sm text-text-muted dark:text-gray-400">Manage your public display information.</p>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basename Input */}
                    <div className="space-y-2">
                        <label htmlFor="basename" className="text-sm font-bold text-text-main dark:text-white">
                            Basename / Display Name
                        </label>
                        <input
                            id="basename"
                            type="text"
                            value={basename}
                            onChange={(e) => setBasename(e.target.value)}
                            placeholder="e.g. Satoshi"
                            className="w-full px-4 py-2 rounded-lg border border-border dark:border-gray-700 bg-background-light dark:bg-gray-800/50 text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        />
                        <p className="text-xs text-text-muted dark:text-gray-500">
                            Min 2 characters. This name will be displayed on your profile and listings.
                        </p>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-bold text-text-main dark:text-white">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2 rounded-lg border border-border dark:border-gray-700 bg-background-light dark:bg-gray-800/50 text-text-main dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                        />
                        <p className="text-xs text-text-muted dark:text-gray-500">
                            Used for notifications regarding your offers and listings.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        loading={updating}
                        disabled={!hasChanges || updating}
                        className="px-6"
                    >
                        Save Changes
                    </Button>
                </div>
            </form>
        </section>
    );
}
