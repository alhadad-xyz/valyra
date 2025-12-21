"use client";

import Link from "next/link";
import { Button, Badge } from "ui";

interface ListingHeaderProps {
    title: string;
    description: string;
    breadcrumbs: { label: string; href: string }[];
    isVerified?: boolean;
    isGrowth?: boolean;
}

export function ListingHeader({
    title,
    description,
    breadcrumbs,
    isVerified,
    isGrowth,
}: ListingHeaderProps) {
    return (
        <>
            {/* Breadcrumbs */}
            <nav className="mb-6 flex flex-wrap gap-2 text-sm">
                {breadcrumbs.map((crumb, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        {idx > 0 && <span className="text-text-muted">/</span>}
                        {idx === breadcrumbs.length - 1 ? (
                            <span className="font-medium text-text-main dark:text-white">{crumb.label}</span>
                        ) : (
                            <Link href={crumb.href} className="text-text-muted hover:text-text-main dark:hover:text-white transition-colors">
                                {crumb.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Page Heading & Actions */}
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black leading-tight tracking-tight text-text-main dark:text-white md:text-5xl">
                        {title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg text-text-muted">{description}</span>
                        {isVerified && (
                            <Badge variant="success" size="sm" icon={<span className="material-symbols-outlined text-[14px]">verified</span>}>
                                Verified
                            </Badge>
                        )}
                        {isGrowth && (
                            <Badge variant="info" size="sm" icon={<span className="material-symbols-outlined text-[14px]">rocket_launch</span>}>
                                Growth
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        size="md"
                        leftIcon={<span className="material-symbols-outlined text-[18px]">ios_share</span>}
                    >
                        Share
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        leftIcon={<span className="material-symbols-outlined text-[18px]">favorite</span>}
                    >
                        Watch
                    </Button>
                </div>
            </div>
        </>
    );
}
