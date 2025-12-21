import { Button } from "ui";

export function Step2Handover() {
    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[24px]">upload_file</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Assets Uploaded & Encrypted</h3>
                        <p className="text-text-muted text-sm">Seller has transferred digital assets to the vault</p>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 text-[24px]">verified_user</span>
                                <span className="font-bold text-text-main dark:text-white">5 Items Verified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 text-[24px]">lock</span>
                                <span className="font-bold text-text-main dark:text-white">Encrypted via Smart Wallet</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-500 text-[24px]">history</span>
                                <span className="font-bold text-text-main dark:text-white">Version Controlled (Git)</span>
                            </div>
                        </div>

                        <div className="w-full md:w-px h-px md:h-24 bg-gray-200 dark:border-gray-800"></div>

                        <div className="flex-1 w-full text-sm text-text-muted">
                            <p className="mb-2">Assets in bundle:</p>
                            <ul className="space-y-2 list-disc list-inside">
                                <li>Source Code Repository Access</li>
                                <li>Domain Name Transfer Auth Code</li>
                                <li>AWS Root Credentials</li>
                                <li>Stripe Account Ownership Transfer</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="text-sm text-text-muted italic flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                        Waiting for buyer verification start...
                    </div>
                </div>
            </div>
        </div>
    );
}
