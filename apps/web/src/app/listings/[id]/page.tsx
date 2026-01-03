"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button, Badge, Card, CardContent } from "ui";
import { useAccount, useWriteContract } from "wagmi";
import { useRouter } from "next/navigation";
import { useState, use } from "react";
import { useQuery } from '@tanstack/react-query';
import { ESCROW_ABI } from "@/abis/EscrowV1";
import { ERC20_ABI } from "@/abis/ERC20";



export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isConnected, address } = useAccount();
    const router = useRouter();
    const { writeContractAsync, isPending } = useWriteContract();

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
        retry: false
    });

    const [buyStatus, setBuyStatus] = useState<'idle' | 'approving' | 'approved' | 'buying' | 'success' | 'error'>('idle');

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
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">404</h1>
                        <p className="text-xl text-gray-500 mb-8">Listing not found</p>
                        <Button onClick={() => router.push('/explore')}>Back to Explore</Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Helper to extract image or use placeholder
    const image = listing.tech_stack?.images?.[0] || `https://placehold.co/600x400/0052FF/FFFFFF?text=${encodeURIComponent(listing.asset_name)}`;
    const tags = Object.keys(listing.tech_stack || {});

    const handleBuyNow = async () => {
        if (!isConnected) {
            router.push('/connect-wallet');
            return;
        }

        try {
            setBuyStatus('approving');

            // 1. Approve IDRX Spending
            // Mock IDRX address for Base Sepolia - TODO: Move to config
            const IDRX_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf992c420758429";
            const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as `0x${string}`;

            if (!ESCROW_CONTRACT) {
                alert("Escrow contract address not configured!");
                return;
            }

            // Amount in Wei (assuming 18 decimals)
            // Listing price from API is decimal string e.g. "500.00"
            // We need to convert to BigInt. 
            // Minimal approach: parse float * 1e18 (risky for precision but OK for hackathon MVP)
            const priceWei = BigInt(Math.floor(parseFloat(listing.asking_price) * 1e18));

            await writeContractAsync({
                address: IDRX_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [ESCROW_CONTRACT, priceWei]
            });

            setBuyStatus('approved');
            setBuyStatus('buying');

            // 2. Deposit Funds
            await writeContractAsync({
                address: ESCROW_CONTRACT,
                abi: ESCROW_ABI,
                functionName: 'depositFunds',
                args: [BigInt(listing.on_chain_id || 0), priceWei, 0] // 0 = ECIES_WALLET default
            });

            setBuyStatus('success');

        } catch (e) {
            console.error(e);
            setBuyStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column - Images & Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 aspect-video relative">
                            <img
                                src={image}
                                alt={listing.asset_name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                <Badge variant="primary" size="lg">{listing.asset_type}</Badge>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    {listing.asset_name}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="neutral">{tag}</Badge>
                                    ))}
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {listing.description}
                                </p>
                            </div>

                            {/* Features or Stats */}
                            <Card className="bg-white dark:bg-gray-900">
                                <CardContent className="pt-6">
                                    <h3 className="text-xl font-bold mb-4">Financials</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Monthly Revenue</p>
                                            <p className="font-bold">${listing.mrr}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Annual Revenue</p>
                                            <p className="font-bold">${listing.annual_revenue}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Monthly Profit</p>
                                            <p className="font-bold text-green-600">${listing.monthly_profit}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Trend</p>
                                            <p className="font-bold">{listing.revenue_trend}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column - Action Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card variant="elevated" className="p-6 border-2 border-primary/5 dark:border-primary/20">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Asking Price</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white">{parseFloat(listing.asking_price).toLocaleString()} IDRX</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Verification</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{listing.verification_status}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Seller</span>
                                            <span className="font-medium text-primary font-mono bg-primary/10 px-2 py-0.5 rounded text-xs truncate max-w-[150px]">{listing.seller_id}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            fullWidth
                                            size="lg"
                                            onClick={handleBuyNow}
                                            loading={buyStatus === 'approving' || buyStatus === 'buying' || isPending}
                                            disabled={buyStatus === 'success'}
                                        >
                                            {buyStatus === 'idle' && 'Buy Now'}
                                            {buyStatus === 'approving' && 'Approving IDRX...'}
                                            {buyStatus === 'approved' && 'Confirm Purchase...'}
                                            {buyStatus === 'buying' && 'Purchasing...'}
                                            {buyStatus === 'success' && 'Purchase Successful!'}
                                            {buyStatus === 'error' && 'Retry Purchase'}
                                        </Button>
                                        <Button fullWidth variant="outline" size="lg">
                                            Make Offer
                                        </Button>
                                    </div>

                                    {buyStatus === 'success' && (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-2">
                                            <p className="font-bold">Transaction Confirmed!</p>
                                            <p className="text-xs mt-1">Funds held in Escrow.</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-center text-gray-400 px-4">
                                        Protected by Valyra Escrow. Funds are held safely until delivery is verified.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
