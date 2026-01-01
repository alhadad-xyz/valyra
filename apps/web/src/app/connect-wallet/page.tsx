"use client";

import Link from "next/link";
import { useConnect, useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function WalletOptionButton({
    name,
    description,
    icon,
    recommended = false,
    colorClass = "bg-primary",
    onClick,
    disabled
}: {
    name: string;
    description: string;
    icon: React.ReactNode;
    recommended?: boolean;
    colorClass?: string;
    onClick?: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full group relative flex items-center p-5 rounded-xl border transition-all text-left ${recommended
                ? "border-2 border-primary bg-blue-50/50 dark:bg-primary/10"
                : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary hover:shadow-md dark:hover:border-primary"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-sm ${colorClass}`}>
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                    {name}
                </h3>
                <p className="text-sm text-text-muted">{description}</p>
            </div>
            <div className={`flex-shrink-0 transition-all ${recommended ? "text-primary opacity-100 translate-x-0" : "text-gray-300 group-hover:text-primary group-hover:translate-x-1"
                }`}>
                <span className="material-symbols-outlined">arrow_forward</span>
            </div>
        </button>
    );
}

export default function ConnectWalletPage() {
    const { connectors, connect, error, isPending } = useConnect();
    const { isConnected } = useAccount();
    const router = useRouter();

    useEffect(() => {
        if (isConnected) {
            router.push('/explore');
        }
    }, [isConnected, router]);

    const handleConnect = (connectorId: string | RegExp) => {
        const connector = connectors.find((c) =>
            typeof connectorId === 'string'
                ? c.id.toLowerCase().includes(connectorId.toLowerCase()) || c.name.toLowerCase().includes(connectorId.toLowerCase())
                : connectorId.test(c.id) || connectorId.test(c.name)
        );
        if (connector) {
            connect({ connector });
        } else {
            console.warn(`Connector not found for ${connectorId}`);
            // Fallback to first available if specific one not found, or handle error
            if (connectors.length > 0) {
                // connect({ connector: connectors[0] });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-black flex items-center justify-center selection:bg-primary selection:text-white">
            <div className="w-full bg-white dark:bg-background-dark shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-screen transition-colors duration-300">

                {/* Left Side - Hero */}
                <div className="lg:w-2/5 bg-primary relative p-10 flex flex-col justify-between overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="size-10 bg-white text-primary rounded-xl flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-2xl font-bold">token</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">Valyra</span>
                    </div>

                    <div className="relative z-10 mt-12 mb-auto">
                        <h1 className="text-white text-3xl lg:text-4xl font-bold leading-tight mb-6">
                            Your gateway to <br />autonomous M&A.
                        </h1>
                        <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                            Connect securely to buy, sell, and verify assets on Base L2. No passwords required.
                        </p>
                    </div>

                    <div className="relative h-48 w-full flex justify-center items-end mt-8">
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/20 rounded-[100%] blur-md"></div>
                        <div className="relative z-10 animate-float">
                            {/* Inline SVG from template */}
                            <svg className="drop-shadow-2xl" fill="none" height="160" viewBox="0 0 100 120" width="140" xmlns="http://www.w3.org/2000/svg">
                                <path d="M50 110C50 110 90 90 90 30V10L50 0L10 10V30C10 90 50 110 50 110Z" fill="white"></path>
                                <path d="M50 110C50 110 90 90 90 30V10L50 0V110Z" fill="#E0E7FF"></path>
                                <path d="M50 40C44.4772 40 40 44.4772 40 50V55H38C36.8954 55 36 55.8954 36 57V73C36 74.1046 36.8954 75 38 75H62C63.1046 75 64 74.1046 64 73V57C64 55.8954 63.1046 55 62 55H60V50C60 44.4772 55.5228 40 50 40ZM50 69C48.3431 69 47 67.6569 47 66C47 64.3431 48.3431 63 50 63C51.6569 63 53 64.3431 53 66C53 67.6569 51.6569 69 50 69ZM56 55H44V50C44 46.6863 46.6863 44 50 44C53.3137 44 56 46.6863 56 50V55Z" fill="#0052FF"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Right Side - Wallet Options */}
                <div className="lg:w-3/5 p-10 lg:p-14 flex flex-col justify-between bg-white dark:bg-background-dark relative">
                    <div className="w-full flex justify-end">
                        <Link href="#" className="text-sm font-medium text-text-muted hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1">
                            Having troubles? <span className="font-bold text-primary">Get Help</span>
                        </Link>
                    </div>

                    <div className="w-full max-w-lg mx-auto mt-4">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">Choose the type of wallet</h2>
                            <p className="text-text-muted">
                                Select a provider to sign in. Smart Wallets are supported for email login.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error.message}
                            </div>
                        )}

                        <div className="space-y-4">
                            <WalletOptionButton
                                name="Coinbase Wallet"
                                description="Recommended for Base users"
                                recommended={true}
                                colorClass="bg-[#0052FF] text-white"
                                icon={<div className="w-6 h-6 border-4 border-white rounded-full"></div>}
                                onClick={() => handleConnect('coinbaseWalletSDK')}
                                disabled={isPending}
                            />

                            <WalletOptionButton
                                name="MetaMask"
                                description="Standard browser extension"
                                colorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-600"
                                icon={<span className="material-symbols-outlined text-2xl">pets</span>}
                                onClick={() => handleConnect('io.metamask')}
                                disabled={isPending}
                            />

                            <WalletOptionButton
                                name="Other Wallets"
                                description="Connect via Injected/Standrd"
                                colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                                icon={<span className="material-symbols-outlined text-2xl">account_balance_wallet</span>}
                                onClick={() => handleConnect('injected')}
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="w-full flex justify-center mt-8">
                        <Link href="#" className="text-sm text-text-muted hover:text-text-main dark:hover:text-white underline decoration-gray-300 dark:decoration-gray-600 underline-offset-4 transition-colors">
                            New to crypto? Learn how to create a wallet.
                        </Link>
                    </div>
                </div>
            </div>
            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
