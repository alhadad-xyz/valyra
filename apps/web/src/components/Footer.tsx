"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function Footer() {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0 });

    return (
        <footer
            ref={ref as any}
            className={`bg-[#11110a] text-white py-16 transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            <div className="px-4 md:px-10 lg:px-40 max-w-8xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <a href="/" className="flex items-center gap-2 mb-6">
                            <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-black">
                                <span className="material-symbols-outlined filled text-2xl text-white font-bold">
                                    token
                                </span>
                            </div>
                            <h2 className="text-lg font-bold">Valyra</h2>
                        </a>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            The first autonomous marketplace for micro-startups built on Base.
                            Secure, fast, and driven by AI.
                        </p>
                    </div>

                    {/* Marketplace */}
                    <div>
                        <h4 className="font-bold mb-6">Explore</h4>
                        <ul className="flex flex-col gap-4 text-sm text-gray-400">
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Explore Listings
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Sell a Startup
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Success Stories
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold mb-6">Resources</h4>
                        <ul className="flex flex-col gap-4 text-sm text-gray-400">
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Smart Contracts
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Help Center
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 className="font-bold mb-6">Community</h4>
                        <ul className="flex flex-col gap-4 text-sm text-gray-400">
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Twitter / X
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Discord
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-primary transition-colors" href="#">
                                    Mirror
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <p className="text-xs text-gray-500">
                        © 2024 Valyra Protocol. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600 max-w-lg text-right">
                        Disclaimer: Valyra is a decentralized marketplace interface.
                        Cryptocurrency trading involves substantial risk of loss. This
                        platform is not regulated by Bappebti. Users are responsible for
                        their own due diligence.
                    </p>
                </div>
            </div>
        </footer>
    );
}
