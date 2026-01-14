"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Menu, X, Plus, MessageSquare, User, LogOut, Send, Bot,
    Trash2, Sparkles, Database, ChevronDown, Zap, Lightbulb,
    GraduationCap, Globe, BarChart2, Heart, Search, Shield
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
    sendGuestMessage,
    sendOrchestratedMessage,
    getSavedLanguage,
    SUPPORTED_LANGUAGES,
    OrchestratedResponse
} from '@/lib/api';

import LanguageSelector from '@/components/chat/LanguageSelector';
import { SourcesCitation, AgentBadge } from '@/components/SourcesCitation';
import VoiceButton from '@/components/chat/VoiceButton';
import MemoryBank from '@/components/chat/MemoryBank';

// --- Constants ---

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

const WELCOME_MESSAGES: Record<string, string> = {
    en: 'Hello! I am VEDA AI, your guide for Health, Fitness, Yoga, Diet, and Insurance. How can I help you today?',
    hi: 'नमस्ते! मैं VEDA AI हूँ, आपका स्वास्थ्य, फिटनेस, योग, आहार और बीमा गाइड। आज मैं आपकी कैसे मदद कर सकता हूँ?',
    bho: 'प्रणाम! हम VEDA AI बानी, राउर स्वास्थ्य आ तंदुरुस्ती के साथी। का मदद करीं?',
    ta: 'வணக்கம்! நான் VEDA AI, உங்கள் ஆரோக்கிய வழிகாட்டி. எப்படி உதவ வேண்டும்?',
    te: 'నమస్కారం! నేను VEDA AI, మీ ఆరోగ్య మార్గదర్శి. ఎలా సహాయం చేయాలి?',
    kn: 'ನಮಸ್ಕಾರ! ನಾನು VEDA AI, ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶಿ. ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    ml: 'നമസ്കാരം! ഞാൻ VEDA AI, നിങ്ങളുടെ ആരോഗ്യ വഴികാട്ടി. എങ്ങനെ സഹായിക്കാം?',
    bn: 'নমস্কার! আমি VEDA AI, আপনার স্বাস্থ্য গাইড। কিভাবে সাহায্য করতে পারি?',
    or: 'ନମସ୍କାର! ମୁଁ VEDA AI, ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ଗାଇଡ୍। କିପରି ସାହାଯ୍ୟ କରିବି?',
    mr: 'नमस्कार! मी VEDA AI, तुमचा आरोग्य मार्गदर्शक. कशी मदत करू?',
    gu: 'નમસ્તે! હું VEDA AI, તમારો આરોગ્ય માર્ગદર્શક. કેવી રીતે મદદ કરું?',
};

interface Message {
    role: 'assistant' | 'user';
    content: string;
    sources?: any[];
    agentUsed?: string | null;
    intent?: string;
    verified?: boolean;
    confidence?: number;
}

interface ChatSession {
    id: number;
    title: string;
    messages: Message[];
    timestamp: string;
}

export default function ChatPage() {
    const router = useRouter();
    const { user, logout, loading: authLoading } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // State
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Thinking...');

    // Modes
    const [selectedMode, setSelectedMode] = useState('auto');
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [conversationStyle, setConversationStyle] = useState('auto');
    const [showStyleDropdown, setShowStyleDropdown] = useState(false);

    // Tools
    const [showMemory, setShowMemory] = useState(false);

    // History
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);

    // Guest limits
    const guestMessageLimit = 5;
    const [guestMessageCount, setGuestMessageCount] = useState(0);

    // --- Effects ---

    // Initialize
    useEffect(() => {
        // Load saved settings
        const savedLang = getSavedLanguage();
        setSelectedLanguage(savedLang);

        // Load history/guest count
        if (typeof window !== 'undefined') {
            const history = localStorage.getItem('veda_chat_history');
            if (history) setChatHistory(JSON.parse(history));

            const count = localStorage.getItem('veda_guest_count');
            if (count) setGuestMessageCount(parseInt(count));
        }

        // Set initial welcome message
        if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: WELCOME_MESSAGES[savedLang] || WELCOME_MESSAGES.en }]);
        }
    }, [user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Save History & Guest Count
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('veda_chat_history', JSON.stringify(chatHistory));
            localStorage.setItem('veda_guest_count', guestMessageCount.toString());
        }
    }, [chatHistory, guestMessageCount]);


    // --- Handlers ---

    const handleLanguageChange = (newLang: string) => {
        setSelectedLanguage(newLang);
        if (messages.length === 1 && messages[0].role === 'assistant') {
            setMessages([{ role: 'assistant', content: WELCOME_MESSAGES[newLang] || WELCOME_MESSAGES.en }]);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        // Guest Check
        if (user?.isGuest && guestMessageCount >= guestMessageLimit) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ You have reached the guest message limit. Please sign up for unlimited access!'
            }]);
            return;
        }

        const currentInput = inputValue;
        const userMessage: Message = { role: 'user', content: currentInput };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Mobile/Small screen: close sidebar on send
        if (window.innerWidth < 768) setSidebarOpen(false);

        // Loading Text Logic
        if (selectedMode === 'search') setLoadingText('🔎 Searching Web...');
        else if (selectedMode === 'wellness') setLoadingText('🧘 Consulting Wellness Expert...');
        else if (selectedMode === 'protection') setLoadingText('🛡️ Analyzing Policies...');
        else if (currentInput.toLowerCase().includes('news')) setLoadingText('🔎 Searching & Thinking...');
        else setLoadingText('Thinking...');

        if (user?.isGuest) {
            setGuestMessageCount(prev => prev + 1);
        }

        try {
            let responseContent = '';
            let sources: any[] = [];
            let agentUsed = null;
            let intent = undefined;
            let verified = false;
            let confidence = 0.0;

            if (user?.isGuest) {
                responseContent = await sendGuestMessage(currentInput, selectedLanguage, messages);
            } else {
                const result: OrchestratedResponse = await sendOrchestratedMessage(
                    currentInput,
                    user?.uid || 'guest',
                    selectedMode,
                    conversationStyle,
                    selectedLanguage
                );
                responseContent = result.response;
                sources = result.sources || [];
                agentUsed = result.agentUsed;
                intent = result.intent;
                verified = result.verified || false;
                confidence = result.confidence || 0.0;
            }

            const aiMessage: Message = {
                role: 'assistant',
                content: responseContent,
                sources,
                agentUsed,
                intent,
                verified,
                confidence
            };

            setMessages(prev => [...prev, aiMessage]);

            if (currentChatId) {
                updateChatInHistory(currentChatId, [...messages, userMessage, aiMessage]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I encountered an issue. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        if (messages.length > 1 && !currentChatId) {
            const newChat: ChatSession = {
                id: Date.now(),
                title: messages[1]?.content?.slice(0, 30) + '...' || 'New Chat',
                messages: messages,
                timestamp: new Date().toISOString()
            };
            setChatHistory(prev => [newChat, ...prev]);
        }
        setMessages([{ role: 'assistant', content: WELCOME_MESSAGES[selectedLanguage] || WELCOME_MESSAGES.en }]);
        setCurrentChatId(null);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const loadChat = (chat: ChatSession) => {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const updateChatInHistory = (chatId: number, newMessages: Message[]) => {
        setChatHistory(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, messages: newMessages } : chat
        ));
    };

    const deleteChat = (chatId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
            startNewChat();
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-slate-900 text-white overflow-hidden font-sans">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } md:relative md:translate-x-0 md:w-72 md:flex flex-col ${!sidebarOpen && 'md:hidden'}`}
                >
                    <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">V</div>
                        <span className="font-bold text-lg tracking-tight">VEDA AI</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden ml-auto text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4">
                        <button
                            onClick={startNewChat}
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
                                    onClick={() => loadChat(chat)}
                                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentChatId === chat.id
                                        ? 'bg-slate-800 text-emerald-400 border border-emerald-900/30'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                        }`}
                                >
                                    <MessageSquare size={16} />
                                    <span className="text-sm truncate flex-1">{chat.title}</span>
                                    <button
                                        onClick={(e) => deleteChat(chat.id, e)}
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
                            onClick={handleLogout}
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

                {/* Main Chat Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#0B1120]">
                    {/* Header */}
                    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-[#0B1120]/80 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="md:hidden text-slate-400 hover:text-white"
                            >
                                <Menu size={24} />
                            </button>
                            <h1 className="text-lg font-semibold text-white hidden sm:block">VEDA Assistant</h1>
                            <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900 hidden sm:block">Online</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <LanguageSelector selectedLanguage={selectedLanguage} onLanguageChange={handleLanguageChange} />
                            <button
                                onClick={() => setShowMemory(!showMemory)}
                                className={`p-2 rounded-full transition-all ${showMemory ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                title="Memory Bank"
                            >
                                <Database size={20} />
                            </button>
                        </div>
                    </header>

                    {/* Messages Area */}
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

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-[#0B1120] border-t border-slate-800">
                        <div className="max-w-3xl mx-auto space-y-3">
                            {/* Status Bar */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {/* Style Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowModeDropdown(false); }}
                                        className="flex items-center gap-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        {(() => {
                                            const current = CONVERSATION_STYLES.find(s => s.id === conversationStyle) || CONVERSATION_STYLES[0];
                                            const Icon = current.icon;
                                            return <><Icon size={12} /> {current.label} <ChevronDown size={10} /></>;
                                        })()}
                                    </button>
                                    {showStyleDropdown && (
                                        <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                            {CONVERSATION_STYLES.map(style => (
                                                <button
                                                    key={style.id}
                                                    onClick={() => { setConversationStyle(style.id); setShowStyleDropdown(false); }}
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
                                        {(() => {
                                            const current = CHAT_MODES.find(m => m.id === selectedMode) || CHAT_MODES[0];
                                            const Icon = current.icon;
                                            return <><Icon size={12} /> {current.label} <ChevronDown size={10} /></>;
                                        })()}
                                    </button>
                                    {showModeDropdown && (
                                        <div className="absolute bottom-full mb-2 left-0 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                            {CHAT_MODES.map(mode => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => { setSelectedMode(mode.id); setShowModeDropdown(false); }}
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

                            {/* Input Box */}
                            <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl focus-within:bg-slate-800 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all shadow-sm">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={selectedLanguage === 'hi' ? 'VEDA AI से कुछ पूछें...' : 'Ask about health, fitness, yoga...'}
                                    className="w-full bg-transparent text-white px-4 py-4 pr-24 focus:outline-none placeholder:text-slate-500 placeholder:text-sm"
                                    disabled={isLoading}
                                />

                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <VoiceButton
                                        onTranscript={(text) => setInputValue(text)}
                                        // Direct response handling from voice loop could be added here
                                        language={selectedLanguage}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/20"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-slate-600">
                                {SUPPORTED_LANGUAGES[selectedLanguage]?.flag} {SUPPORTED_LANGUAGES[selectedLanguage]?.name} • VEDA AI can make mistakes. Verify important information.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
