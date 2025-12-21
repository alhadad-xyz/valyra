import { Button } from "ui";

export function Step4Confirmation() {
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-text-main">
                        <span className="material-symbols-outlined text-[24px]">thumb_up</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Confirm Receipt</h3>
                        <p className="text-text-muted text-sm">Verify that you have received and tested all assets</p>
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-6 mb-8">
                    <h4 className="flex items-center gap-2 font-bold text-yellow-800 dark:text-yellow-500 mb-2">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                        Important Notice
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400/90 leading-relaxed">
                        By confirming receipt, you authorize the smart contract to release funds to the seller.
                        This action <strong>cannot be undone</strong>. Please ensure you have full access to all listed assets.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1 h-12 bg-primary hover:bg-[#e4e005] text-text-main font-bold rounded-full flex items-center justify-center gap-2 transition-all shadow-md">
                        <span className="material-symbols-outlined">check_circle</span>
                        Confirm & Release Funds
                    </Button>
                    <Button variant="ghost" className="px-6 h-12 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 font-bold">
                        <span className="material-symbols-outlined mr-2">gavel</span>
                        Raise Dispute
                    </Button>
                </div>
            </div>
        </div>
    );
}
