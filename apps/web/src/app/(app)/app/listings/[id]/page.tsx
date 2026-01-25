"use client";

import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";
import { useAccount, useWriteContract, useSignMessage, usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, use, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { ESCROW_ABI } from "@/abis/EscrowV1";
import { ERC20_ABI } from "@/abis/ERC20";
import { parseUnits, decodeEventLog } from "viem";
import { RevenueChart } from "@/components/listing/RevenueChart";
import { formatCurrency } from "@/utils/format";
import { Button, Badge, Card, Tabs, TabsList, TabsTrigger, TabsContent } from "ui";
import { useValuation } from "@/hooks/useValuation";
import { OfferModal } from "@/components/listing/OfferModal";
import { ListingChat } from "@/components/listing/ListingChat";
import { toast } from "sonner";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isConnected } = useAccount();
    const router = useRouter();
    const { writeContractAsync, isPending } = useWriteContract();
    const publicClient = usePublicClient();


    // Fetch Listing Data
    const { data: listing, isLoading, error } = useQuery({
        queryKey: ['listing', id],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings/${id}`);
            if (!res.ok) {
                throw new Error('Listing not found');
            }
            return res.json();
        },
        retry: false,
        refetchInterval: (query) => {
            const data = query.state.data as any;
            // Refetch if on_chain_id is null/undefined, but stop if 0 (valid) or other value
            return data && !data.on_chain_id && data.on_chain_id !== 0 ? 2000 : false;
        }
    });

    // Fetch AI Valuation (only if listing is loaded and has revenue)
    const revenue = listing?.annual_revenue ? Number(listing.annual_revenue) : 0;
    const { data: valuation, isLoading: isValuationLoading } = useValuation(
        {
            revenue: revenue,
            growth_rate: listing?.revenue_trend === 'growing' ? 0.5 : listing?.revenue_trend === 'stable' ? 0 : -0.1,
            industry: listing?.asset_type || 'other',
            description: listing?.description || '',
        },
        !!listing && revenue > 0 // Only fetch when listing is available AND has revenue
    );

    // Fetch Verification Records
    const { data: verificationData, isLoading: isVerificationLoading } = useQuery({
        queryKey: ['verification', id],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/listings/${id}/verification`);
            if (!res.ok) {
                throw new Error('Failed to fetch verification data');
            }
            return res.json();
        },
        enabled: !!listing,
        retry: false
    });

    // Fetch Seller Profile
    const { data: sellerProfile, isLoading: isSellerLoading } = useQuery({
        queryKey: ['seller', listing?.seller_id],
        queryFn: async () => {
            if (!listing?.seller_id) return null;
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/users/${listing.seller_id}/profile`);
            if (!res.ok) {
                throw new Error('Failed to fetch seller profile');
            }
            return res.json();
        },
        enabled: !!listing?.seller_id,
        retry: false
    });

    const [buyStatus, setBuyStatus] = useState<'idle' | 'approving' | 'approved' | 'buying' | 'success' | 'error'>('idle');
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    const { signMessageAsync } = useSignMessage();
    const { address } = useAccount();

    // Check for existing offer on this listing
    const { data: existingOffer, isLoading: isCheckingExistingOffer } = useQuery({
        queryKey: ['existing-offer', listing?.id, address],
        queryFn: async () => {
            if (!address || !listing?.id) return null;

            // Get auth session
            const { getAuthSession, setAuthSession } = await import('@/utils/authSession');
            let session = getAuthSession(address);
            let signature = session?.signature;
            let timestamp = session?.timestamp;

            if (!session) {
                timestamp = Math.floor(Date.now() / 1000).toString();
                const message = `Login to Valyra at ${timestamp}`;
                try {
                    signature = await signMessageAsync({ message });
                    setAuthSession({ address, signature, timestamp });
                } catch (err) {
                    console.error('Auth failed:', err);
                    return null;
                }
            }

            if (!signature || !timestamp) return null;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/offers/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Wallet-Address': address,
                    'X-Signature': signature,
                    'X-Timestamp': timestamp,
                }
            });
            if (!res.ok) {
                console.log('Offers API failed:', res.status);
                return null;
            }
            const data = await res.json();
            console.log('Fetched offers:', data);
            console.log('Current listing ID:', listing.id);
            if (!Array.isArray(data)) {
                console.log('Data is not an array');
                return null;
            }
            const foundOffer = data.find((offer: any) => {
                const isMatch = offer.listing_id === listing.id;
                // Only consider it an "existing offer" if it's not rejected or expired (cancelled)
                const isActive = offer.status === 'PENDING' || offer.status === 'ACCEPTED';
                return isMatch && isActive;
            });
            console.log('Found existing offer:', foundOffer);
            return foundOffer || null;
        },
        enabled: !!address && !!listing?.id,
        retry: false,
        placeholderData: null
    });

    // Safety: Close offer modal if user is seller
    useEffect(() => {
        if (address && sellerProfile?.wallet_address && address.toLowerCase() === sellerProfile.wallet_address.toLowerCase()) {
            if (isOfferModalOpen) {
                console.warn("Closing Offer Modal: Identify as Seller");
                setIsOfferModalOpen(false);
            }
        }
    }, [address, sellerProfile, isOfferModalOpen]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="animate-pulse text-xl font-bold text-gray-400">Loading Listing...</div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen flex flex-col">
                <MarketplaceHeader />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">404</h1>
                        <p className="text-xl text-gray-500 mb-8">Listing not found</p>
                        <Button
                            onClick={() => router.push('/app')}
                            variant="primary"
                        >
                            Back to Marketplace
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Helper to extract image or use placeholder
    const image = listing.tech_stack?.images?.[0] || `https://placehold.co/600x400/0052FF/FFFFFF?text=${encodeURIComponent(listing.asset_name)}`;
    const isVerified = (listing.verified_level || 0) > 0;
    // Treat null/undefined as syncing, but 0 is a valid ID
    const isSyncing = !listing.on_chain_id && listing.on_chain_id !== 0;

    const priceFormatted = formatCurrency(listing.asking_price);

    const handleBuyNow = async () => {
        if (!isConnected) {
            router.push('/connect-wallet');
            return;
        }

        try {
            setBuyStatus('approving');

            const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_TOKEN_ADDRESS as `0x${string}`;
            const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;

            if (!ESCROW_CONTRACT) {
                toast.error("Escrow contract address not configured!");
                return;
            }

            const priceWei = parseUnits(listing.asking_price, 18);

            await writeContractAsync({
                address: IDRX_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [ESCROW_CONTRACT, priceWei]
            });

            setBuyStatus('approved');
            setBuyStatus('buying');

            const hash = await writeContractAsync({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'depositFunds',
                args: [BigInt(listing.on_chain_id || 0), priceWei, 0]
            });

            setBuyStatus('buying');

            if (!publicClient) {
                throw new Error("Public Client not initialized");
            }

            // Wait for transaction
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // Find EscrowCreated event
            let escrowId = null;

            for (const log of receipt.logs) {
                try {
                    if (log.address.toLowerCase() === ESCROW_CONTRACT.toLowerCase()) {
                        const event = decodeEventLog({
                            abi: ESCROW_ABI,
                            data: log.data,
                            topics: log.topics,
                            eventName: 'EscrowCreated'
                        });

                        if (event.eventName === 'EscrowCreated') {
                            escrowId = (event.args as any).escrowId.toString();
                            break;
                        }
                    }
                } catch (e) {
                    continue; // Not our event or decoding failed
                }
            }

            if (escrowId) {
                setBuyStatus('success');
                router.push(`/app/escrow/${escrowId}`);
            } else {
                setBuyStatus('success');
                toast.warning("Purchase successful but could not redirect to Escrow automatically. Please check your dashboard.");
            }

        } catch (e: any) {
            console.error(e);
            setBuyStatus('error');
            toast.error(e.message || "Transaction failed");
        }
    };



    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-text-main antialiased">
            <MarketplaceHeader />

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 md:px-8 lg:px-20 xl:px-40">
                <div className="mx-auto max-w-7xl">
                    {/* Breadcrumbs */}
                    <nav className="mb-6 flex flex-wrap gap-2 text-sm">
                        <a className="text-text-muted hover:text-text-main transition-colors" href="/app">Marketplace</a>
                        <span className="text-text-muted">/</span>
                        <a className="text-text-muted hover:text-text-main transition-colors" href="#">{listing.asset_type}</a>
                        <span className="text-text-muted">/</span>
                        <span className="font-medium text-text-main">{listing.asset_name}</span>
                    </nav>

                    {/* Page Heading & Actions */}
                    <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-black leading-tight tracking-tight text-text-main md:text-5xl">
                                {listing.asset_name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                {isVerified && (
                                    <Badge variant="success" icon={<span className="material-symbols-outlined text-[14px]">verified</span>}>
                                        Verified
                                    </Badge>
                                )}
                                {listing.revenue_trend && (
                                    <Badge
                                        variant={listing.revenue_trend === 'growing' ? 'info' : listing.revenue_trend === 'stable' ? 'neutral' : 'warning'}
                                        icon={<span className="material-symbols-outlined text-[14px]">{listing.revenue_trend === 'growing' ? 'trending_up' : listing.revenue_trend === 'stable' ? 'trending_flat' : 'trending_down'}</span>}
                                    >
                                        {listing.revenue_trend === 'growing' ? 'Growing' : listing.revenue_trend === 'stable' ? 'Stable' : 'Declining'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Column (Content) */}
                        <div className="flex flex-col gap-10 lg:col-span-8">

                            {/* Media Gallery */}
                            <div className="flex flex-col gap-4">
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm border border-[#e6e6db]">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url('${image}')` }}
                                    ></div>
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button className="flex size-10 items-center justify-center rounded-full bg-white/90 text-text-main backdrop-blur hover:bg-white">
                                            <span className="material-symbols-outlined">fullscreen</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Thumbnails */}
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                    <button className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border-2 border-primary">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url('${image}')` }}
                                        ></div>
                                    </button>
                                </div>
                            </div>

                            {/* Tabs & Content */}
                            <Tabs defaultValue="ai_analysis" className="flex flex-col gap-8">
                                {/* Tab Nav */}
                                <div className="sticky top-[72px] z-30 flex w-full overflow-x-auto border-b border-[#e6e6db] bg-background-light/95 pb-1 pt-2 backdrop-blur dark:bg-background-dark/95">
                                    <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
                                        <TabsTrigger value="description" className="px-6 data-[state=active]:border-primary data-[state=active]:text-text-main">
                                            Description
                                        </TabsTrigger>
                                        <TabsTrigger value="ai_analysis" className="px-6 data-[state=active]:border-primary data-[state=active]:text-text-main">
                                            AI Analysis
                                        </TabsTrigger>
                                        <TabsTrigger value="verification" className="px-6 data-[state=active]:border-primary data-[state=active]:text-text-main">
                                            Verification
                                        </TabsTrigger>
                                        <TabsTrigger value="tech_stack" className="px-6 data-[state=active]:border-primary data-[state=active]:text-text-main">
                                            Tech Stack
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Tab Content Wrapper */}
                                <div>
                                    <TabsContent value="description">
                                        <div className="prose prose-stone max-w-none text-text-main">
                                            <h3 className="text-xl font-bold">About this Asset</h3>
                                            <p className="text-text-muted leading-relaxed whitespace-pre-line">{listing.description}</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="ai_analysis">
                                        <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#e6e6db] dark:bg-surface-dark">
                                            <div className="flex items-center justify-between">
                                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                                    Valyra AI Assessment
                                                </h3>
                                                <Badge variant="warning" className="px-3 py-1 text-xs">Updated recently</Badge>
                                            </div>
                                            <div className="grid gap-6 md:grid-cols-2">
                                                {/* Fair Value */}
                                                <div className="flex flex-col gap-6">
                                                    <div className="rounded-xl bg-[#f8f8f5] p-5 dark:bg-background-dark">
                                                        <div className="mb-2 text-sm font-medium text-text-muted">Estimated Fair Value Range</div>
                                                        {isValuationLoading ? (
                                                            <div className="animate-pulse">
                                                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                                                                <div className="h-2 bg-gray-200 rounded w-full"></div>
                                                            </div>
                                                        ) : valuation ? (
                                                            <>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-3xl font-black tracking-tight text-text-main">
                                                                        {formatCurrency(valuation.valuation_range.min)} - {formatCurrency(valuation.valuation_range.max)}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#e6e6db]">
                                                                    <div
                                                                        className="h-full rounded-full bg-primary"
                                                                        style={{ width: `${Math.min(100, (parseFloat(listing.asking_price) / valuation.valuation_range.max) * 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="mt-2 flex justify-between text-xs text-text-muted">
                                                                    <span>Undervalued</span>
                                                                    <span>Fair</span>
                                                                    <span>Overvalued</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-sm text-text-muted">Valuation unavailable</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    {/* Confidence Score */}
                                                    <div className="flex items-center justify-between rounded-xl border border-[#e6e6db] p-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-text-muted">Confidence Score</span>
                                                            {isValuationLoading ? (
                                                                <div className="animate-pulse h-6 bg-gray-200 rounded w-16 mt-1"></div>
                                                            ) : valuation ? (
                                                                <span className="text-2xl font-black text-text-main">{Math.round(valuation.confidence * 100)}/100</span>
                                                            ) : (
                                                                <span className="text-2xl font-black text-text-main">--</span>
                                                            )}
                                                        </div>
                                                        <div className="relative flex size-12 items-center justify-center rounded-full border-4 border-[#e6e6db] border-t-primary border-r-primary">
                                                            <span className="material-symbols-outlined text-green-600">check</span>
                                                        </div>
                                                    </div>
                                                    {/* Risk Assessment */}
                                                    <div className="flex items-center justify-between rounded-xl border border-[#e6e6db] p-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-text-muted">Risk Profile</span>
                                                            {isValuationLoading ? (
                                                                <div className="animate-pulse h-5 bg-gray-200 rounded w-20 mt-1"></div>
                                                            ) : valuation ? (
                                                                <span className="text-lg font-bold text-text-main">
                                                                    {valuation.confidence > 0.8 ? 'Low Risk' : valuation.confidence > 0.5 ? 'Medium Risk' : 'High Risk'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-lg font-bold text-text-main">Unknown</span>
                                                            )}
                                                        </div>
                                                        <span className="material-symbols-outlined text-3xl" style={{ color: valuation && valuation.confidence > 0.8 ? '#10b981' : valuation && valuation.confidence > 0.5 ? '#f59e0b' : '#ef4444' }}>shield_lock</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Revenue Chart Integration */}
                                            {listing.revenue_history && listing.revenue_history.length > 0 && (
                                                <div className="mt-6 border-t border-[#e6e6db] pt-6">
                                                    <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">Revenue History</h4>
                                                    <RevenueChart data={listing.revenue_history} />
                                                </div>
                                            )}

                                            {/* Guardrails */}
                                            <div className="border-t border-[#e6e6db] pt-6 mt-6">
                                                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-muted">AI Guardrails & Audits</h4>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div className="flex items-start gap-3 rounded-lg border border-transparent bg-green-50 p-3 hover:border-green-200">
                                                        <span className="material-symbols-outlined text-green-600">code</span>
                                                        <div>
                                                            <div className="text-sm font-bold text-text-main">Code Quality</div>
                                                            <div className="text-xs text-text-muted">No critical vulnerabilities found.</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 rounded-lg border border-transparent bg-green-50 p-3 hover:border-green-200">
                                                        <span className="material-symbols-outlined text-green-600">payments</span>
                                                        <div>
                                                            <div className="text-sm font-bold text-text-main">Revenue Reality</div>
                                                            <div className="text-xs text-text-muted">Stripe data verified.</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="verification">
                                        <div className="rounded-2xl border border-[#e6e6db] bg-white p-6 dark:bg-surface-dark">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold">Verification Proofs</h3>
                                            </div>
                                            {isVerificationLoading ? (
                                                <div className="space-y-3">
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="animate-pulse flex items-center justify-between rounded-lg bg-[#f8f8f5] p-3 dark:bg-background-dark">
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-8 rounded-full bg-gray-300"></div>
                                                                <div className="h-4 w-40 bg-gray-300 rounded"></div>
                                                            </div>
                                                            <div className="size-5 rounded-full bg-gray-300"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : verificationData && verificationData.records && verificationData.records.length > 0 ? (
                                                <div className="space-y-3">
                                                    {verificationData.records.map((record: any) => {
                                                        const isVerified = record.status === 'verified';
                                                        const iconMap: Record<string, { icon: string, color: string, label: string }> = {
                                                            'oauth_stripe': { icon: 'attach_money', color: '#635bff', label: 'Stripe OAuth Connected' },
                                                            'github_repo': { icon: 'terminal', color: '#000000', label: 'GitHub Repository Access' },
                                                            'dns': { icon: 'dns', color: '#4285f4', label: 'DNS Verification' },
                                                            'build_id': { icon: 'fingerprint', color: '#ea4335', label: 'Build ID Verified' },
                                                            'oauth_analytics': { icon: 'analytics', color: '#fbbc04', label: 'Analytics Connected' },
                                                            'email_domain': { icon: 'email', color: '#34a853', label: 'Email Domain Verified' },
                                                            'revenue_manual': { icon: 'verified', color: '#16a34a', label: 'Manual Revenue Verification' },
                                                            'identity': { icon: 'badge', color: '#0ea5e9', label: 'Identity Verified' },
                                                            'repo_snapshot': { icon: 'folder_zip', color: '#64748b', label: 'Code Snapshot Secure' },
                                                        };
                                                        const meta = iconMap[record.verification_type] || { icon: 'verified', color: '#666', label: record.verification_type };

                                                        return (
                                                            <div key={record.id} className="flex items-center justify-between rounded-lg bg-[#f8f8f5] p-3 dark:bg-background-dark">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex size-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: meta.color }}>
                                                                        <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                                                                    </div>
                                                                    <span className="font-medium">{meta.label}</span>
                                                                </div>
                                                                <span className={`material-symbols-outlined ${isVerified ? 'text-green-600' : 'text-gray-400'}`}>
                                                                    {isVerified ? 'verified' : 'pending'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-text-muted">
                                                    <span className="material-symbols-outlined text-4xl mb-2">shield</span>
                                                    <p>No verification records found for this listing.</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="tech_stack">
                                        <div className="rounded-2xl border border-[#e6e6db] bg-white p-6 dark:bg-surface-dark">
                                            <h3 className="text-lg font-bold mb-4">Tech Stack</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.keys(listing.tech_stack || {}).filter(key => key !== 'repo_url').map(tag => (
                                                    <Badge key={tag} variant="neutral">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>

                            {/* Questions / Chat */}
                            <div className="flex flex-col gap-6 mt-4">
                                <h3 className="text-xl font-bold text-text-main">Questions & Answers</h3>
                                <ListingChat />
                            </div>

                        </div>

                        {/* Right Column (Sticky Actions) */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 flex flex-col gap-6">
                                {/* Price Card */}
                                <Card padding="none" className="overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#e6e6db] dark:bg-surface-dark">
                                    <div className="p-6">
                                        <div className="mb-6">
                                            <span className="text-sm font-medium text-text-muted">Current Price</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-text-main">{priceFormatted}</span>
                                                <span className="text-sm font-medium text-text-muted">≈ ${parseFloat(listing.asking_price).toLocaleString()} USD</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            {isSyncing || isSellerLoading || isCheckingExistingOffer ? (
                                                <div className="flex flex-col gap-3 w-full animate-pulse">
                                                    <div className="h-12 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="h-12 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                                                </div>
                                            ) : address && sellerProfile?.wallet_address && address.toLowerCase() === sellerProfile.wallet_address.toLowerCase() ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                                                        <span className="material-symbols-outlined text-xl">person</span>
                                                        <span>You are the owner of this listing</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        fullWidth
                                                        size="lg"
                                                        onClick={() => router.push(`/app/listings/${id}/edit`)}
                                                        leftIcon={<span className="material-symbols-outlined">edit</span>}
                                                    >
                                                        Edit Listing
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    {console.log('Rendering buttons, existingOffer:', existingOffer)}
                                                    {!existingOffer && (
                                                        <Button
                                                            variant="primary"
                                                            fullWidth
                                                            size="lg"
                                                            onClick={handleBuyNow}
                                                            disabled={buyStatus === 'success' || buyStatus === 'approving' || buyStatus === 'buying' || isPending}
                                                            className="py-4 text-base font-bold text-text-main"
                                                            rightIcon={<span className="material-symbols-outlined text-lg">arrow_forward</span>}
                                                        >
                                                            {buyStatus === 'idle' && 'Buy Now'}
                                                            {buyStatus === 'approving' && 'Approving IDRX...'}
                                                            {buyStatus === 'approved' && 'Confirm Purchase...'}
                                                            {buyStatus === 'buying' && 'Purchasing...'}
                                                            {buyStatus === 'success' && 'Purchase Successful!'}
                                                            {buyStatus === 'error' && 'Retry Purchase'}
                                                        </Button>
                                                    )}
                                                    {existingOffer ? (
                                                        <Button
                                                            variant="outline"
                                                            fullWidth
                                                            size="lg"
                                                            className="border-primary/20 text-primary hover:bg-primary/5"
                                                            onClick={() => router.push('/app/offers')}
                                                            leftIcon={<span className="material-symbols-outlined">visibility</span>}
                                                        >
                                                            View Your Offer
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            fullWidth
                                                            size="lg"
                                                            className="border-text-main/10 text-text-main hover:bg-[#f5f5f0]"
                                                            onClick={() => setIsOfferModalOpen(true)}
                                                            disabled={isSyncing}
                                                        >
                                                            Make Offer
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {buyStatus === 'success' && (
                                            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg text-sm text-center">
                                                <p className="font-bold">Transaction Confirmed!</p>
                                                <p className="text-xs mt-1">Funds held in Escrow.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Seller Card */}
                                <Card className="shadow-sm dark:bg-surface-dark">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {isSellerLoading ? (
                                                <div className="size-14 rounded-full bg-gray-200 animate-pulse"></div>
                                            ) : (
                                                <div className="size-14 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-white">
                                                    {sellerProfile?.basename?.charAt(0).toUpperCase() || (sellerProfile?.wallet_address ? sellerProfile.wallet_address.slice(2, 4).toUpperCase() : 'U')}
                                                </div>
                                            )}
                                            <span className="absolute bottom-0 right-0 block size-3.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-1">
                                                {isSellerLoading ? (
                                                    <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                                                ) : (
                                                    <h3 className="font-bold text-text-main truncate max-w-[150px]" title={sellerProfile?.wallet_address}>
                                                        {sellerProfile?.basename || (sellerProfile?.wallet_address ? `${sellerProfile.wallet_address.slice(0, 6)}...${sellerProfile.wallet_address.slice(-4)}` : 'Unknown Seller')}
                                                    </h3>
                                                )}
                                                {sellerProfile?.verification_level && sellerProfile.verification_level !== 'none' && (
                                                    <span className="material-symbols-outlined text-[16px] text-blue-500" title="Verified Seller">verified</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-muted">
                                                {isSellerLoading ? (
                                                    <span className="inline-block h-3 w-32 bg-gray-200 animate-pulse rounded mt-1"></span>
                                                ) : (
                                                    `Joined ${sellerProfile?.created_at ? new Date(sellerProfile.created_at).getFullYear() : '2023'} • ${sellerProfile?.reputation_score || 0} Rep`
                                                )}
                                            </p>
                                        </div>
                                        {(!address || !sellerProfile?.wallet_address || address.toLowerCase() !== sellerProfile.wallet_address.toLowerCase()) && (
                                            <Button variant="ghost" size="sm" className="ml-auto text-primary">
                                                Chat
                                            </Button>
                                        )}
                                    </div>
                                </Card>

                                {/* Safety Card */}
                                <Card padding="sm" className="p-5 shadow-sm dark:bg-surface-dark">
                                    <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">Safety & Trust</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined mt-0.5 text-primary bg-black rounded-full p-1 text-[16px]">lock</span>
                                            <div>
                                                <p className="text-sm font-bold text-text-main">Escrow Protected</p>
                                                <p className="text-xs text-text-muted">Funds held in smart contract until transfer confirmed.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined mt-0.5 text-primary bg-black rounded-full p-1 text-[16px]">security</span>
                                            <div>
                                                <p className="text-sm font-bold text-text-main">Code Audited</p>
                                                <p className="text-xs text-text-muted">Smart contracts verified by CertiK.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 border-t border-[#e6e6db] pt-3 text-center">
                                        <a className="text-xs font-bold text-text-muted hover:text-primary" href="#">Learn about Valyra Safety</a>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <OfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                listingId={BigInt(listing.on_chain_id || 0)}
                listingUuid={listing.id}
                listingPrice={listing?.asking_price}
                onSuccess={() => {
                    toast.success('Offer submitted successfully on-chain!');
                    setIsOfferModalOpen(false);
                    router.push('/app/offers');
                }}
            />
        </div>
    );
}
