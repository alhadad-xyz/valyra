import { Button } from "ui";

export function Step0Funding() {
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Awaiting Payment</h3>
                        <p className="text-text-muted text-sm">Deposit funds to secure this transaction</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <div className="text-sm text-text-muted mb-2">Amount Required</div>
                        <div className="text-3xl font-black text-text-main dark:text-white mb-1">45.0M IDRX</div>
                        <div className="text-xs text-text-muted">≈ $2,850 USD</div>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Available Balance</span>
                                <span className="font-bold text-text-main dark:text-white">125.0M IDRX</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Gas Fee (Base L2)</span>
                                <span className="font-bold text-success">Creating...</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-3">
                        <Button
                            variant="primary"
                            fullWidth
                            className="h-12 text-lg font-bold shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined mr-2">payments</span>
                            Pay 45.0M IDRX
                        </Button>
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">Or</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <Button
                            variant="secondary"
                            fullWidth
                            className="h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <span className="material-symbols-outlined mr-2">currency_exchange</span>
                            Pay with USDC (Swap)
                        </Button>
                        <p className="text-xs text-center text-text-muted mt-2">
                            Funds will be locked in the Valyra Smart Contract until you confirm receipt.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
