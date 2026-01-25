"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Input } from "ui";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export function ListingChat() {
    const { isConnected, address } = useAccount();
    const [messages, setMessages] = useState<{ id: number, text: string, sender: 'me' | 'other', time: string }[]>([
        { id: 1, text: "Hi, is the revenue strictly from subscriptions?", sender: 'me', time: '10:42 AM' },
        { id: 2, text: "Yes, 100% recurring via Stripe.", sender: 'other', time: '10:45 AM' },
        { id: 3, text: "Can I see the churn metrics?", sender: 'me', time: '10:46 AM' },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(messages.length);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            scrollToBottom();
            prevMessagesLength.current = messages.length;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now(),
            text: newMessage,
            sender: 'me' as const,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, msg]);
        setNewMessage("");

        // Simulate reply
        setTimeout(() => {
            const reply = {
                id: Date.now() + 1,
                text: "I'll upload the latest churn report to the documents section shortly.",
                sender: 'other' as const,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    };

    const handleConnect = () => {
        // This would typically trigger the wallet connection modal
        // Since we don't have direct access to the connect function here without passing it down
        // We'll simulate it for the UI demo if the user isn't connected via the global provider yet
        // In a real app, the `ConnectWallet` button from OnchainKit would be used here.
        setIsConnecting(true);
        // For demo purposes, we rely on the actual wagmi state.
        // If not connected, the user should connect via the header button.
        toast.error("Please connect your wallet using the button in the top right corner.");
        setIsConnecting(false);
    };

    return (
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-sm h-[400px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/50 dark:bg-white/5">
                <div>
                    <h3 className="font-bold text-text-main dark:text-white">Seller Chat</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-medium text-text-muted">Online</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-muted">Secured by XMTP</span>
                    <span className="material-symbols-outlined text-primary text-lg">lock</span>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30 dark:bg-black/20">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'me'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-text-main dark:text-white rounded-tl-none shadow-sm'
                                }`}
                        >
                            {msg.text}
                        </div>
                        <span className="text-[10px] text-text-muted mt-1 px-1">
                            {msg.time}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input or Gated Overlay */}
            {!isConnected ? (
                <div className="absolute inset-0 top-[73px] flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm p-6 text-center z-10">
                    <div className="scale-110 mb-6 flex size-16 items-center justify-center rounded-full bg-text-main dark:bg-white text-primary shadow-xl ring-4 ring-primary/20">
                        <span className="material-symbols-outlined text-3xl">token</span>
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-text-main dark:text-white">Token-Gated Chat</h4>
                    <p className="mb-8 max-w-sm text-sm text-text-muted leading-relaxed">
                        Hold at least <strong>10 IDRX</strong> to message the seller directly. This ensures high-quality discussions.
                    </p>
                    <Button
                        variant="primary"
                        size="lg"
                        className="rounded-full px-8 shadow-lg hover:shadow-primary/50"
                        onClick={handleConnect}
                    >
                        Connect Wallet to Access
                    </Button>
                </div>
            ) : (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="flex size-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
