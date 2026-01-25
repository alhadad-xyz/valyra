"use client";

import { useAccount } from 'wagmi';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isConnected, isConnecting, isReconnecting } = useAccount();
    const router = useRouter();
    const pathname = usePathname();
    const [shouldShowConnect, setShouldShowConnect] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (!isConnected && !isConnecting && !isReconnecting) {
            // Wait a bit before showing the connect prompt to allow auto-connect to kick in
            timeoutId = setTimeout(() => {
                setShouldShowConnect(true);
            }, 500);
        } else {
            // If we are connected or connecting, hide the prompt immediately
            setShouldShowConnect(false);
        }

        return () => clearTimeout(timeoutId);
    }, [isConnected, isConnecting, isReconnecting]);

    // Show loading while checking connection or waiting for timeout
    if (isConnecting || isReconnecting || (!isConnected && !shouldShowConnect)) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-text-muted dark:text-gray-400">Checking wallet connection...</p>
                </div>
            </div>
        );
    }

    // Show Connect Wallet prompt if disconnected
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-purple-200 font-display text-slate-900 dark:text-slate-100">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .orbital-lines {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 0;
                    }
                    .orbit {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        border: 1px solid rgba(0, 0, 0, 0.05);
                        border-radius: 50%;
                    }
                    .dark .orbit {
                        border-color: rgba(255, 255, 255, 0.05);
                    }
                    .float-animation {
                        animation: float 6s ease-in-out infinite;
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                        100% { transform: translateY(0px); }
                    }
                    .glow-effect {
                        background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
                    }
                    .delay-100 { animation-delay: 100ms; }
                    .delay-300 { animation-delay: 300ms; }
                    .delay-700 { animation-delay: 700ms; }
                `}} />

                <div className="orbital-lines">
                    <div className="orbit w-[400px] h-[400px]"></div>
                    <div className="orbit w-[600px] h-[600px]"></div>
                    <div className="orbit w-[900px] h-[900px]"></div>
                    <div className="orbit w-[1200px] h-[1200px]"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
                    <div className="mb-8 max-w-2xl mx-auto">
                        <p className="text-slate-400 dark:text-slate-500 text-lg mb-2 font-light">You look a little lost...</p>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                            Connect your wallet
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                            You need to connect your wallet to access this secure area. Choose a destination below to proceed.
                        </p>
                    </div>

                    <div className="relative w-full max-w-md h-64 mb-12 flex items-center justify-center">
                        <div className="absolute inset-0 glow-effect rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute top-0 left-10 float-animation delay-100 opacity-80">
                            <img alt="floating cloud" className="w-16 h-16 drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJPPeHzA6QI1Jy6duQD_t1T7yf2LQyTXRGUC1443b2FhlN-feZ40Z761Li4qUflnSs_HVE-tpsf0MPXRDRiAwnJ7HX7ZVFHZVid39_d2DRMHp-FksTvs-hoddZHOne5sCVbp3G8lNlEN1u4qVj8ZpXE9wPyNHN6z3I3TWONnI0BkxqUxBUtb-zQZxvgZ1IV5iwPc7IKXXGSrYOKlKsttfooa3Ab3PoyD5NN6cTKCuLk8rxJxl1gQiwqbRjmcjcl5NKCZN6jaKjaAym" />
                        </div>
                        <div className="absolute top-10 right-10 float-animation delay-700 opacity-80">
                            <img alt="floating heart" className="w-12 h-12 drop-shadow-xl rotate-12" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbaGcuQ9RZye-bfFhG9OXwMi-1PSmmfXDRTGW6Ytiv7AKL_4V2GSuEwGI3PpACMqBfRVks7aLRH3G1axP9B0OuyEgxLEm_1DtRA7_0J25hWrWaLPrYk3rNzmvDSguuuLr-T5mfa48axm_uFXfY1eEAJd1obbcNbEhdvhQb_lkLNe3u4gwcV1coUKty5bgYwpEH4GZ9Kb_ByZYYsRHHQ_7TVP0IVf7mLULL3W7f7-b9RdUKS4yrTeyYRYeElyYWNadxrDGGpe4jgxZZ" />
                        </div>
                        <div className="absolute bottom-4 right-20 float-animation delay-300 opacity-60">
                            <img alt="diamond icon" className="w-8 h-8 drop-shadow-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1l4AGJsJDLrSAvI2l7VA5IuOd5VkDEh_wghtRy2ivIjyMdlEqPuQ7-oGcfs48wo_-i-yv9hsyzieNu15L6BeHslV_zL5Y36tw0UIHsGr3Ms7XUsofg8FpHzMMumu6Ej5swMT1P9pdfaAI1Su71NGRyIoy7tdoX2gNitpeFSXZSce8CGHRw6t0XyJGr5oPKm5OYOxIbKihmIDYuHeXpZ7O2BKChdsF_lngu7Glet93rcTs-k33e0y7LR4vPPXNA2voUUQkI0M8992z" />
                        </div>
                        <div className="relative z-10 float-animation">
                            <div className="w-56 h-36 bg-zinc-800 dark:bg-zinc-700 rounded-[2.5rem] relative shadow-2xl overflow-hidden border-t-4 border-zinc-600">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                <div className="flex justify-around items-center h-full px-6">
                                    <div className="w-8 h-8 rounded-full bg-zinc-600 shadow-inner"></div>
                                    <div className="w-12 h-12 rounded-full bg-zinc-400 shadow-xl border-4 border-zinc-600"></div>
                                    <div className="w-8 h-8 rounded-full bg-zinc-600 shadow-inner"></div>
                                </div>
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 bg-zinc-900/50 rounded-full blur-xl"></div>
                            </div>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                <span className="material-symbols-outlined text-purple-500 text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">bolt</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-md space-y-4">
                        <div className="relative group w-full">
                            {/* Visual Card Layer - Rendered directly to ensure full width */}
                            {/* Visual fully clickable button */}
                            <button
                                onClick={() => {
                                    // Proxy click to the hidden ConnectWallet button
                                    const hiddenBtn = document.querySelector('.auth-connect-wallet') as HTMLElement;
                                    if (hiddenBtn) {
                                        hiddenBtn.click();
                                    }
                                }}
                                className="w-full flex items-center justify-between p-5 bg-blue-600 border border-blue-500 rounded-[2.5rem] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-left h-auto group text-white hover:bg-blue-700 cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">account_balance_wallet</span>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-white text-base normal-case">Connect Wallet</h3>
                                        <p className="text-xs text-blue-100 font-normal normal-case">Unlock your digital assets...</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-blue-200 group-hover:translate-x-1 transition-transform">chevron_right</span>
                            </button>

                            {/* Hidden Functional Layer - Kept in DOM for logic but hidden visually */}
                            <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                                <Wallet>
                                    <ConnectWallet className="auth-connect-wallet" />
                                </Wallet>
                            </div>
                        </div>

                        {/* Cleaned up global style as it is no longer needed for sizing hack */}
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center justify-between p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group text-left opacity-80 hover:opacity-100"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">home</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Marketplace Home</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Browse current collections</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 dark:text-zinc-700 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
            </div>
        );
    }

    return <>{children}</>;
}
