import { Button } from "ui";

export function Step5Released() {
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col items-center text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-6">
                        <span className="material-symbols-outlined text-[40px]">celebration</span>
                    </div>

                    <h3 className="text-2xl font-black text-text-main dark:text-white mb-2">Transaction Complete!</h3>
                    <p className="text-text-muted mb-8 max-w-md">
                        Funds have been successfully released to the seller. Ownership of assets has been transferred.
                    </p>

                    <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-8 text-left">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                            <span className="text-sm font-bold text-text-main dark:text-white">Settlement Details</span>
                            <span className="text-xs text-green-600 flex items-center gap-1 font-bold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-[14px]">check</span>
                                Success
                            </span>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Total Released</span>
                                <span className="font-bold text-text-main dark:text-white">43.875M IDRX</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Transaction Hash</span>
                                <a href="#" className="text-primary hover:underline font-mono">0x7d...2a9f</a>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Time</span>
                                <span className="text-text-main dark:text-white">Oct 27, 2023 at 14:20 PM</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" className="rounded-full">
                            View Receipt
                        </Button>
                        <Button className="rounded-full bg-primary text-text-main font-bold">
                            View on Explorer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
