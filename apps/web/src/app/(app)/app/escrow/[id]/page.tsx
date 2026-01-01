"use client";

import { useState } from "react";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { EscrowHeader } from "@/components/escrow/EscrowHeader";
import { EscrowStepper } from "@/components/escrow/EscrowStepper";
import { TransitionHold } from "@/components/escrow/TransitionHold";
import { LegalModule } from "@/components/escrow/LegalModule";
import { EscrowSidebar } from "@/components/escrow/EscrowSidebar";

// Step Components
import { Step0Funding } from "@/components/escrow/steps/Step0Funding";
import { Step1Deposit } from "@/components/escrow/steps/Step1Deposit";
import { Step2Handover } from "@/components/escrow/steps/Step2Handover";
import { Step3Verification } from "@/components/escrow/steps/Step3Verification";
import { Step4Confirmation } from "@/components/escrow/steps/Step4Confirmation";
import { Step5Released } from "@/components/escrow/steps/Step5Released";

export default function EscrowPage({ params }: { params: { id: string } }) {
    const [currentStep, setCurrentStep] = useState(3);

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <Step0Funding />;
            case 1: return <Step1Deposit />;
            case 2: return <Step2Handover />;
            case 3: return <Step3Verification />;
            case 4: return <Step4Confirmation />;
            case 5: return <Step5Released />;
            default: return <Step3Verification />;
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />

            <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-10">
                {/* Developer Controls (For Demo) */}
                <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2 overflow-x-auto">
                    <span className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase whitespace-nowrap px-2">Dev Controls:</span>
                    {[0, 1, 2, 3, 4, 5].map((step) => (
                        <button
                            key={step}
                            onClick={() => setCurrentStep(step)}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${currentStep === step
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-white dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 text-text-muted hover:text-text-main dark:hover:text-white"
                                }`}
                        >
                            {step === 0 ? "Funding" : `Step ${step}`}
                        </button>
                    ))}
                </div>

                {/* Transaction Header & Stepper */}
                <div className="mb-10 flex flex-col gap-8">
                    <EscrowHeader
                        transactionId={`Transaction #VLY-${params.id || "8842"}`}
                        status={
                            currentStep === 0 ? "Awaiting Deposit" :
                                currentStep === 1 ? "Deposit Verification" :
                                    currentStep === 2 ? "Asset Handover" :
                                        currentStep === 3 ? "Verification Active" :
                                            currentStep === 4 ? "Confirmation Pending" :
                                                "Funds Released"
                        }
                        startDate="Oct 24, 2023"
                        contractAddress="0x8f...3a21"
                    />
                    <EscrowStepper currentStep={currentStep} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Main Workspace (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Main Action Area */}
                        {renderStepContent()}

                        {/* Secondary Actions Grid (Only show relevant info cards) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TransitionHold />
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
