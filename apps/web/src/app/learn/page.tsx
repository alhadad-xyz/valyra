import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LearnAnimatedContent } from "@/components/learn/LearnAnimatedContent";

export default function LearnPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <Header />
            <main className="flex flex-col w-full">
                <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
                    {/* Left Sidebar Navigation */}
                    <aside className="hidden lg:flex flex-col w-72 sticky top-[65px] h-[calc(100vh-65px)] border-r border-[#e6e6e0] dark:border-[#3a392a] bg-surface-light dark:bg-surface-dark overflow-y-auto sidebar-scroll">
                        {/* Search Bar */}
                        <div className="p-6 pb-2">
                            <label className="flex flex-col w-full">
                                <div className="flex w-full items-center rounded-full bg-background-light dark:bg-background-dark border border-[#e6e6e0] dark:border-[#3a392a] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary h-10 px-3 transition-all">
                                    <span className="material-symbols-outlined text-text-muted text-[20px]">search</span>
                                    <input className="w-full bg-transparent border-none focus:ring-0 text-sm text-text-main dark:text-white placeholder:text-text-muted ml-2" placeholder="Search documentation..." />
                                </div>
                            </label>
                        </div>
                        {/* Navigation Links */}
                        <div className="flex flex-col gap-6 p-6">
                            {/* Section 1 */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted pl-3">Documentation</h3>
                                <div className="flex flex-col gap-1">
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a392a] text-text-main dark:text-gray-200 group transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px] text-text-muted group-hover:text-primary">rocket_launch</span>
                                        <span className="text-sm font-medium">Getting Started</span>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a392a] text-text-main dark:text-gray-200 group transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px] text-text-muted group-hover:text-primary">account_balance_wallet</span>
                                        <span className="text-sm font-medium">Buying Guide</span>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-text-main dark:text-white group transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px] text-primary">storefront</span>
                                        <span className="text-sm font-bold">Selling Guide</span>
                                    </a>
                                    <div className="pl-10 flex flex-col gap-1 border-l-2 border-primary/20 ml-5 my-1">
                                        <a className="text-sm py-1 pl-4 text-text-muted hover:text-text-main dark:hover:text-white" href="#">Listing Items</a>
                                        <a className="text-sm py-1 pl-4 font-bold text-text-main dark:text-white border-l-2 border-primary -ml-[2px]" href="#">Verification</a>
                                        <a className="text-sm py-1 pl-4 text-text-muted hover:text-text-main dark:hover:text-white" href="#">AI Valuation</a>
                                    </div>
                                </div>
                            </div>
                            {/* Section 2 */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted pl-3">Legal &amp; Compliance</h3>
                                <div className="flex flex-col gap-1">
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a392a] text-text-main dark:text-gray-200 group transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px] text-text-muted group-hover:text-primary">gavel</span>
                                        <span className="text-sm font-medium">Bappebti Rules</span>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a392a] text-text-main dark:text-gray-200 group transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px] text-text-muted group-hover:text-primary">verified_user</span>
                                        <span className="text-sm font-medium">KYC Process</span>
                                    </a>
                                    <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-light dark:hover:bg-[#3a392a] text-text-main dark:text-gray-200 group transition-colors" href="#">
                                        <span className="material-symbols-outlined text-[20px] text-text-muted group-hover:text-primary">approval_delegation</span>
                                        <span className="text-sm font-medium">e-Meterai Guide</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* Bottom Support */}
                        <div className="mt-auto p-6 border-t border-[#e6e6e0] dark:border-[#3a392a]">
                            <a className="flex items-center gap-3 p-3 rounded-xl bg-background-light dark:bg-[#3a392a] hover:bg-primary/20 transition-colors" href="#">
                                <span className="material-symbols-outlined text-primary">support_agent</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-main dark:text-white">Need Help?</span>
                                    <span className="text-[10px] text-text-muted">Contact Support 24/7</span>
                                </div>
                            </a>
                        </div>
                    </aside>
                    {/* Main Content Area */}
                    <LearnAnimatedContent />
                </div>
            </main>
            <Footer />
        </div>
    );
}
