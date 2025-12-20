"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button, Badge, Card, CardContent } from "ui";
import { useAccount, useWriteContract } from "wagmi";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mock Data
const LISTINGS = {
    "1": {
        id: "1",
        title: "DeFi Dashboard Implementation",
        description: "A comprehensive DeFi dashboard featuring staking, swapping, and portfolio tracking capabilities. Built with Next.js and TailwindCSS.",
        price: "0.5 ETH",
        seller: "0x7Re...90B",
        category: "Frontend",
        difficulty: "Intermediate",
        deliveryTime: "3 days",
        images: ["https://placehold.co/600x400/0052FF/FFFFFF?text=DeFi+Dashboard"],
        tags: ["React", "Typescript", "Wagmi"],
        features: [
            "Wallet Connection",
            "Token Swapping UI",
            "Staking Dashboard",
            "Responsive Design"
        ]
    },
    "2": {
        id: "2",
        title: "NFT Marketplace Smart Contract",
        description: "Secure and optimized ERC721 marketplace contract with royalty support and auction mechanisms.",
        price: "1.2 ETH",
        seller: "0x3Ab...22C",
        category: "Smart Contract",
        difficulty: "Advanced",
        deliveryTime: "1 week",
        images: ["https://placehold.co/600x400/10B981/FFFFFF?text=NFT+Contract"],
        tags: ["Solidity", "Hardhat", "ERC721"],
        features: [
            "Listing & Buying",
            "Dutch Auctions",
            "Royalty Standard (EIP-2981)",
            "Gas Optimized"
        ]
    }
};

import { use } from "react";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const listing = LISTINGS[id as keyof typeof LISTINGS];
    const { isConnected } = useAccount();
    const router = useRouter();
    const { writeContract, isPending } = useWriteContract();
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    if (!listing) {
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

    const handleBuyNow = () => {
        if (!isConnected) {
            router.push('/connect-wallet');
            return;
        }

        setStatus('pending');
        // Mock transaction for now since contract is not fully integrated/deployed address is unknown
        setTimeout(() => {
            setStatus('success');
            // writeContract({ ... }) 
        }, 2000);
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
                                src={listing.images[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                <Badge variant="primary" size="lg">{listing.category}</Badge>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    {listing.title}
                                </h1>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {listing.tags.map(tag => (
                                        <Badge key={tag} variant="neutral">{tag}</Badge>
                                    ))}
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {listing.description}
                                </p>
                            </div>

                            {/* Features */}
                            <Card className="bg-white dark:bg-gray-900">
                                <CardContent className="pt-6">
                                    <h3 className="text-xl font-bold mb-4">Features</h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {listing.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <span className="material-symbols-outlined text-green-500">check_circle</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
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
                                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Current Price</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white">{listing.price}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Delivery Time</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{listing.deliveryTime}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Difficulty</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{listing.difficulty}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Seller</span>
                                            <span className="font-medium text-primary font-mono bg-primary/10 px-2 py-0.5 rounded text-xs">{listing.seller}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            fullWidth
                                            size="lg"
                                            onClick={handleBuyNow}
                                            loading={status === 'pending' || isPending}
                                            disabled={status === 'success'}
                                        >
                                            {status === 'success' ? 'Purchase Successful!' : 'Buy Now'}
                                        </Button>
                                        <Button fullWidth variant="outline" size="lg">
                                            Make Offer
                                        </Button>
                                    </div>

                                    {status === 'success' && (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-2">
                                            <p className="font-bold">Transaction Confirmed!</p>
                                            <a href="#" className="underline">View on Explorer</a>
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
