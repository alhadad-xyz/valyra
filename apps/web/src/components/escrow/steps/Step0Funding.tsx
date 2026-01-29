import { Button } from "ui";

interface Step0FundingProps {
    escrow: any;
    onCompleteFunding: () => void;
    isPending?: boolean;
}

export function Step0Funding({ escrow, onCompleteFunding, isPending }: Step0FundingProps) {
    const totalAmount = Number(escrow?.amount || 0);
    const platformFee = 5000; // Hardcoded gas/network fee estimation
    const baseAmount = totalAmount - platformFee;

    // Formatting helper
    const fmt = (val: number) => (val / 1e18).toLocaleString();

    return (

        <div className="">

            {/* Transaction Content */}
            <div className="p-8 flex flex-col items-center text-center">
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <span className="material-symbols-outlined text-4xl">account_balance_wallet</span>
                </div>
                <h1 className="text-text-main dark:text-white text-3xl font-bold tracking-tight">Awaiting Payment</h1>
                <p className="text-text-muted dark:text-gray-400 text-sm mt-1">
                    Transaction ID: ESC-{escrow?.on_chain_id?.toString() || escrow?.id?.slice(0, 8) || "..."}
                </p>

                {/* Large Amount Display */}
                <div className="mt-8 mb-8">
                    <div className="text-[32px] md:text-[42px] font-bold text-primary leading-none tracking-tight break-all">
                        {fmt(totalAmount)} IDRX
                    </div>
                    <div className="text-text-muted dark:text-gray-400 text-lg mt-2 font-medium">≈ ${fmt(totalAmount)} USD</div>
                </div>

                {/* Fee Breakdown */}
                <div className="w-full bg-background-light dark:bg-gray-800/50 rounded-lg p-5 flex flex-col gap-3 border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted dark:text-gray-400">Base Amount</span>
                        <span className="text-text-main dark:text-white font-medium">{fmt(baseAmount > 0 ? baseAmount : 0)} IDRX</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1 text-text-muted dark:text-gray-400">
                            <span>Network/Gas Fee (Est)</span>
                            <span className="material-symbols-outlined text-sm cursor-help" title="Gas fees on Base L2">info</span>
                        </div>
                        <span className="text-text-main dark:text-white font-medium">~0.005 IDRX</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
                        <span className="text-text-main dark:text-white font-bold">Total Payment</span>
                        <span className="text-text-main dark:text-white font-bold">{fmt(totalAmount)} IDRX</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full mt-8 flex flex-col gap-3">
                    <Button
                        onClick={onCompleteFunding}
                        disabled={isPending}
                        className="w-full h-auto py-4 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <span>Pay {fmt(totalAmount)} IDRX</span>
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={true}
                        className="w-full h-auto py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-500 cursor-not-allowed"
                    >
                        <span>Pay with USDC (Swap) - Coming Soon</span>
                    </Button>
                </div>

                {/* Security Disclaimer */}
                <div className="mt-8 flex items-start gap-3 text-left">
                    <span className="material-symbols-outlined text-green-500 text-xl mt-0.5">lock</span>
                    <p className="text-text-muted dark:text-gray-400 text-xs leading-relaxed italic">
                        Your funds will be held securely in a non-custodial smart contract and released only upon
                        completion of the escrow terms. Neither party can access funds without mutual agreement or
                        dispute resolution.
                    </p>
                </div>
            </div>
        </div>
    );
}
