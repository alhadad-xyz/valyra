import { Card } from "ui";

export function ListingSkeleton() {
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full animate-pulse">
            {/* Image Skeleton */}
            <div className="h-40 bg-gray-200 dark:bg-gray-700 relative w-full" />

            <div className="p-4 flex flex-col flex-1 gap-4">
                {/* Header Skeleton */}
                <div className="flex justify-between items-start">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12" />
                </div>

                {/* Content Skeleton */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                    </div>

                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>

                {/* Footer Skeleton */}
                <div className="mt-auto pt-2 flex gap-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>

                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2" />
            </div>
        </div>
    );
}
