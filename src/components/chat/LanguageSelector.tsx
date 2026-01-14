"use client";

import { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getSavedLanguage, saveLanguage } from '@/lib/api';

interface LanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (code: string) => void;
}

const LANGUAGES = Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => ({
    code,
    name: lang.name,
    beta: lang.beta,
    flag: lang.flag
}));

export default function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

    const handleSelect = (code: string) => {
        saveLanguage(code);
        onLanguageChange(code);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-full px-3 py-1.5 text-sm text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Globe size={16} className="text-emerald-400" />
                <span className="font-medium">{currentLang.name.split(' ')[0]}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors ${selectedLanguage === lang.code
                                        ? 'bg-emerald-900/40 text-emerald-400'
                                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                    }`}
                                onClick={() => handleSelect(lang.code)}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.name}</span>
                                    {lang.beta && (
                                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                            Beta
                                        </span>
                                    )}
                                </div>
                                {selectedLanguage === lang.code && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </div>
    );
}
