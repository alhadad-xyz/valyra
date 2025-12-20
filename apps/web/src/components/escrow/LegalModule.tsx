import { Button } from "ui";

export function LegalModule() {
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <span className="material-symbols-outlined text-text-main dark:text-white">verified_user</span>
                </div>
                <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded">Signed</span>
            </div>

            <div>
                <h4 className="text-lg font-bold text-text-main dark:text-white mb-1">e-Meterai Agreement</h4>
                <p className="text-sm text-text-muted mb-4">Legally binding acquisition contract</p>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-main dark:text-white truncate">Acquisition_Contract_v2.pdf</p>
                        <p className="text-xs text-text-muted">2.4 MB • Signed Oct 23</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button variant="ghost" className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Download Agreement
                </Button>
            </div>
        </div>
    );
}
