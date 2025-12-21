import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SellerHeroSection } from "@/components/seller/SellerHeroSection";
import { ProcessSection } from "@/components/seller/ProcessSection";
import { FeeCalculator } from "@/components/seller/FeeCalculator";
import { ComparisonTable } from "@/components/seller/ComparisonTable";
import { GenesisProgramCTA } from "@/components/seller/GenesisProgramCTA";

export default function SellerPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <Header />
            <main className="flex flex-col w-full">
                <SellerHeroSection />
                <ProcessSection />
                <FeeCalculator />
                <ComparisonTable />
                <GenesisProgramCTA />
            </main>
            <Footer />
        </div>
    );
}
