"use client";

import React, { useState } from 'react';
import { ChevronDown, Sparkles, Zap, Lightbulb, GraduationCap, Globe, BarChart2, Heart, Search, Shield } from 'lucide-react';

const CONVERSATION_STYLES = [
    { id: 'auto', label: 'Auto', icon: Sparkles, description: 'Balanced thinking' },
    { id: 'fast', label: 'Fast', icon: Zap, description: 'Quick, concise responses' },
    { id: 'planning', label: 'Planning', icon: Lightbulb, description: 'Structured brainstorming' }
];

const CHAT_MODES = [
    { id: 'auto', label: 'Auto', icon: Sparkles, description: 'Let AI choose the best agent' },
    { id: 'study', label: 'Study', icon: GraduationCap, description: 'Critical thinking & clarity' },
    { id: 'research', label: 'Research', icon: Globe, description: 'Deep analysis with web sources' },
    { id: 'analyze', label: 'Analyze', icon: BarChart2, description: 'Math & data calculations' },
    { id: 'wellness', label: 'Wellness', icon: Heart, description: 'Yoga, Ayurveda & Diet' },
    { id: 'search', label: 'Search', icon: Search, description: 'Live web search' },
    { id: 'protection', label: 'Protection', icon: Shield, description: 'Insurance guidance' }
];

interface ModeSelectorProps {
    selectedMode: string;
    onModeChange: (mode: string) => void;
    conversationStyle: string;
    onStyleChange: (style: string) => void;
}

export default function ModeSelector({
    selectedMode,
    onModeChange,
    conversationStyle,
    onStyleChange
}: ModeSelectorProps) {
    const [showStyleDropdown, setShowStyleDropdown] = React.useState(false);
    const [showModeDropdown, setShowModeDropdown] = React.useState(false);

    const currentStyle = CONVERSATION_STYLES.find(s => s.id === conversationStyle) || CONVERSATION_STYLES[0];
    const currentMode = CHAT_MODES.find(m => m.id === selectedMode) || CHAT_MODES[0];

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Style Dropdown */}
            <div className="relative">
                <button
                    onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowModeDropdown(false); }}
                    className="flex items-center gap-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <currentStyle.icon size={12} /> {currentStyle.label} <ChevronDown size={10} />
                </button>
                {showStyleDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                        {CONVERSATION_STYLES.map(style => (
                            <button
                                key={style.id}
                                onClick={() => { onStyleChange(style.id); setShowStyleDropdown(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-700 ${conversationStyle === style.id ? 'bg-slate-700/50 text-emerald-400' : 'text-slate-300'}`}
                            >
                                <style.icon size={14} />
                                <div>
                                    <div className="text-xs font-bold">{style.label}</div>
                                    <div className="text-[10px] text-slate-500">{style.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Mode Dropdown */}
            <div className="relative">
                <button
                    onClick={() => { setShowModeDropdown(!showModeDropdown); setShowStyleDropdown(false); }}
                    className="flex items-center gap-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <currentMode.icon size={12} /> {currentMode.label} <ChevronDown size={10} />
                </button>
                {showModeDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                        {CHAT_MODES.map(mode => (
                            <button
                                key={mode.id}
                                onClick={() => { onModeChange(mode.id); setShowModeDropdown(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-700 ${selectedMode === mode.id ? 'bg-slate-700/50 text-emerald-400' : 'text-slate-300'}`}
                            >
                                <mode.icon size={14} />
                                <div>
                                    <div className="text-xs font-bold">{mode.label}</div>
                                    <div className="text-[10px] text-slate-500">{mode.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
