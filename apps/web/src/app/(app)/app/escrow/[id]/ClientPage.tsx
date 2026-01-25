"use client";

import { useState } from "react";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { EscrowHeader } from "@/components/escrow/EscrowHeader";
import { EscrowStepper } from "@/components/escrow/EscrowStepper";
import { TransitionHold } from "@/components/escrow/TransitionHold";
import { LegalModule } from "@/components/escrow/LegalModule";
import { EscrowSidebar } from "@/components/escrow/EscrowSidebar";
import { useQuery } from '@tanstack/react-query';
import { Button } from "ui";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

// Step Components
import { Step0Funding } from "@/components/escrow/steps/Step0Funding";
import { Step1Deposit } from "@/components/escrow/steps/Step1Deposit";
import { Step2Handover } from "@/components/escrow/steps/Step2Handover";
import { Step3Verification } from "@/components/escrow/steps/Step3Verification";
import { Step4Confirmation } from "@/components/escrow/steps/Step4Confirmation";
import { Step5Released } from "@/components/escrow/steps/Step5Released";

export function EscrowClientPage({ id }: { id: string }) {
    const router = useRouter();
    const { address } = useAccount();

    const { data: escrow, isLoading, error, refetch } = useQuery({
        queryKey: ['escrow', id],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/escrow/${id}`);
            if (!res.ok) throw new Error('Escrow not found');
            return res.json();
        },
        refetchInterval: 5000 // Poll every 5s for updates
    });

    const getStepFromState = (state: string): number => {
        switch (state) {
            case 'created': return 0;
            case 'funded': return 2; // Funded -> Handover Phase
            case 'delivered': return 3; // Delivered -> Verification Phase
            case 'confirmed': return 4;
            case 'completed': return 5;
            case 'disputed': return 3; // Show verification/dispute
            case 'resolved': return 4;
            default: return 0;
        }
    };

    const currentStep = escrow ? getStepFromState(escrow.escrow_state) : 0;

    // Determine user role
    const userRole: 'buyer' | 'seller' | 'viewer' = !address
        ? 'viewer'
        : escrow?.buyer?.toLowerCase() === address.toLowerCase()
            ? 'buyer'
            : escrow?.seller?.toLowerCase() === address.toLowerCase()
                ? 'seller'
                : 'viewer';

    const renderStepContent = () => {
        if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Escrow Details...</div>;
        if (error) return (
            <div className="p-8 text-center">
                <h3 className="text-xl font-bold text-red-500">Error Loading Escrow</h3>
                <p className="text-gray-500">ID: {id}</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/app')}>Back to Dashboard</Button>
            </div>
        );

        switch (currentStep) {
            case 0: return <Step0Funding />;
            case 1: return <Step1Deposit />;
            case 2: return <Step2Handover escrowId={id} userRole={userRole} escrow={escrow} onUploadComplete={() => { console.log('Refreshing...'); refetch(); }} />;
            case 3: return <Step3Verification escrowId={id} userRole={userRole} escrow={escrow} />;
            case 4: return <Step4Confirmation escrowId={id} userRole={userRole} escrow={escrow} />;
            case 5: return <Step5Released />;
            default: return <Step2Handover escrowId={id} userRole={userRole} escrow={escrow} onUploadComplete={() => refetch()} />;
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />

            <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-10">
                {/* Transaction Header & Stepper */}
                <div className="mb-10 flex flex-col gap-8">
                    <EscrowHeader
                        transactionId={`Transaction #VLY-${id.slice(0, 8)}`}
                        status={escrow?.escrow_state?.toUpperCase() || "LOADING..."}
                        startDate={escrow?.created_at ? new Date(escrow.created_at).toLocaleDateString() : "Loading..."}
                        contractAddress={escrow?.contract_address || "Loading..."}
                    />
                    <EscrowStepper currentStep={currentStep} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Main Workspace (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Main Action Area */}
                        {renderStepContent()}

                        {/* Secondary Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TransitionHold escrowId={id} userRole={userRole} escrow={escrow} />
                            <LegalModule />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                        <EscrowSidebar />

                        {/* Support Card */}
                        <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-4 border border-primary/20">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">smart_toy</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-main dark:text-white">AI Broker Assistant</p>
                                <p className="text-xs text-text-muted">Active and monitoring transaction</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
