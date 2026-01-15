"use client";

import { MessageSquare, Plus, Trash2, User, LogOut, Sparkles, X } from 'lucide-react';

interface ChatSession {
    id: number;
    title: string;
    messages: any[];
    timestamp: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    chatHistory: ChatSession[];
    currentChatId: number | null;
    onNewChat: () => void;
    onLoadChat: (chat: ChatSession) => void;
    onDeleteChat: (chatId: number, e: React.MouseEvent) => void;
    user: any;
    guestMessageLimit: number;
    guestMessageCount: number;
    onLogout: () => void;
}

export default function ChatSidebar({
    isOpen,
    onClose,
    chatHistory,
    currentChatId,
    onNewChat,
    onLoadChat,
    onDeleteChat,
    user,
    guestMessageLimit,
    guestMessageCount,
    onLogout
}: ChatSidebarProps) {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:translate-x-0 md:w-72 md:flex flex-col ${!isOpen && 'md:hidden'}`}
        >
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">V</div>
                <span className="font-bold text-lg tracking-tight">VEDA AI</span>
                <button
                    onClick={onClose}
                    className="md:hidden ml-auto text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-4">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-medium transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                >
                    <Plus size={18} /> New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">Recent Chats</div>
                {chatHistory.length === 0 ? (
                    <p className="text-slate-600 text-sm text-center py-4 italic">No chat history yet</p>
                ) : (
                    chatHistory.slice(0, 50).map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => onLoadChat(chat)}
                            className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentChatId === chat.id
                                    ? 'bg-slate-800 text-emerald-400 border border-emerald-900/30'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <MessageSquare size={16} />
                            <span className="text-sm truncate flex-1">{chat.title}</span>
                            <button
                                onClick={(e) => onDeleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-slate-200">
                            {user?.isGuest ? 'Guest User' : user?.displayName || user?.email}
                        </div>
                        {user?.isGuest && (
                            <div className="text-xs text-amber-500 flex items-center gap-1">
                                <Sparkles size={10} />
                                {guestMessageLimit - guestMessageCount} left
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                    <LogOut size={16} /> Logout
                </button>
                <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">One Track</p>
                    <p className="text-[10px] text-slate-600">Dev by Shiney</p>
                </div>
            </div>
        </aside>
    );
}
