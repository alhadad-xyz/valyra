import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
                    <div className="flex-1 min-w-0 py-8 px-6 lg:px-12 xl:px-20">
                        <div className="max-w-[800px] mx-auto w-full flex flex-col gap-8 pb-20">
                            {/* Breadcrumbs */}
                            <nav className="flex flex-wrap gap-2 text-sm">
                                <a className="text-text-muted hover:text-primary transition-colors" href="#">Home</a>
                                <span className="text-text-muted">/</span>
                                <a className="text-text-muted hover:text-primary transition-colors" href="#">Learn</a>
                                <span className="text-text-muted">/</span>
                                <a className="text-text-muted hover:text-primary transition-colors" href="#">Selling Guide</a>
                                <span className="text-text-muted">/</span>
                                <span className="text-text-main dark:text-white font-medium">Verification</span>
                            </nav>
                            {/* Page Heading */}
                            <div className="flex flex-col gap-4 border-b border-[#e6e6e0] dark:border-[#3a392a] pb-8">
                                <div className="flex items-start justify-between gap-4">
                                    <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em] text-text-main dark:text-white">
                                        Verifying your <br />Micro-Startup
                                    </h1>
                                    <div className="hidden sm:flex size-12 rounded-full bg-primary items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-black text-[28px]">verified</span>
                                    </div>
                                </div>
                                <p className="text-lg text-text-muted max-w-2xl leading-relaxed">
                                    A step-by-step technical guide to verifying ownership of your digital asset using Valyra AI and the Base L2 blockchain infrastructure.
                                </p>
                            </div>
                            {/* Article Content */}
                            <article className="flex flex-col gap-10">
                                {/* Intro Section */}
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    <p className="text-text-main dark:text-gray-300 leading-relaxed">
                                        To list a micro-startup on the Valyra marketplace, you must prove ownership of the web property. Our autonomous agents scan your codebase for a specific cryptographic signature generated by your wallet. This ensures a trustless verification process on the Base L2 network.
                                    </p>
                                </div>
                                {/* Info Callout */}
                                <div className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-primary/10 border border-primary/20">
                                    <div className="shrink-0 size-10 rounded-full bg-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-black">info</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-bold text-text-main dark:text-white">Prerequisites</h4>
                                        <p className="text-sm text-text-main/80 dark:text-gray-300">
                                            Before proceeding, ensure your wallet is connected to the Base Mainnet and you have a small amount of ETH for gas fees (approx. $0.05 USD). You also need to have successfully completed the <a className="underline decoration-primary decoration-2 underline-offset-2 hover:text-primary" href="#">KYC Process</a>.
                                        </p>
                                    </div>
                                </div>
                                {/* Step 1 */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#f5f5f0] dark:bg-[#3a392a] text-sm font-bold">1</span>
                                        Generate Verification Tag
                                    </h2>
                                    <p className="text-text-main dark:text-gray-300">
                                        First, sign a message with your wallet to generate a unique ownership token. This token binds your wallet address to the domain you are selling.
                                    </p>
                                    {/* Interactive Element Placeholder */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white dark:bg-[#2c2b14] border border-[#e6e6e0] dark:border-[#3a392a] shadow-sm gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-gray-500">fingerprint</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm dark:text-white">Domain Signature</span>
                                                <span className="text-xs text-text-muted">Status: Pending Generation</span>
                                            </div>
                                        </div>
                                        <button className="w-full sm:w-auto px-5 py-2 rounded-full bg-[#181811] text-white hover:bg-gray-800 text-sm font-bold transition-colors">
                                            Sign &amp; Generate
                                        </button>
                                    </div>
                                </div>
                                {/* Step 2 */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#f5f5f0] dark:bg-[#3a392a] text-sm font-bold">2</span>
                                        Add Meta Tag to Head
                                    </h2>
                                    <p className="text-text-main dark:text-gray-300">
                                        Copy the code snippet below and paste it into the <code>&lt;head&gt;</code> section of your startup's landing page. Do not modify the content attribute, as it contains your cryptographic signature.
                                    </p>
                                    {/* Code Snippet Widget */}
                                    <div className="relative group rounded-2xl bg-[#181811] p-0 overflow-hidden shadow-lg mt-2">
                                        <div className="flex items-center justify-between px-4 py-3 bg-[#2a2a24] border-b border-gray-700">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-mono">index.html</span>
                                        </div>
                                        <div className="p-6 overflow-x-auto">
                                            <pre className="font-mono text-sm text-gray-300"><code>&lt;!-- Valyra Verification Token --&gt;
&lt;meta name="valyra-verification" content="0x7a2...3f9c" /&gt;
&lt;meta name="valyra-chain-id" content="8453" /&gt;</code></pre>
                                        </div>
                                        <div className="absolute right-4 top-[56px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="flex items-center gap-2 bg-primary text-black hover:bg-white rounded-full px-4 py-1.5 text-xs font-bold transition-all shadow-md">
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                Copy Code
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Step 3 */}
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
                                        <span className="flex items-center justify-center size-8 rounded-full bg-[#f5f5f0] dark:bg-[#3a392a] text-sm font-bold">3</span>
                                        Verify on Chain
                                    </h2>
                                    <p className="text-text-main dark:text-gray-300">
                                        Once the tag is live, click the button below. Our AI agent will crawl your site, verify the signature against the Base L2 ledger, and mint your "Verified Seller" badge.
                                    </p>
                                    <div className="mt-2">
                                        <button className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 rounded-full bg-primary hover:bg-[#e6e205] text-[#181811] font-bold text-base transition-all transform active:scale-95 shadow-lg shadow-primary/20">
                                            <span>Verify Ownership</span>
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                        <p className="mt-3 text-xs text-text-muted flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">timer</span>
                                            Estimated time: ~30 seconds
                                        </p>
                                    </div>
                                </div>
                                {/* Image Section */}
                                <div className="mt-8 relative w-full h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#181811] to-[#2c2b14] flex items-center justify-center group" data-alt="Abstract visualization of blockchain verification process showing data blocks connecting on a digital grid">
                                    {/* Decorative background pattern simulating blockchain connection */}
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#f9f506 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                    <div className="relative z-10 flex flex-col items-center gap-4 text-center p-6">
                                        <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
                                            <span className="material-symbols-outlined text-primary text-4xl">deployed_code</span>
                                        </div>
                                        <h3 className="text-white font-bold text-lg">Automated Smart Contract Deployment</h3>
                                        <p className="text-gray-400 text-sm max-w-md">Valyra automatically handles the legal wrapping and tokenization of your asset once verification is complete.</p>
                                    </div>
                                </div>
                            </article>
                            {/* Feedback Section */}
                            <div className="mt-12 pt-8 border-t border-[#e6e6e0] dark:border-[#3a392a] flex flex-col sm:flex-row justify-between items-center gap-4">
                                <span className="text-sm font-medium text-text-muted">Was this page helpful?</span>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#e6e6e0] dark:border-[#3a392a] hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-text-main dark:text-white">
                                        <span className="material-symbols-outlined text-[18px]">thumb_up</span> Yes
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#e6e6e0] dark:border-[#3a392a] hover:border-red-400 hover:bg-red-50 transition-colors text-sm font-medium text-text-main dark:text-white">
                                        <span className="material-symbols-outlined text-[18px]">thumb_down</span> No
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
