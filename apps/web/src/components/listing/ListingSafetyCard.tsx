"use client";

export function ListingSafetyCard() {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5 shadow-sm">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">Safety & Trust</h4>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-primary bg-black rounded-full p-1 text-[16px]">
                        lock
                    </span>
                    <div>
                        <p className="text-sm font-bold text-text-main dark:text-white">Escrow Protected</p>
                        <p className="text-xs text-text-muted">Funds held in smart contract until transfer confirmed.</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-primary bg-black rounded-full p-1 text-[16px]">
                        security
                    </span>
                    <div>
                        <p className="text-sm font-bold text-text-main dark:text-white">Code Audited</p>
                        <p className="text-xs text-text-muted">Smart contracts verified by CertiK.</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 text-center">
                <a className="text-xs font-bold text-text-muted hover:text-primary transition-colors" href="#">
                    Learn about Valyra Safety
                </a>
            </div>
        </div>
    );
}
