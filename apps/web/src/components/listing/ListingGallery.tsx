"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "ui";

interface ListingGalleryProps {
    images: string[];
}

export function ListingGallery({ images }: ListingGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                <Image
                    src={selectedImage}
                    alt="Listing Main Image"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                />

                <div className="absolute right-4 top-4 flex gap-2">
                    <Button
                        className="flex size-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 text-text-main dark:text-white backdrop-blur hover:bg-white dark:hover:bg-black p-0 border-0"
                    >
                        <span className="material-symbols-outlined text-[20px]">fullscreen</span>
                    </Button>
                </div>

                {/* Navigation Arrows (visible on hover/mobile) */}
                <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
                    <Button
                        className="flex size-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 text-text-main dark:text-white backdrop-blur hover:bg-white dark:hover:bg-black p-0 border-0 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </Button>
                    <Button
                        className="flex size-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 text-text-main dark:text-white backdrop-blur hover:bg-white dark:hover:bg-black p-0 border-0 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </Button>
                </div>
            </div>

            {/* Thumbnails */}
            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-lg transition-all ${selectedImage === img
                                ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-surface-dark"
                                : "opacity-70 hover:opacity-100"
                            }`}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
                {/* Video Placeholder */}
                <Button
                    className="relative flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 border-none text-text-muted hover:text-text-main dark:hover:text-white p-0 !rounded-lg"
                >
                    <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-2xl">play_circle</span>
                        <span className="text-[10px] font-bold">Watch Demo</span>
                    </div>
                </Button>
            </div>
        </div>
    );
}
