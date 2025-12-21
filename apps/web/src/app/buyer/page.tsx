import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BuyerHeroSection } from "@/components/buyer/BuyerHeroSection";
import { BuildIdStandard } from "@/components/buyer/BuildIdStandard";
import { AssetCategoryGrid } from "@/components/buyer/AssetCategoryGrid";
import { DemoListingCTA } from "@/components/buyer/DemoListingCTA";

export default function BuyerPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            <Header />
            <main className="flex flex-col w-full overflow-x-hidden">
                <BuyerHeroSection />
                <BuildIdStandard />
                <AssetCategoryGrid />
                <DemoListingCTA />
            </main>
            <Footer />
        </div>
    );
}
