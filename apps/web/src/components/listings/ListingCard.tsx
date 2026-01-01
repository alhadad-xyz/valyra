"use client";

import Image from "next/image";
import { Button, Badge } from "ui";

interface ListingCardProps {
    image: string;
    category: string;
    title: string;
    description: string;
    askingPrice: string;
    mrr: string;
    aiValue: string;
    aiValueStatus: "good" | "fair" | "warning";
    trustScore: number;
    techStack: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    size?: "default" | "large";
    isCodeVerified?: boolean;
    verificationLevel?: "Basic" | "Standard" | "Enhanced";
    sellerActivity?: string;
    platformFee?: string;
}

export function ListingCard({
    image,
    category,
    title,
    description,
    askingPrice,
    mrr,
    aiValue,
    aiValueStatus,
    trustScore,
    techStack,
    isActive = true,
    isFeatured = false,
    size = "default",
    isCodeVerified = false,
    verificationLevel,
    sellerActivity,
    platformFee,
}: ListingCardProps) {
    const getAIValueColor = () => {
        switch (aiValueStatus) {
            case "good":
                return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
            case "fair":
                return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
            case "warning":
                return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
        }
    };

    const getTrustScoreColor = () => {
        if (trustScore >= 90) return "text-success";
        if (trustScore >= 75) return "text-warning";
        return "text-orange-600 dark:text-orange-400";
    };

    if (size === "large") {
        return (
            <div className="bg-white dark:bg-background-dark-elevated rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-xl transition-shadow group">
                <div className="h-64 relative overflow-hidden">
                    <Image
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        src={image}
                        alt={title}
                    />
                    {isFeatured && (
                        <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                            #1 Trending
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-full cursor-pointer hover:bg-black/70 transition-colors">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="info" size="sm">
                                {category}
                            </Badge>
                            {isCodeVerified && (
                                <Badge variant="success" size="sm" className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px] filled">verified</span> Code Verified
                                </Badge>
                            )}
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getTrustScoreColor()} bg-green-100 dark:bg-green-900/30`}>
                            <span className="material-symbols-outlined text-sm filled">verified_user</span>
                            <span className="text-xs font-bold">{trustScore}/100</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-text-main dark:text-white mb-1 flex items-center gap-2">
                        {title}
                        {isActive && (
                            <span className="flex items-center gap-2">
                                <span className="size-2 bg-green-500 rounded-full" title="Seller Active"></span>
                                {sellerActivity && (
                                    <span className="text-xs text-text-muted font-normal">{sellerActivity}</span>
                                )}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-6 line-clamp-2">
                        {description}
                    </p>
                    <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-end border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
                            <div>
                                <div className="flex items-center gap-1 mb-0.5">
                                    <p className="text-xs text-text-muted">Asking Price</p>
                                    {platformFee && (
                                        <span className="text-[10px] text-primary bg-primary/10 px-1 rounded" title={`Includes ${platformFee} platform fee`}>
                                            +2.5% Fee
                                        </span>
                                    )}
                                </div>
                                <p className="text-lg font-bold text-text-main dark:text-white">{askingPrice}</p>
                                <div className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getAIValueColor()}`}>
                                    <span className="material-symbols-outlined text-[12px] filled">smart_toy</span>
                                    AI Value: {aiValue}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-text-muted mb-0.5">Monthly Revenue</p>
                                <p className="text-lg font-bold text-text-main dark:text-white">{mrr}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <Button variant="primary" fullWidth size="md">
                            View Details
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            <div className="h-40 relative">
                <Image fill className="object-cover" src={image} alt={title} />
                <span className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-text-main dark:text-white">
                    {category}
                </span>
                {isCodeVerified && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[12px] filled">verified</span>
                        Verified
                    </span>
                )}
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-text-main dark:text-white truncate flex-1 flex items-center gap-1.5 mr-2">
                        <span className="truncate">{title}</span>
                        {isActive && (
                            <span className="size-2 bg-green-500 rounded-full shrink-0" title={sellerActivity || "Active"}></span>
                        )}
                    </h4>
                    <span className={`text-xs font-bold flex items-center gap-0.5 shrink-0 ${getTrustScoreColor()}`}>
                        <span className="material-symbols-outlined text-[14px] filled">shield</span> {trustScore}
                    </span>
                </div>
                <div className="flex flex-col gap-1 mb-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                            <span className="font-bold text-text-main dark:text-white">{askingPrice}</span>
                            {platformFee && <span className="text-[9px] text-primary">+2.5% fee</span>}
                        </div>
                        <span className="text-text-muted text-xs">MRR: {mrr}</span>
                    </div>
                    <div className="flex justify-start">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${getAIValueColor()}`}>
                            AI Value: {aiValue}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1 mb-3 mt-auto flex-wrap">
                    {techStack.slice(0, 2).map((tech, index) => (
                        <span
                            key={index}
                            className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 rounded text-[9px] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
                <Button variant="outline" fullWidth size="sm" className="mt-auto">
                    View Details
                </Button>
            </div>
        </div>
    );
}
