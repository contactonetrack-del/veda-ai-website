"use client";

import { useState, useEffect } from 'react';
import { Trash2, Cpu } from 'lucide-react';
import { getMemories, deleteMemory, clearMemory } from '@/lib/api';

interface Memory {
    id: string;
    text: string;
    created_at: string;
    metadata?: {
        role?: string;
    };
}

interface User {
    uid: string;
    [key: string]: any;
}

export default function MemoryBank({ user }: { user: User | null }) {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMemories();
        }
    }, [user]);

    const fetchMemories = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await getMemories(user.uid);
            setMemories(data);
        } catch (error) {
            console.error("Failed to load memories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        try {
            await deleteMemory(user.uid, id);
            setMemories(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to delete memory", error);
        }
    };

    const handleClearAll = async () => {
        if (!user) return;
        if (window.confirm("Are you sure you want to wipe all long-term memory? This cannot be undone.")) {
            try {
                await clearMemory(user.uid);
                setMemories([]);
            } catch (error) {
                console.error("Failed to clear memory", error);
            }
        }
    };

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 mb-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                <h3 className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                    <Cpu size={18} /> Neural Memory Bank
                </h3>
                <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-colors border border-red-900/30"
                    title="Clear All Memory"
                >
                    <Trash2 size={12} /> Wipe Core
                </button>
            </div>

            <div className="mb-3 text-xs text-slate-500 font-mono">
                {memories.length} Active Memory Vectors
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-500 text-sm gap-2">
                        <Cpu size={16} className="animate-pulse" /> Accessing Neural Core...
                    </div>
                ) : memories.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm italic border border-dashed border-slate-700 rounded-lg">
                        No long-term memories stored yet.
                    </div>
                ) : (
                    memories.map(mem => (
                        <div key={mem.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 group hover:border-emerald-900/50 transition-colors">
                            <div className="text-slate-300 text-sm leading-relaxed mb-2">{mem.text}</div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded uppercase text-[10px] font-bold ${mem.metadata?.role === 'user' ? 'bg-blue-900/30 text-blue-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                        {mem.metadata?.role || 'assistant'}
                                    </span>
                                    <span>{new Date(mem.created_at).toLocaleDateString()}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(mem.id)}
                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-900/20 rounded"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
