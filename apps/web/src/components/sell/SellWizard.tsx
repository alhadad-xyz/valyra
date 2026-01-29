"use client";

import { FC } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useSellStore } from '../../stores/useSellStore';
import { StepBasicInfo } from './StepBasicInfo';
import { StepTech } from './StepTech';
import { StepFinancials } from './StepFinancials';
import { StepPricing } from './StepPricing';
import { StepIPAssignment } from './StepIPAssignment';
import { StepReview } from './StepReview';
import { Button } from 'ui';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSignMessage } from 'wagmi';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { SellStepper } from './SellStepper';
import { MARKETPLACE_ABI } from '@/abis/MarketplaceV1';
import { GenesisBadge } from '@/components/marketplace/GenesisBadge';
import { ListingPreview } from './ListingPreview';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

interface SellWizardProps {
    mode?: 'create' | 'edit';
    listingId?: string;
}

export const SellWizard: FC<SellWizardProps> = ({ mode = 'create', listingId }) => {
    const { step, nextStep, prevStep } = useSellStore();
    const { address } = useAccount();
    const router = useRouter(); // Import useRouter
    const [isSaving, setIsSaving] = useState(false);

    const { data: sellerStake } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'sellerStakes',
        args: address ? [address] : undefined,
    });

    const stakeAmount = sellerStake?.[1] ? formatUnits(sellerStake[1], 18) : '0';



    const [onChainId, setOnChainId] = useState<bigint | null>(null);
    const [originalPrice, setOriginalPrice] = useState<string | null>(null);

    // Fetch listing details for on-chain ID and original price
    useEffect(() => {
        if (!listingId) return;

        const fetchListing = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings/${listingId}`);
                if (!res.ok) throw new Error("Failed to fetch listing");
                const data = await res.json();

                if (data.on_chain_id !== undefined) {
                    setOnChainId(BigInt(data.on_chain_id));
                }
                if (data.asking_price) {
                    setOriginalPrice(data.asking_price.toString());
                }
            } catch (err) {
                console.error("Error fetching listing details:", err);
            }
        };

        fetchListing();
    }, [listingId]);

    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const { signMessageAsync } = useSignMessage();

    const handleSave = async () => {
        if (!listingId) return;
        setIsSaving(true);
        try {
            const state = useSellStore.getState();

            // Check if price changed
            const newPrice = parseFloat(state.price);
            const oldPrice = originalPrice ? parseFloat(originalPrice) : 0;
            const priceChanged = Math.abs(newPrice - oldPrice) > 0.000001; // Float comparison

            if (priceChanged && onChainId !== null) {
                // Execute on-chain update
                const newPriceWei = parseUnits(state.price, 18);

                const hash = await writeContractAsync({
                    address: MARKETPLACE_ADDRESS,
                    abi: MARKETPLACE_ABI,
                    functionName: 'updateListing',
                    args: [onChainId, "", newPriceWei]
                });

                toast.info("Price update transaction submitted. Waiting for confirmation...");

                if (!publicClient) throw new Error("Public client not available");
                await publicClient.waitForTransactionReceipt({ hash });

                toast.success("Price updated on-chain!");
            }

            // Generate valid signature
            if (!address) throw new Error("Wallet not connected");
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const message = `Login to Valyra at ${timestamp}`;
            const signature = await signMessageAsync({ message });

            const payload = {
                asset_name: state.title,
                description: state.description,
                business_url: state.websiteUrl,
                asset_type: state.assetType,
                asking_price: parseFloat(state.price),
                tech_stack: {
                    ...Object.fromEntries(state.techStack.map(t => [t, {}])),
                    repo_url: state.repoUrl
                },
                mrr: parseFloat(state.mrr),
                annual_revenue: parseFloat(state.annualRevenue),
                monthly_profit: parseFloat(state.monthlyProfit),
                monthly_expenses: parseFloat(state.monthlyExpenses),
                revenue_trend: state.revenueTrend,
                customer_count: parseInt(state.customerCount),
                domain_included: state.includeDomain,
                source_code_included: state.includeCode,
                customer_data_included: state.includeCustomerData,
                images: state.images,
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Wallet-Address': address,
                    'X-Signature': signature,
                    'X-Timestamp': timestamp
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Update failed:", errorData);
                throw new Error(`Failed to update listing: ${errorData}`);
            }

            router.push(`/app/listings/${listingId}`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Unable to save changes. Please try again or contact support.");
        } finally {
            setIsSaving(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <StepBasicInfo />;
            case 2: return <StepTech />;
            case 3: return <StepFinancials />;
            case 4: return <StepPricing />;
            case 5: return <StepIPAssignment />;
            case 6: return <StepReview mode={mode} onSave={handleSave} isSaving={isSaving} />;
            default: return <StepBasicInfo />;
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />

            <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-10">
                {/* Header & Stepper */}
                <div className="mb-10 flex flex-col gap-8">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white">
                                {mode === 'edit' ? 'Edit Listing' : 'Create New Listing'}
                            </h1>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                                {mode === 'edit' ? 'Editing' : 'Draft'}
                            </span>
                        </div>
                        <p className="text-text-muted text-sm font-medium">
                            {mode === 'edit' ? 'Update your listing details' : 'Sell your project securely with Valyra Escrow'}
                        </p>
                    </div>

                    <SellStepper currentStep={step} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Main Workspace (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {renderStep()}

                        <div className="flex justify-between pt-4">
                            <Button
                                variant="outline"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="px-6"
                            >
                                Back
                            </Button>

                            {step < 6 && (
                                <Button onClick={() => {
                                    const {
                                        step, title, description, websiteUrl,
                                        techStack, customerCount,
                                        mrr, annualRevenue, monthlyProfit, monthlyExpenses,
                                        price
                                    } = useSellStore.getState();

                                    let isValid = true;
                                    let errorMsg = "";

                                    if (step === 1) {
                                        if (!title || !description || !websiteUrl) {
                                            isValid = false;
                                            errorMsg = "Please complete the Title, Description, and Website URL fields.";
                                        }
                                    } else if (step === 2) {
                                        if (techStack.length === 0 || !customerCount) {
                                            isValid = false;
                                            errorMsg = "Please specify at least one Tech Stack item and the Customer Count.";
                                        }
                                    } else if (step === 3) {
                                        if (!mrr || !annualRevenue || !monthlyProfit || !monthlyExpenses) {
                                            isValid = false;
                                            errorMsg = "Please complete all fields in the Financials section.";
                                        }
                                    } else if (step === 4) {
                                        if (!price) {
                                            isValid = false;
                                            errorMsg = "Please specify a valid Listing Price.";
                                        }
                                    } else if (step === 5) {
                                        const { sellerSignature } = useSellStore.getState();
                                        // In edit mode, signature might already exist or need re-signing if critical fields changed
                                        // For now, enforce check if creating
                                        if (mode === 'create' && !sellerSignature) {
                                            isValid = false;
                                            errorMsg = "IP Assignment signature is required to proceed.";
                                        }
                                    }

                                    if (isValid) {
                                        nextStep();
                                    } else {
                                        toast.error(errorMsg);
                                    }
                                }} className="px-6">
                                    Next
                                </Button>
                            )}

                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                        {/* Seller Status Card */}
                        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <span className="material-symbols-outlined text-lg">verified</span>
                                </div>
                                <h3 className="font-bold text-lg text-text-main dark:text-white">Seller Status</h3>
                                <GenesisBadge className="ml-auto" showLabel={true} />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-muted">Status</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Active
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-muted">Staked Balance</span>
                                    <span className="text-sm font-bold text-text-main dark:text-white">{Number(stakeAmount).toLocaleString()} IDRX</span>
                                </div>
                            </div>
                        </div>

                        {/* Preview / Helper Card */}
                        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                            <h3 className="font-bold text-lg mb-4 text-text-main dark:text-white">Listing Preview</h3>
                            <ListingPreview />
                        </div>

                        {/* Support Card */}
                        <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-4 border border-primary/20">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">smart_toy</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-main dark:text-white">AI Broker Assistant</p>
                                <p className="text-xs text-text-muted">Need help with pricing?</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
