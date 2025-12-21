import { Button } from "ui";

interface EscrowHeaderProps {
    transactionId: string;
    status: string;
    startDate: string;
    contractAddress: string;
}

export function EscrowHeader({
    transactionId,
    status,
    startDate,
    contractAddress
}: EscrowHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white">
                        {transactionId}
                    </h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                        {status}
                    </span>
                </div>
                <p className="text-text-muted text-sm font-medium">
                    Started on {startDate} • Smart Contract: {contractAddress}
                </p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-4 h-10 rounded-full border border-error/20 text-error hover:bg-error/10 text-sm font-bold transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">gavel</span>
                    Raise Dispute
                </Button>
            </div>
        </div>
    );
}
