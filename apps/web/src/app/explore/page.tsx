import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExploreTrustBar } from "@/components/explore/ExploreTrustBar";
import { ExploreHeroSection } from "@/components/explore/ExploreHeroSection";
import { ExploreCategoriesSection } from "@/components/explore/ExploreCategoriesSection";
import { ExploreTrendingSection } from "@/components/explore/ExploreTrendingSection";
import { ExploreJustLandingSection } from "@/components/explore/ExploreJustLandingSection";

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <Header />
            <ExploreTrustBar />

            <main className="flex flex-col w-full overflow-x-hidden">
                <ExploreHeroSection />
                <ExploreCategoriesSection />
                <ExploreTrendingSection />
                <ExploreJustLandingSection />
            </main>

            <Footer />
        </div>
    );
}
