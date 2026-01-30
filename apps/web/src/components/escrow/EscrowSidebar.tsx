"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "ui";

interface EscrowSidebarProps {
    escrow?: any;
    currentUserAddress?: string;
    userRole: 'buyer' | 'seller' | 'viewer';
}

interface ActivityLogItem {
    date: Date;
    title: string;
    description?: string;
    type: string;
}

export function EscrowSidebar({ escrow, currentUserAddress, userRole }: EscrowSidebarProps) {
    const [activeTab, setActiveTab] = useState<"activity" | "chat">("activity");

    // Chat State
    const [messages, setMessages] = useState<{ id: number, text: string, sender: 'me' | 'other', time: string }[]>([
        { id: 1, text: "Hi, I have a question about the domain transfer.", sender: 'me', time: '10:42 AM' },
        { id: 2, text: "Sure, what would you like to know?", sender: 'other', time: '10:45 AM' }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, activeTab]);

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
                text: "I'll check on that for you.",
                sender: 'other' as const,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, reply]);
        }, 2000);
    };

    // Activity Log Generation
    // Activity Log Generation
    const generateActivityLog = (): ActivityLogItem[] => {
        if (!escrow) return [];

        // Use DB events if available (Optimal Way)
        if (escrow.events && Array.isArray(escrow.events) && escrow.events.length > 0) {
            return escrow.events.map((e: any) => ({
                date: new Date(e.timestamp),
                title: e.title,
                description: e.description,
                type: e.event_type?.toLowerCase() || 'info'
            })).sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
        }

        // Fallback for legacy data
        const logs = [];

        if (escrow.created_at) {
            logs.push({
                date: new Date(escrow.created_at),
                title: "Transaction Created",
                type: 'created'
            });
        }
        if (escrow.depositedAt) {
            logs.push({
                date: new Date(Number(escrow.depositedAt) * 1000),
                title: `Escrow Funded (${(Number(escrow.amount) / 1e18).toLocaleString()} IDRX)`,
                type: 'funded'
            });
        }
        if (escrow.credentials_ipfs_hash) {
            // Estimate based on updated_at if no event
            logs.push({
                date: new Date(escrow.updated_at || Date.now()),
                title: "Assets Uploaded",
                type: 'assets_uploaded'
            });
        }

        return logs.sort((a, b) => b.date.getTime() - a.date.getTime());
    };

    const logs = generateActivityLog();

    return (
        <div className="bg-white dark:bg-background-dark-elevated rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-[600px] overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab("activity")}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "activity"
                        ? "text-text-main dark:text-white border-b-2 border-primary bg-primary/5"
                        : "text-text-muted hover:text-text-main dark:hover:text-white"
                        }`}
                >
                    Activity Log
                </button>
                <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "chat"
                        ? "text-text-main dark:text-white border-b-2 border-primary bg-primary/5"
                        : "text-text-muted hover:text-text-main dark:hover:text-white"
                        }`}
                >
                    Secure Chat
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 relative">
                {activeTab === "activity" ? (
                    <>
                        {logs.length === 0 ? (
                            <div className="text-center text-text-muted text-sm mt-10">No activity yet.</div>
                        ) : (
                            logs.map((log, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${log.type === 'funded' ? 'bg-success' :
                                            log.type === 'confirmed' ? 'bg-blue-500' :
                                                log.type === 'disputed' ? 'bg-red-500' :
                                                    log.type === 'resolved' ? 'bg-purple-500' :
                                                        log.type === 'completed' ? 'bg-green-600' :
                                                            'bg-gray-300 dark:bg-gray-600'
                                            }`}></div>
                                        {idx !== logs.length - 1 && <div className="w-px h-full bg-gray-200 dark:bg-gray-800 my-1"></div>}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-xs font-bold text-text-muted mb-1">{format(log.date, "MMM d, h:mm a")}</p>
                                        <p className="text-sm font-medium text-text-main dark:text-white">{log.title}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${msg.sender === 'me'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white rounded-tl-none'
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
                    </div>
                )}
            </div>

            {/* Chat Input (Only visible on chat tab) */}
            {activeTab === 'chat' && (
                <div className="p-3 bg-white dark:bg-background-dark-elevated border-t border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            className="w-full h-10 pl-4 pr-10 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white"
                            placeholder="Message..."
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
