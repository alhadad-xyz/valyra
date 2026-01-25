"use client";

import { FC, useState } from 'react';
import { Button } from 'ui';
import { useSellStore } from '../../stores/useSellStore';
import { useSignMessage } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import { toast } from 'sonner';

export const StepIPAssignment: FC = () => {
    const {
        title, websiteUrl,
        setField, nextStep, prevStep,
        sellerSignature
    } = useSellStore();

    const { signMessageAsync, isPending } = useSignMessage();
    const [isSigning, setIsSigning] = useState(false);

    // Construct the legal agreement text
    const agreementText = `I, the Seller, hereby irrevocably transfer all intellectual property rights including but not limited to: source code, designs, trademarks, and customer data for the project "${title}" (${websiteUrl}) to the Buyer upon completion of the transaction via Valyra Smart Contracts.`;

    const handleSign = async () => {
        try {
            setIsSigning(true);
            const timestamp = Math.floor(Date.now() / 1000);

            // Create a structured message for signing
            // In production, EIP-712 is preferred, but personal_sign is fine for MVP
            const messageToSign = `${agreementText}\n\nTimestamp: ${timestamp}`;
            const hash = keccak256(toBytes(messageToSign));

            const signature = await signMessageAsync({
                message: messageToSign,
            });

            // Store in global state
            setField('ipAssignmentHash', hash);
            setField('ipSignedAt', timestamp);
            setField('sellerSignature', signature);

            // Auto-advance after short delay
            setTimeout(() => {
                nextStep();
            }, 1000);

        } catch (error) {
            console.error("Signing failed:", error);
            toast.error("Failed to sign IP Assignment. Please try again.");
        } finally {
            setIsSigning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-background-dark-elevated rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">gavel</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main dark:text-white">IP Transfer Agreement</h3>
                            <p className="text-text-muted text-sm">Sign to authorize legal transfer of assets</p>
                        </div>
                    </div>



                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
                        <div className="prose dark:prose-invert text-sm max-w-none">
                            <h4 className="uppercase font-bold text-xs tracking-wider text-text-muted mb-2">Agreement Preview</h4>
                            <p className="font-serif italic text-lg leading-relaxed text-text-main dark:text-gray-300 border-l-4 border-primary pl-4 py-2 bg-white dark:bg-black/20 rounded-r-lg">
                                "{agreementText}"
                            </p>
                            <p className="text-xs text-text-muted mt-4">
                                This cryptographic signature will be stored on-chain as immutable proof of intent to transfer ownership.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {sellerSignature ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400">verified_user</span>
                                <div>
                                    <p className="font-bold text-green-700 dark:text-green-300 text-sm">Successfully Signed</p>
                                    <p className="text-xs text-green-600/80 dark:text-green-400/80 font-mono truncate max-w-[200px] sm:max-w-md">
                                        {sellerSignature}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Button
                                size="lg"
                                className="w-full max-w-sm mx-auto h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-full shadow-lg shadow-primary/25 transition-all"
                                onClick={handleSign}
                                disabled={isSigning || isPending}
                                loading={isSigning || isPending}
                            >
                                {isSigning || isPending ? "Signing..." : "Sign IP Assignment"}
                            </Button>
                        )}

                        <p className="text-center text-xs text-text-muted">
                            By signing, you agree to Valyra's Terms of Service and Seller Code of Conduct.
                        </p>

                        {/* DEV ONLY: Bypass Button */}
                        {process.env.NODE_ENV === 'development' && !sellerSignature && (
                            <div className="pt-4 border-t border-dashed border-gray-300 dark:border-gray-800 text-center">
                                <p className="text-xs text-red-500 mb-2 font-bold uppercase">Development Mode Only</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-text-muted hover:text-red-500"
                                    onClick={() => {
                                        setField('ipAssignmentHash', '0xMOCK_HASH_' + Date.now());
                                        setField('ipSignedAt', Math.floor(Date.now() / 1000));
                                        setField('sellerSignature', '0xMOCK_SIGNATURE_' + Date.now());
                                        setTimeout(nextStep, 500);
                                    }}
                                >
                                    [DEV] Bypass Signing
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
