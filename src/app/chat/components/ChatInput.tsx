"use client";

import { Send } from 'lucide-react';
import VoiceButton from '@/components/chat/VoiceButton';
import { SUPPORTED_LANGUAGES } from '@/lib/api';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    isLoading: boolean;
    selectedLanguage: string;
}

export default function ChatInput({
    value,
    onChange,
    onSend,
    isLoading,
    selectedLanguage
}: ChatInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <>
            {/* Input Box */}
            <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl focus-within:bg-slate-800 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all shadow-sm">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedLanguage === 'hi' ? 'VEDA AI से कुछ पूछें...' : 'Ask about health, fitness, yoga...'}
                    className="w-full bg-transparent text-white px-4 py-4 pr-24 focus:outline-none placeholder:text-slate-500 placeholder:text-sm"
                    disabled={isLoading}
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <VoiceButton
                        onTranscript={(text) => onChange(text)}
                        language={selectedLanguage}
                    />
                    <button
                        onClick={onSend}
                        disabled={!value.trim() || isLoading}
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <p className="text-center text-[10px] text-slate-600">
                {SUPPORTED_LANGUAGES[selectedLanguage]?.flag} {SUPPORTED_LANGUAGES[selectedLanguage]?.name} • VEDA AI can make mistakes. Verify important information.
            </p>
        </>
    );
}
