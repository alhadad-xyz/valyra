import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const badgeVariants = cva(
    'inline-flex items-center justify-center rounded-full font-medium transition-colors',
    {
        variants: {
            variant: {
                primary: 'bg-[#f9f506]/20 text-black border border-[#f9f506]/30',
                success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                outline: 'bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300',
            },
            size: {
                sm: 'h-5 px-2 text-xs gap-1',
                md: 'h-6 px-3 text-sm gap-1.5',
                lg: 'h-7 px-4 text-base gap-2',
            },
            dot: {
                true: '',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'neutral',
            size: 'md',
            dot: false,
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    icon?: React.ReactNode;
    onRemove?: () => void;
    dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            className,
            variant,
            size,
            dot,
            icon,
            onRemove,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <span
                ref={ref}
                className={clsx(badgeVariants({ variant, size, dot }), className)}
                {...props}
            >
                {dot && (
                    <span
                        className={clsx(
                            'rounded-full',
                            size === 'sm' && 'h-1.5 w-1.5',
                            size === 'md' && 'h-2 w-2',
                            size === 'lg' && 'h-2.5 w-2.5',
                            variant === 'primary' && 'bg-[#f9f506]',
                            variant === 'success' && 'bg-green-500',
                            variant === 'error' && 'bg-red-500',
                            variant === 'warning' && 'bg-yellow-500',
                            variant === 'info' && 'bg-blue-500',
                            variant === 'neutral' && 'bg-gray-500'
                        )}
                    />
                )}

                {icon && <span className="flex-shrink-0">{icon}</span>}

                {children && <span className="truncate">{children}</span>}

                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="flex-shrink-0 ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1"
                        aria-label="Remove"
                    >
                        <svg
                            className={clsx(
                                size === 'sm' && 'h-3 w-3',
                                size === 'md' && 'h-3.5 w-3.5',
                                size === 'lg' && 'h-4 w-4'
                            )}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </span>
        );
    }
);

Badge.displayName = 'Badge';
