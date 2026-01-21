"use client";

import { useState, useRef, useEffect, useMemo } from 'react';

import { Button, Input, Badge } from "ui";
import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function HeroSection() {
    // Memoize options to prevent IntersectionObserver flickering on re-renders
    const scrollOptions = useMemo(() => ({ threshold: 1 }), []);
    const { ref, isVisible } = useScrollAnimation(scrollOptions);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Video autoplay failed:", error);
            });
        }
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
    };

    return (
        <section
            ref={ref as any}
            className={`relative flex flex-col items-center justify-center px-4 md:px-10 lg:px-40 py-12 md:py-20 max-w-8xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
        >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div className="flex flex-col gap-6 md:gap-8 order-2 lg:order-1">
                    <div className="flex flex-col gap-4 text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 w-fit">
                            <span className="material-symbols-outlined text-sm">
                                rocket_launch
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Now Live on Base L2
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                            The Autonomous Marketplace for{" "}
                            <span className="relative whitespace-nowrap z-10">
                                Micro-Startups
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary -z-10 opacity-70"></span>
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg md:text-xl text-text-muted dark:text-gray-300 max-w-lg leading-relaxed">
                            Turn your side-project into cash in minutes, not months.
                            AI-powered due diligence and smart contract escrow with only a 2.5% success fee.
                        </p>
                    </div>

                    {/* Email Input */}
                    <label className="flex flex-col h-14 w-full max-w-[480px] md:h-16 relative group">
                        <div className="flex w-full flex-1 items-stretch rounded-full border-2 border-transparent bg-white dark:bg-gray-800 shadow-lg focus-within:border-primary transition-all p-1.5">
                            <div className="flex items-center justify-center pl-3 text-text-muted">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <input
                                className="flex w-full min-w-0 flex-1 bg-transparent px-4 text-sm md:text-base font-normal text-text-main dark:text-white focus:outline-none placeholder:text-text-muted"
                                placeholder="Enter your email"
                                type="email"
                            />
                            <Button variant="primary" size="sm" className="px-6 h-auto py-2.5 text-sm md:text-base font-bold">
                                Join Waitlist
                            </Button>
                        </div>
                    </label>
                </div>

                {/* Hero Visual */}
                <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="order-1 lg:order-2 w-full aspect-square md:aspect-video lg:aspect-square relative rounded-xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 perspective-1000 preserve-3d transition-transform duration-200 ease-out"
                    style={{
                        transform: `rotateX(${mousePosition.y * -10}deg) rotateY(${mousePosition.x * 10}deg) scale(1.02)`,
                    }}
                >
                    {/* Placeholder gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-90"
                            poster="https://lh3.googleusercontent.com/aida-public/AB6AXuB3rJAXq7SzzPaSl71RYuyqoiZpHqEFbCf03H_QUj5LoK5cq1lR5cotyb2EETO6JC0sR7T2j4vdlHtN8lWJpeN3oeQC4jfb-kP9r-SS_T6v2SjyGh-lgNazxK5JfOYnxgEXkL2nMCTLxVCiR5W5918uR-kFD6cTblvGGR-Xn7n544i7OLzLpysOrnrmqQWwnPvqNZmd12QZ0Ej14NFD0c-pNXblRGX0MG3ZdhzkUrY-eDXdHlTMuecKXVyWA-b2tWHsmgORlIZLYCzI"
                        >
                            <source src="/hero-video.mp4" type="video/mp4" />
                            {/* Fallback image if video fails to load or not supported */}
                            <img
                                alt="3D illustration of a digital card sliding into a smart contract vault"
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3rJAXq7SzzPaSl71RYuyqoiZpHqEFbCf03H_QUj5LoK5cq1lR5cotyb2EETO6JC0sR7T2j4vdlHtN8lWJpeN3oeQC4jfb-kP9r-SS_T6v2SjyGh-lgNazxK5JfOYnxgEXkL2nMCTLxVCiR5W5918uR-kFD6cTblvGGR-Xn7n544i7OLzLpysOrnrmqQWwnPvqNZmd12QZ0Ej14NFD0c-pNXblRGX0MG3ZdhzkUrY-eDXdHlTMuecKXVyWA-b2tWHsmgORlIZLYCzI"
                            />
                        </video>
                    </div>

                    {/* Floating Element Overlay */}
                    <div
                        className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-black/80 backdrop-blur p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4 animate-bounce"
                        style={{ animationDuration: "3s", transform: `translateZ(20px)` }}
                    >
                        <div className="bg-green-100 text-green-600 rounded-full flex items-center justify-center w-10 h-10 flex-shrink-0">
                            <span className="material-symbols-outlined text-[24px]">check_circle</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold">Smart Contract Verified</p>
                            <p className="text-xs text-text-muted">Escrow #0x82...9f secured</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
