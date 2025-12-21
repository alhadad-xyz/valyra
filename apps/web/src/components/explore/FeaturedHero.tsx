"use client";

import { Button, Badge } from "ui";

interface FeaturedHeroProps {
    image: string;
    title: string;
    description: string;
    mrr: string;
    trustScore: number;
    techStack: string[];
    isActive?: boolean;
    isCodeVerified?: boolean;
    verificationLevel?: "Basic" | "Standard" | "Enhanced";
}

export function FeaturedHero({
    image,
    title,
    description,
    mrr,
    trustScore,
    techStack,
    isActive = true,
    isCodeVerified = true,
    verificationLevel = "Enhanced",
}: FeaturedHeroProps) {
    return (
        <div className="relative rounded-3xl overflow-hidden group h-full">
            <img
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={image}
                alt={title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-end p-8 md:p-12 items-start">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-primary/20 text-primary border-primary/20 backdrop-blur-sm" variant="neutral">
                        Featured Asset of the Week
                    </Badge>
                    {isCodeVerified && (
                        <Badge
                            className="bg-green-500/20 text-green-400 border-green-500/20 backdrop-blur-sm"
                            variant="neutral"
                            icon={<span className="material-symbols-outlined text-[16px] filled">verified</span>}
                        >
                            Code Verified
                        </Badge>
                    )}
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20 backdrop-blur-sm" variant="neutral">
                        {verificationLevel} Verified
                    </Badge>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight flex items-center gap-3">
                    {title}
                    {isActive && (
                        <span
                            className="size-3 bg-green-500 rounded-full border-2 border-white/20 shadow-sm"
                            title="Active <24h"
                        ></span>
                    )}
                </h2>
                <p className="text-slate-200 text-lg md:text-xl mb-6 max-w-xl">{description}</p>
                <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">trending_up</span>
                        <span className="text-white font-medium">{mrr} MRR</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-400">star</span>
                        <span className="text-white font-medium">{trustScore} Trust Score</span>
                    </div>
                    {techStack.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2 ml-4 border-l border-white/20 pl-4">
                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mr-1">
                                Stack
                            </span>
                            {techStack.slice(0, 2).map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-white/10 rounded text-xs text-white border border-white/20"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <Button variant="primary" size="lg">
                    <div className="flex items-center gap-2">
                        <span>View Listing</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </div>
                </Button>
            </div>
        </div>
    );
}
