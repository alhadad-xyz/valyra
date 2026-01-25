import Link from "next/link";

export const dynamic = 'force-dynamic';

import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { Footer } from "@/components/Footer";
import { MarketplaceSidebar } from "@/components/marketplace/MarketplaceSidebar";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";

export default function MarketplacePage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <MarketplaceHeader />

            <main className="flex-1 max-w-8xl mx-auto w-full px-4 lg:px-6 py-8 flex gap-8">
                <MarketplaceSidebar />
                <MarketplaceGrid />
            </main>

            <Footer />
        </div>
    );
}
