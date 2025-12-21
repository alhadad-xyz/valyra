"use client";

import { useState } from "react";

import { Button } from "ui";

export function ExploreSearchBar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    const handleSearch = () => {
        // Search functionality to be implemented
        console.log("Searching for:", searchQuery, "in", selectedCategory);
    };

    return (
        <div className="flex-1 max-w-2xl hidden md:block">
            <div className="flex items-center w-full h-12 bg-background-light dark:bg-background-dark rounded-full border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden pl-2">
                <Button
                    variant="secondary"
                    className="flex items-center gap-1 px-4 py-1.5 h-8 bg-white dark:bg-background-dark-elevated rounded-full text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                    {selectedCategory}
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </Button>
                <input
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-white h-full outline-none"
                    placeholder="Cari micro-startup, SaaS, AI agents... (Search businesses)"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                    variant="primary"
                    className="size-10 rounded-full mr-1 hover:brightness-95 transition-all p-0 [&>span]:flex [&>span]:items-center [&>span]:justify-center"
                    onClick={handleSearch}
                >
                    <span className="material-symbols-outlined text-white">search</span>
                </Button>
            </div>
        </div>
    );
}
