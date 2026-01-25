"use client";

import { FC } from 'react';
import { useAccount } from 'wagmi';
import { useGenesisCheck } from '@/hooks/useGenesisCheck';

interface GenesisBadgeProps {
    className?: string;
    showLabel?: boolean;
}

export const GenesisBadge: FC<GenesisBadgeProps> = ({ className = '', showLabel = true }) => {
    const { address } = useAccount();
    const { isGenesis, isLoading } = useGenesisCheck(address);

    if (isLoading || !isGenesis) return null;

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 ${className}`}
            title="Genesis Seller"
        >
            <span className="material-symbols-outlined text-sm filled">diamond</span>
            {showLabel && (
                <span className="text-xs font-bold tracking-wide uppercase">
                    Genesis
                </span>
            )}
        </div>
    );
};
