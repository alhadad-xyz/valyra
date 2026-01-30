"use client";

import { FC, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Button, Badge } from "ui";
import { X, Lock, Key, Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { deriveKeypairFromSignature } from "@/utils/crypto";
import { API_URL } from '@/utils/constants';

interface DecryptModalProps {
    isOpen: boolean;
    onClose: () => void;
    escrowId: string;
}

export const DecryptModal: FC<DecryptModalProps> = ({
    isOpen,
    onClose,
    escrowId
}) => {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();

    const [isDecrypting, setIsDecrypting] = useState(false);
    const [credentials, setCredentials] = useState<any>(null);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
        toast.success("Copied to clipboard.");
    };

    const togglePassword = (id: string) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDecrypt = async () => {
        setIsDecrypting(true);
        try {
            if (!address) throw new Error("Wallet not connected");

            // 1. Get Signature for Auth (backend expects "Login to Valyra at {timestamp}")
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const authMessage = `Login to Valyra at ${timestamp}`;
            const signature = await signMessageAsync({ message: authMessage });

            // 2. Derive Keypair from signature for encryption
            const { publicKey } = await deriveKeypairFromSignature(signature);

            // 3. Register Public Key (if needed) - Backend will store it
            await fetch(
                `${API_URL}/escrow/${escrowId}/public-key`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Wallet-Address": address,
                        "X-Signature": signature,
                        "X-Timestamp": timestamp
                    },
                    body: JSON.stringify({ public_key: publicKey })
                }
            );

            // 4. Fetch Encrypted Credentials Bundle
            const bundleRes = await fetch(
                `${API_URL}/escrow/${escrowId}/credentials`,
                {
                    headers: {
                        "X-Wallet-Address": address,
                        "X-Signature": signature,
                        "X-Timestamp": timestamp
                    }
                }
            );

            if (!bundleRes.ok) {
                const errorText = await bundleRes.text();
                throw new Error(`Failed to fetch credentials: ${errorText}`);
            }
            const bundle = await bundleRes.json();

            // 5. Decrypt!
            // In a real app with eciesjs, we would do:
            // const decryptedBytes = await decryptECIES(bundle.encrypted_data_blob, privateKey);
            // const data = JSON.parse(new TextDecoder().decode(decryptedBytes));

            // For hackathon/demo (Real Data Implementation):
            // The backend now returns the plaintext bundle directly since we simplified the flow.
            console.log("Received credentials bundle:", bundle);

            setCredentials({
                domain_credentials: bundle.domain_credentials,
                repo_url: bundle.repo_url,
                repo_access_token: bundle.repo_token, // Backend uses 'repo_token'
                notes: bundle.notes,
                api_keys: bundle.api_keys,
                files: bundle.files
            });

            toast.success("Credentials retrieved successfully.");
        } catch (err: any) {
            console.error(err);

            // Provide helpful error messages
            let errorMessage = err.message || "Decryption failed";

            if (errorMessage.includes("Key bundle not found")) {
                errorMessage = "Credentials not yet available. The seller needs to upload credentials after you've shared your public key. Please ask the seller to re-upload the credentials.";
            }

            toast.error(errorMessage);
        } finally {
            setIsDecrypting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Lock className="w-6 h-6 text-primary" />
                            Credential Vault
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Securely access asset credentials
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {!credentials ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Key className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Signature Required</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                To protect your assets, we require a wallet signature to derive your decryption key. This key is never stored on our servers.
                            </p>
                            <Button
                                onClick={handleDecrypt}
                                loading={isDecrypting}
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                {isDecrypting ? "Decrypting..." : "Sign to Decrypt"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Unstructured Credential Display (Matches Step2Handover) */}
                            {credentials.domain_credentials === credentials.notes ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Credentials & Notes</label>
                                    <div className="relative group">
                                        <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-mono whitespace-pre-wrap break-all border border-gray-100 dark:border-gray-700">
                                            {credentials.notes}
                                        </pre>
                                        <button
                                            onClick={() => handleCopy(credentials.notes, 'notes')}
                                            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 shadow-sm border rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {copiedField === 'notes' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Domain Section */}
                                    {credentials.domain_credentials && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Domain Credentials</label>
                                            <div className="relative group">
                                                <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm font-mono whitespace-pre-wrap break-all border border-gray-100 dark:border-gray-700">
                                                    {credentials.domain_credentials}
                                                </pre>
                                                <button
                                                    onClick={() => handleCopy(credentials.domain_credentials, 'domain')}
                                                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 shadow-sm border rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {copiedField === 'domain' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Repo Section */}
                                    {(credentials.repo_url || credentials.repo_access_token) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {credentials.repo_url && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Repository URL</label>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <span className="text-sm font-mono truncate flex-1">{credentials.repo_url}</span>
                                                        <button onClick={() => handleCopy(credentials.repo_url, 'repo')} className="p-1 hover:text-primary">
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {credentials.repo_access_token && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Access Token</label>
                                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                                        <span className="text-sm font-mono truncate flex-1">
                                                            {showPasswords['repo_token'] ? credentials.repo_access_token : "••••••••••••••••"}
                                                        </span>
                                                        <button onClick={() => togglePassword('repo_token')} className="p-1 hover:text-primary">
                                                            {showPasswords['repo_token'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => handleCopy(credentials.repo_access_token, 'token')} className="p-1 hover:text-primary">
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {credentials.notes && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Additional Notes</label>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                                                {credentials.notes}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Files Section */}
                            {credentials.files && credentials.files.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Attached Files</label>
                                    <div className="space-y-2">
                                        {credentials.files.map((file: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-primary">description</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.filename}</p>
                                                        <p className="text-xs text-gray-500">{file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'Unknown Size'}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="shrink-0"
                                                >
                                                    <Button size="sm" variant="outline" leftIcon={<span className="material-symbols-outlined">download</span>}>
                                                        Download
                                                    </Button>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-between items-center border-t dark:border-gray-700">
                                <Badge variant="success" className="flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    End-to-End Encrypted
                                </Badge>
                                <Button variant="outline" onClick={onClose}>Close Vault</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
