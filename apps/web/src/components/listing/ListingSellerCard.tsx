"use client";

import Image from "next/image";
import { Button } from "ui";

interface ListingSellerCardProps {
    name: string;
    avatar: string;
    joinedDate: string;
    responseRate: string;
}

export function ListingSellerCard({
    name,
    avatar,
    joinedDate,
    responseRate,
}: ListingSellerCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Image
                        src={avatar}
                        alt="Seller Avatar"
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 block size-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-surface-dark"></span>
                    <span className="absolute bottom-0 right-0 block size-3.5 animate-ping rounded-full bg-green-500 opacity-75"></span>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <h3 className="font-bold text-text-main dark:text-white">{name}</h3>
                        <span
                            className="material-symbols-outlined text-[16px] text-blue-500"
                            title="Verified Seller"
                        >
                            verified
                        </span>
                    </div>
                    <p className="text-xs text-text-muted">
                        Member since {joinedDate} • {responseRate} Resp.
                    </p>
                </div>
            </div>
            <div className="mt-4 flex gap-2">
                <Button
                    className="flex-1 rounded-full bg-gray-50 dark:bg-gray-800 py-2 text-sm font-bold text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    leftIcon={<span className="material-symbols-outlined text-[18px]">chat_bubble</span>}
                >
                    Chat
                </Button>
                <Button
                    className="flex size-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-text-main dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors p-0"
                >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </Button>
            </div>
        </div>
    );
}
