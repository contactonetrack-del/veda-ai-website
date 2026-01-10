import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getCurrentUser, logout, sendGuestMessage, getSavedLanguage, SUPPORTED_LANGUAGES } from '../services/api'
import { logError, logEvent } from '../utils/errorLogger'
import LanguageSelector from '../components/LanguageSelector'
import {
    Menu,
    X,
    Plus,
    MessageSquare,
    Settings,
    User,
    LogOut,
    Send,
    Bot,
    Trash2,
    Sparkles,
    Clock
} from 'lucide-react'
import './ChatPage.css'

// Welcome messages in different languages (matching mobile app)
const WELCOME_MESSAGES = {
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

function ChatPage() {
    const navigate = useNavigate()
    const messagesEndRef = useRef(null)

    // User & Auth State
    const [user, setUser] = useState(() => getCurrentUser())

    // Language State - defaults to saved preference
    const [selectedLanguage, setSelectedLanguage] = useState(() => getSavedLanguage())

    // Chat State
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: WELCOME_MESSAGES[getSavedLanguage()] || WELCOME_MESSAGES.en }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Chat History (localStorage for now, backend later for authenticated users)
    const [chatHistory, setChatHistory] = useState(() => {
        const saved = localStorage.getItem('veda_chat_history')
        return saved ? JSON.parse(saved) : []
    })
    const [currentChatId, setCurrentChatId] = useState(null)

    // Guest limits
    const guestMessageLimit = 5
    const [guestMessageCount, setGuestMessageCount] = useState(() => {
        return parseInt(localStorage.getItem('veda_guest_count') || '0')
    })

    // Update welcome message when language changes
    const handleLanguageChange = (newLang) => {
        setSelectedLanguage(newLang)
        // Update the initial welcome message if no user messages yet
        if (messages.length === 1 && messages[0].role === 'assistant') {
            setMessages([
                { role: 'assistant', content: WELCOME_MESSAGES[newLang] || WELCOME_MESSAGES.en }
            ])
        }
    }

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Save chat history
    useEffect(() => {
        localStorage.setItem('veda_chat_history', JSON.stringify(chatHistory))
    }, [chatHistory])

    // Check if user is logged in, if not redirect to home
    useEffect(() => {
        if (!user) {
            navigate('/')
        }
    }, [user, navigate])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        // Guest limit check
        if (user?.isGuest && guestMessageCount >= guestMessageLimit) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ You have reached the guest message limit. Please sign up for unlimited access!'
            }])
            return
        }

        const userMessage = { role: 'user', content: inputValue }
        setMessages(prev => [...prev, userMessage])
        const currentInput = inputValue
        setInputValue('')
        setIsLoading(true)

        // Track guest messages
        if (user?.isGuest) {
            const newCount = guestMessageCount + 1
            setGuestMessageCount(newCount)
            localStorage.setItem('veda_guest_count', newCount.toString())
        }

        try {
            // Use Groq API for guests with selected language (now unified with mobile!)
            let aiResponse
            if (user?.isGuest) {
                // Guest: Direct Groq call with language support
                aiResponse = await sendGuestMessage(currentInput, selectedLanguage, messages)
            } else {
                // Authenticated: Use backend API (falls back to Groq for now)
                aiResponse = await sendGuestMessage(currentInput, selectedLanguage, messages)
            }

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

            // Save to history
            if (currentChatId) {
                updateChatInHistory(currentChatId, [...messages, userMessage, { role: 'assistant', content: aiResponse }])
            }
        }
        } catch (error) {
        logError('chat', error, { language: selectedLanguage, isGuest: user?.isGuest });
        console.error('Error:', error)
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'I apologize, but I encountered an issue. Please try again.'
        }])
    } finally {
        setIsLoading(false)
    }
}

const startNewChat = () => {
    // Save current chat if it has messages
    if (messages.length > 1 && !currentChatId) {
        const newChat = {
            id: Date.now(),
            title: messages[1]?.content?.slice(0, 30) + '...' || 'New Chat',
            messages: messages,
            timestamp: new Date().toISOString()
        }
        setChatHistory(prev => [newChat, ...prev])
    }

    setMessages([
        { role: 'assistant', content: WELCOME_MESSAGES[selectedLanguage] || WELCOME_MESSAGES.en }
    ])
    setCurrentChatId(null)
}

const loadChat = (chat) => {
    setMessages(chat.messages)
    setCurrentChatId(chat.id)
}

const updateChatInHistory = (chatId, newMessages) => {
    setChatHistory(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, messages: newMessages } : chat
    ))
}

const deleteChat = (chatId, e) => {
    e.stopPropagation()
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChatId === chatId) {
        startNewChat()
    }
}

const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/')
}

if (!user) return null

return (
    <div className="chat-page">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <img src="/logo.png" alt="VEDA AI" className="sidebar-logo" />
                {sidebarOpen && <span className="sidebar-title">VEDA AI</span>}
            </div>

            <button className="new-chat-btn" onClick={startNewChat}>
                <Plus size={20} />
                {sidebarOpen && <span>New Chat</span>}
            </button>

            {sidebarOpen && (
                <div className="chat-history">
                    <div className="history-header">
                        <Clock size={16} />
                        <span>Recent Chats</span>
                    </div>
                    {chatHistory.length === 0 ? (
                        <p className="no-history">No chat history yet</p>
                    ) : (
                        chatHistory.slice(0, 10).map(chat => (
                            <div
                                key={chat.id}
                                className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                                onClick={() => loadChat(chat)}
                            >
                                <MessageSquare size={16} />
                                <span className="history-title">{chat.title}</span>
                                <button className="delete-btn" onClick={(e) => deleteChat(chat.id, e)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="sidebar-footer">
                {sidebarOpen && (
                    <>
                        <div className="user-info">
                            <User size={18} />
                            <span>{user.isGuest ? 'Guest User' : user.name || user.email}</span>
                        </div>
                        {user.isGuest && (
                            <div className="guest-limit">
                                <Sparkles size={14} />
                                <span>{guestMessageLimit - guestMessageCount} messages left</span>
                            </div>
                        )}
                    </>
                )}
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    {sidebarOpen && <span>Logout</span>}
                </button>
            </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
            <header className="chat-topbar">
                <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1>VEDA AI Assistant</h1>
                <div className="topbar-actions">
                    <LanguageSelector
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={handleLanguageChange}
                    />
                    <button className="icon-btn" onClick={() => navigate('/profile')}>
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <div className="messages-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'assistant' ? <Bot size={24} /> : <User size={24} />}
                        </div>
                        <div className="message-content">
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message assistant">
                        <div className="message-avatar"><Bot size={24} /></div>
                        <div className="message-content loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <div className="chat-input-wrapper">
                    <input
                        type="text"
                        placeholder={selectedLanguage === 'hi' ? 'VEDA AI से कुछ पूछें...' :
                            selectedLanguage === 'bho' ? 'VEDA AI से पुछीं...' :
                                'Ask VEDA AI about health, fitness, yoga, insurance...'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                        <Send size={20} />
                    </button>
                </div>
                <p className="input-hint">
                    {SUPPORTED_LANGUAGES[selectedLanguage]?.flag} {SUPPORTED_LANGUAGES[selectedLanguage]?.name} • VEDA AI can make mistakes. Verify important information.
                </p>
            </div>
        </main>
    </div>
)
}

export default ChatPage
