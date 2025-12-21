export function ExploreTrustBar() {
    return (
        <div className="bg-primary/5 border-y border-primary/10 py-2">
            <div className="max-w-8xl mx-auto px-4 md:px-10 lg:px-40 flex flex-wrap justify-center gap-4 md:gap-8 text-[10px] md:text-sm font-medium text-text-muted dark:text-gray-400">
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="material-symbols-outlined text-primary text-sm md:text-base">verified</span>
                    <span>Build ID Verified</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="material-symbols-outlined text-primary text-sm md:text-base">lock</span>
                    <span>Smart Contract Escrow</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="material-symbols-outlined text-primary text-sm md:text-base">payments</span>
                    <span>2.5% Platform Fee</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 md:flex hidden">
                    <span className="material-symbols-outlined text-primary text-sm md:text-base">speed</span>
                    <span>Instant Settlement</span>
                </div>
            </div>
        </div>
    );
}
