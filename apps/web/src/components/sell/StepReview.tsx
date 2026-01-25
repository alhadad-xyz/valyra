import { FC, useState, useEffect } from 'react';
import { Button } from 'ui';
import { useSellStore } from '../../stores/useSellStore';
import { useWriteContract, useWaitForTransactionReceipt, useSignMessage, useAccount } from 'wagmi';
import { MARKETPLACE_ABI } from '@/abis/MarketplaceV1';
import { useRouter } from 'next/navigation';
import { parseEther } from 'viem';
import { toast } from 'sonner';

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

interface StepReviewProps {
    mode?: 'create' | 'edit';
    onSave?: () => void;
    isSaving?: boolean;
}

export const StepReview: FC<StepReviewProps> = ({ mode = 'create', onSave, isSaving = false }) => {
    const router = useRouter();
    const {
        title, description, websiteUrl, assetType,
        includeDomain, includeCode, includeCustomerData,
        techStack, customerCount, repoUrl,
        mrr, annualRevenue, monthlyProfit, monthlyExpenses, revenueTrend,
        price, verificationLevel,
        ipAssignmentHash, sellerSignature,
        reset
    } = useSellStore();

    const { writeContractAsync, data: hash, isPending } = useWriteContract();
    const { signMessageAsync } = useSignMessage();
    const { address } = useAccount();
    const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });
    const [createdListingUUID, setCreatedListingUUID] = useState<string | null>(null);
    const [isIndexing, setIsIndexing] = useState(false);

    // Watch for success and extract Listing ID from logs, then poll for UUID
    useEffect(() => {
        if (isSuccess && receipt && !createdListingUUID && !isIndexing) {
            const extractAndPoll = async () => {
                try {
                    const listingLog = receipt.logs.find(log => log.topics.length === 3);

                    if (listingLog && listingLog.topics[1]) {
                        const idHex = listingLog.topics[1];
                        const onChainId = parseInt(idHex, 16).toString();
                        console.log("On-Chain Listing ID:", onChainId);

                        setIsIndexing(true);

                        // Poll API for UUID
                        let attempts = 0;
                        const maxAttempts = 20; // 40 seconds approx

                        const poll = setInterval(async () => {
                            attempts++;
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings?on_chain_id=${onChainId}`);
                                if (res.ok) {
                                    const data = await res.json();
                                    if (data && data.length > 0) {
                                        const uuid = data[0].id;
                                        setCreatedListingUUID(uuid);
                                        setIsIndexing(false);
                                        clearInterval(poll);
                                        console.log("Found Listing UUID:", uuid);

                                        // Auto-redirect to view listing
                                        reset();
                                        router.push(`/app/listings/${uuid}`);
                                    }
                                }
                            } catch (err) {
                                console.error("Polling error:", err);
                            }

                            if (attempts >= maxAttempts) {
                                setIsIndexing(false);
                                clearInterval(poll);
                            }
                        }, 2000);
                    }
                } catch (e) {
                    console.error("Failed to parse listing ID from logs", e);
                    setIsIndexing(false);
                }
            };
            extractAndPoll();
        }
    }, [isSuccess, receipt, createdListingUUID, isIndexing]);

    const handleCreateListing = async () => {
        try {
            console.log("Creating Listing:", { title, price, ipAssignmentHash });

            // 1. Create Draft Listing in Backend to store rich metadata
            // The indexer will link this via title + seller address
            const draftPayload = {
                asset_name: title,
                asset_type: assetType.toLowerCase(),
                business_url: websiteUrl,
                description: description,
                asking_price: parseFloat(price),
                tech_stack: {
                    ...techStack.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}),
                    repo_url: repoUrl
                },
                customer_count: parseInt(customerCount || "0"),
                build_id: "build-v1.0",
                mrr: parseFloat(mrr || "0"),
                annual_revenue: parseFloat(annualRevenue || "0"),
                monthly_profit: parseFloat(monthlyProfit || "0"),
                monthly_expenses: parseFloat(monthlyExpenses || "0"),
                revenue_trend: revenueTrend.toLowerCase(),
                domain_included: includeDomain,
                source_code_included: includeCode,
                customer_data_included: includeCustomerData,
                ip_assignment_hash: ipAssignmentHash,
                seller_signature: sellerSignature
            };

            // 1. Generate Auth Signature (Stateless)
            if (!address) throw new Error("Wallet not connected");

            const timestamp = Math.floor(Date.now() / 1000).toString();
            const message = `Login to Valyra at ${timestamp}`;

            // Sign the auth message
            // Sign the auth message
            console.log("Requesting Auth Signature...");
            let signature;
            try {
                signature = await signMessageAsync({ message });
                console.log("Signature received:", signature?.substring(0, 10) + "...");
            } catch (signErr) {
                console.error("Signing failed or rejected:", signErr);
                throw signErr;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Wallet-Address': address,
                'X-Signature': signature,
                'X-Timestamp': timestamp
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings/`, {
                method: 'POST',
                headers,
                body: JSON.stringify(draftPayload)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error(`Failed to create draft: Status ${res.status} ${res.statusText}`, errText);

                let errData;
                try {
                    errData = JSON.parse(errText);
                } catch (e) {
                    errData = { detail: errText };
                }

                console.error("Parsed Error Data:", errData);

                let errorMessage = "Failed to save listing details.";
                if (errData.detail) {
                    if (typeof errData.detail === 'string') {
                        errorMessage = errData.detail;
                    } else if (Array.isArray(errData.detail)) {
                        // Handle Pydantic validation errors
                        errorMessage = errData.detail.map((e: any) => `${e.loc.join('.')} - ${e.msg}`).join(', ');
                    }
                }

                throw new Error(errorMessage);
            }

            console.log("Draft created successfully");

            // 2. Proceed with Blockchain Transaction
            // Convert Price to Wei
            const priceWei = parseEther(price || '0');

            // Map Verification Level to Enum (0=BASIC, 1=STANDARD, 2=ENHANCED)
            const levelMap = { 'BASIC': 0, 'STANDARD': 1, 'ENHANCED': 2 };
            const levelEnum = levelMap[verificationLevel as keyof typeof levelMap] || 0;

            // Construct Metadata (legacy/backup for IPFS)
            const metadata = JSON.stringify({
                description,
                websiteUrl,
                assetType,
                financials: { mrr, annualRevenue, monthlyProfit },
                assets: { includeDomain, includeCode, includeCustomerData }
            });

            // Ensure we have IP signature
            if (!ipAssignmentHash || !sellerSignature) {
                console.error("Missing signatures:", { ipAssignmentHash, sellerSignature });
                toast.error("Missing IP Assignment Signature. Please go back and sign.");
                return;
            }

            const txArgs = [
                title,
                metadata, // ipfsMetadata
                priceWei,
                levelEnum,
                ipAssignmentHash as `0x${string}`,
                sellerSignature as `0x${string}`,
                "build-v1.0" // buildId placeholder
            ] as const;

            await writeContractAsync({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: 'createListing',
                args: txArgs
            });
        } catch (error: unknown) {
            console.error("Listing creation error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to create listing";
            toast.error(errorMessage);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-white dark:bg-background-dark-elevated rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-[48px]">check_circle</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">Listing Created Successfully!</h2>
                    <p className="text-text-muted">Your project is now live on Valyra Marketplace.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => { reset(); router.push('/app/dashboard'); }}
                        variant="outline"
                        disabled={isIndexing}
                    >
                        My Listings
                    </Button>
                    <Button
                        disabled={isIndexing || !createdListingUUID}
                        loading={isIndexing}
                        onClick={() => {
                            reset();
                            if (createdListingUUID) {
                                router.push(`/app/listings/${createdListingUUID}`);
                            } else {
                                // Redirect to My Listings
                                router.push('/app/listings');
                            }
                        }}
                    >
                        {isIndexing ? "Indexing..." : "View Listing Detail"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">fact_check</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">Final Review</h3>
                            <p className="text-text-muted text-sm">Confirm your project details before listing.</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6 space-y-8">

                        {/* Basic Info Section */}
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Basic Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Title</h3>
                                    <p className="font-semibold text-text-main dark:text-white">{title || "Untitled"}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Asset Type</h3>
                                    <p className="font-semibold text-text-main dark:text-white capitalize">{assetType}</p>
                                </div>
                                <div className="col-span-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">URL</h3>
                                    <p className="font-medium text-primary break-all">{websiteUrl || "No URL"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Description
                            </h4>
                            <p className="text-sm text-text-muted whitespace-pre-line leading-relaxed">
                                {description || "No description provided."}
                            </p>
                        </div>

                        {/* Included Assets */}
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Included Assets
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {includeDomain && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Domain</span>}
                                {includeCode && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Source Code</span>}
                                {includeCustomerData && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Customer Data</span>}
                                {!includeDomain && !includeCode && !includeCustomerData && <span className="text-text-muted text-sm italic">None selected</span>}
                            </div>
                        </div>

                        {/* Tech & Stats */}
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Tech & Stats
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Tech Stack</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {techStack.length > 0 ? techStack.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium border border-gray-200 dark:border-gray-700">
                                                {tag}
                                            </span>
                                        )) : <span className="text-text-muted text-sm italic">None</span>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Users</h3>
                                    <p className="font-semibold text-text-main dark:text-white">{customerCount ? parseInt(customerCount).toLocaleString() : "0"} Customers</p>
                                </div>
                            </div>
                        </div>

                        {/* Financials Section */}
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Financials
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">MRR</h3>
                                    <p className="font-mono font-bold text-text-main dark:text-white">${mrr || "0"}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Ann. Rev</h3>
                                    <p className="font-mono font-bold text-text-main dark:text-white">${annualRevenue || "0"}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Profit/Mo</h3>
                                    <p className="font-mono font-bold text-green-600">${monthlyProfit || "0"}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Expenses/Mo</h3>
                                    <p className="font-mono font-bold text-red-500">${monthlyExpenses || "0"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Pricing
                            </h4>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Asking Price</h3>
                                <p className="font-semibold text-2xl text-primary">{price || "0"} IDRX</p>
                            </div>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                                Legal Check
                            </h4>
                            <div className="flex items-center gap-2">
                                {ipAssignmentHash ? (
                                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                        IP Assignment Signed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        IP Assignment Missing
                                    </span>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>



            {mode !== 'edit' ? (
                <Button
                    size="lg"
                    fullWidth
                    className="shadow-lg shadow-primary/25 font-bold text-lg"
                    onClick={handleCreateListing}
                    disabled={isPending || isConfirming}
                    loading={isPending || isConfirming}
                >
                    {isPending || isConfirming ? (isConfirming ? "Confirming on-chain..." : "Waiting for Approval...") : "Publish Listing"}
                </Button>
            ) : (
                <Button
                    size="lg"
                    fullWidth
                    className="shadow-lg shadow-primary/25 font-bold text-lg"
                    onClick={onSave}
                    loading={isSaving}
                    disabled={isSaving}
                >
                    Update Listing
                </Button>
            )}
        </div>
    );
};
