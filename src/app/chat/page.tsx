"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Database } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
    sendGuestMessage,
    sendOrchestratedMessage,
    getSavedLanguage,
    OrchestratedResponse
} from '@/lib/api';

import LanguageSelector from '@/components/chat/LanguageSelector';
import ChatSidebar from './components/ChatSidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import ModeSelector from './components/ModeSelector';

// --- Types ---

interface Message {
    role: 'assistant' | 'user';
    content: string;
    sources?: { title?: string; url: string; favicon?: string; source_type?: string }[];
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

// --- Welcome Messages ---

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

export default function ChatPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Core State
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Thinking...');

    // Modes
    const [selectedMode, setSelectedMode] = useState('auto');
    const [conversationStyle, setConversationStyle] = useState('auto');

    // Tools
    const [showMemory, setShowMemory] = useState(false);

    // History
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);

    // Guest limits
    const guestMessageLimit = 5;
    const [guestMessageCount, setGuestMessageCount] = useState(0);

    // --- Effects ---

    useEffect(() => {
        const savedLang = getSavedLanguage();
        setSelectedLanguage(savedLang);

        if (typeof window !== 'undefined') {
            const history = localStorage.getItem('veda_chat_history');
            if (history) setChatHistory(JSON.parse(history));

            const count = localStorage.getItem('veda_guest_count');
            if (count) setGuestMessageCount(parseInt(count));
        }

        if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: WELCOME_MESSAGES[savedLang] || WELCOME_MESSAGES.en }]);
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

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

        if (window.innerWidth < 768) setSidebarOpen(false);

        // Dynamic loading text
        if (selectedMode === 'search') setLoadingText('🔎 Searching Web...');
        else if (selectedMode === 'wellness') setLoadingText('🧘 Consulting Wellness Expert...');
        else if (selectedMode === 'protection') setLoadingText('🛡️ Analyzing Policies...');
        else if (currentInput.toLowerCase().includes('news')) setLoadingText('🔎 Searching & Thinking...');
        else setLoadingText('Thinking...');

        if (user?.isGuest) setGuestMessageCount(prev => prev + 1);

        try {
            let responseContent = '';
            let sources: { title?: string; url: string; favicon?: string; source_type?: string }[] = [];
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
        if (currentChatId === chatId) startNewChat();
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-slate-900 text-white overflow-hidden font-sans">
                {/* Sidebar */}
                <ChatSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    chatHistory={chatHistory}
                    currentChatId={currentChatId}
                    onNewChat={startNewChat}
                    onLoadChat={loadChat}
                    onDeleteChat={deleteChat}
                    user={user}
                    guestMessageLimit={guestMessageLimit}
                    guestMessageCount={guestMessageCount}
                    onLogout={handleLogout}
                />

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

                    {/* Messages */}
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        user={user}
                        showMemory={showMemory}
                        messagesEndRef={messagesEndRef}
                    />

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-[#0B1120] border-t border-slate-800">
                        <div className="max-w-3xl mx-auto space-y-3">
                            <ModeSelector
                                selectedMode={selectedMode}
                                onModeChange={setSelectedMode}
                                conversationStyle={conversationStyle}
                                onStyleChange={setConversationStyle}
                            />
                            <ChatInput
                                value={inputValue}
                                onChange={setInputValue}
                                onSend={handleSendMessage}
                                isLoading={isLoading}
                                selectedLanguage={selectedLanguage}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
