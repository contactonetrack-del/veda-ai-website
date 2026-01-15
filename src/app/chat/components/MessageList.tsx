"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import { SourcesCitation, AgentBadge } from '@/components/SourcesCitation';
import MemoryBank from '@/components/chat/MemoryBank';

interface Message {
    role: 'assistant' | 'user';
    content: string;
    sources?: any[];
    agentUsed?: string | null;
    intent?: string;
    verified?: boolean;
    confidence?: number;
}

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    loadingText: string;
    user: any;
    showMemory: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function MessageList({
    messages,
    isLoading,
    loadingText,
    user,
    showMemory,
    messagesEndRef
}: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative">
            {showMemory && (
                <div className="max-w-3xl mx-auto">
                    <MemoryBank user={user} />
                </div>
            )}

            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-800 shadow-lg shadow-emerald-900/40 text-white'
                        : 'bg-slate-700 text-slate-200'
                        }`}>
                        {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                    </div>

                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className="text-xs text-slate-500 mb-1 px-1">
                            {msg.role === 'assistant' ? 'VEDA AI' : (user?.displayName || 'You')}
                        </div>
                        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'assistant'
                            ? 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none'
                            : 'bg-emerald-700 text-white rounded-tr-none shadow-md shadow-emerald-900/10'
                            }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>

                                    {msg.agentUsed && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <AgentBadge agent={msg.agentUsed} intent={msg.intent} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                            <SourcesCitation
                                sources={msg.sources}
                                verified={msg.verified}
                                confidence={msg.confidence}
                            />
                        )}
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex gap-4 max-w-3xl mx-auto">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white">
                        <Bot size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                        <div className="text-xs text-slate-500 mb-1 px-1">VEDA AI</div>
                        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono animate-pulse">{loadingText}</span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
