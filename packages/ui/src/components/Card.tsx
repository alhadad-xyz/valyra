import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const cardVariants = cva(
    'rounded-lg transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
                elevated: 'bg-white dark:bg-gray-800 shadow-lg',
                outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
                ghost: 'bg-transparent',
            },
            padding: {
                none: 'p-0',
                sm: 'p-4',
                md: 'p-6',
                lg: 'p-8',
                xl: 'p-10',
            },
            hoverable: {
                true: 'hover:shadow-xl cursor-pointer',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            padding: 'md',
            hoverable: false,
        },
    }
);

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant,
            padding,
            hoverable,
            header,
            footer,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={clsx(cardVariants({ variant, padding, hoverable }), className)}
                {...props}
            >
                {header && (
                    <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                        {header}
                    </div>
                )}

                <div>{children}</div>

                {footer && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {footer}
                    </div>
                )}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={clsx('flex flex-col gap-1.5', className)}
        {...props}
    />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={clsx('text-xl font-bold leading-tight', className)}
        {...props}
    />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={clsx('text-sm text-gray-500 dark:text-gray-400', className)}
        {...props}
    />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={clsx('flex items-center gap-2', className)}
        {...props}
    />
));

CardFooter.displayName = 'CardFooter';
