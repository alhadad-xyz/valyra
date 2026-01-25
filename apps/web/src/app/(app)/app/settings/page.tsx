"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { SettingsConnections } from "@/components/settings/SettingsConnections";
import { SettingsNotifications } from "@/components/settings/SettingsNotifications";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";
import { Button } from "ui";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { address } = useAccount();
    const queryClient = useQueryClient();

    useEffect(() => {
        const googleLinked = searchParams.get("google_linked");
        const stripeLinked = searchParams.get("stripe_linked");

        if (googleLinked) {
            if (googleLinked === "success") {
                toast.success("Google account successfully linked!");
                queryClient.invalidateQueries({ queryKey: ['user-me'] });
            } else if (googleLinked === "error") {
                toast.error("Failed to link Google account: " + (searchParams.get("error") || "Unknown error"));
            }
            router.replace('/app/settings');
        }

        if (stripeLinked) {
            if (stripeLinked === "success") {
                toast.success("Stripe account successfully linked!");
                queryClient.invalidateQueries({ queryKey: ['user-me'] });
            } else if (stripeLinked === "error") {
                toast.error("Failed to link Stripe account: " + (searchParams.get("error") || "Unknown error"));
            }
            router.replace('/app/settings');
        }
    }, [searchParams, queryClient, router]);

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <MarketplaceHeader />

            <main className="flex-1 max-w-4xl mx-auto w-full py-10 px-6">
                <div className="mb-10">
                    <h2 className="text-3xl font-black tracking-tight mb-2 text-text-main dark:text-white">Settings</h2>
                    <p className="text-text-muted dark:text-gray-400 max-w-xl">
                        Manage your account connections, notification preferences, and viewing options.
                    </p>
                </div>

                <SettingsProfile />
                <SettingsConnections address={address} />
                <SettingsNotifications />

                <div className="pb-20"></div>
            </main>

            <Footer />
        </div>
    );
}
