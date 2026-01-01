"use client";

interface CategoryIconProps {
    icon: string;
    label: string;
    href?: string;
}

export function CategoryIcon({ icon, label, href = "#" }: CategoryIconProps) {
    return (
        <a className="flex flex-col items-center gap-3 min-w-[100px] group" href={href}>
            <div className="size-20 rounded-full bg-gray-100 dark:bg-background-dark-elevated border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                <span className="material-symbols-outlined text-3xl text-gray-700 dark:text-gray-300 group-hover:text-primary">
                    {icon}
                </span>
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                {label}
            </span>
        </a>
    );
}
