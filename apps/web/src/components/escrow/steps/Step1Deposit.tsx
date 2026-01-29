import { format } from "date-fns";

interface Step1DepositProps {
    escrow: any; // Type as needed, matching page.tsx merged type
}

export function Step1Deposit({ escrow }: Step1DepositProps) {
    const totalAmount = Number(escrow?.amount || 0);
    const platformFee = Number(escrow?.platformFee || 0);
    const sellerPayout = Number(escrow?.sellerPayout || totalAmount * 0.975); // Fallback if 0
    // If platformFee is 0 in contract (not set yet? usually set on deposit), fallback
    const displayPlatformFee = platformFee || totalAmount * 0.025;
    const displaySellerPayout = sellerPayout || totalAmount * 0.975;

    const fmt = (val: number) => (val / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 });

    // Formatting helper for currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Mock conversion rate for display - real app would fetch this
    const approxUsd = (Number(totalAmount) / 1e18) * 0.000063; // Example rate

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">lock</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Funds Secured in Escrow</h3>
                        <p className="text-gray-500 text-sm">Deposit verified on Base L2</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                            <div className="text-sm text-gray-500 mb-1">Total Amount Locked</div>
                            <div className="text-3xl font-black text-text-main dark:text-white">{fmt(totalAmount)} IDRX</div>
                            <div className="text-xs text-primary mt-1 font-mono">≈ {formatCurrency(approxUsd)} USD</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                            <span>Deposited on {escrow?.depositedAt ? format(new Date(Number(escrow.depositedAt) * 1000), "PPP p") : "Pending..."}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-text-main dark:text-white text-sm uppercase tracking-wider">Fee Breakdown</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Seller Payout (97.5%)</span>
                                <span className="font-bold text-text-main dark:text-white">{fmt(displaySellerPayout)} IDRX</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Platform Fee (2.5%)</span>
                                    <span className="material-symbols-outlined text-xs text-center text-gray-400 cursor-help" title="Standard platform fee">help</span>
                                </div>
                                <span className="font-bold text-gray-500">{fmt(displayPlatformFee)} IDRX</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
