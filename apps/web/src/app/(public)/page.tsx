import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TrustBar } from "@/components/TrustBar";
import { ExploreTrendingSection } from "@/components/explore/ExploreTrendingSection";
import { ExploreJustLandingSection } from "@/components/explore/ExploreJustLandingSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { StatsSection } from "@/components/StatsSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

export default function Home() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="flex flex-col gap-16 md:gap-24">
                <HeroSection />
                <TrustBar />
                <ExploreTrendingSection />
                <ExploreJustLandingSection />
                <FeaturesSection />
                <StatsSection />
                <PricingSection />
            </main>
            <Footer />
        </div>
    );
}
