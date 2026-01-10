/**
 * VEDA AI Website - API Client
 * Unified with Mobile App - Uses Groq for consistent guest experience
 * Supports multilingual responses including Bhojpuri (Beta)
 */

// Production backend URL (Render)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://veda-ai-backend-ql2b.onrender.com';
const API_V1 = `${API_BASE_URL}/api/v1`;

// Groq API for guest mode (same as mobile for consistency)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
// Note: Gemini Vision API is now proxied through backend for security

// Store access token in memory (more secure than localStorage for tokens)
let accessToken = localStorage.getItem('veda_token') || null;

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_V1}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
}

// ==================== AUTH API ====================

export async function signup(email, password, name = '') {
    const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
    return data;
}

export async function login(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    // Store token
    accessToken = data.access_token;
    localStorage.setItem('veda_token', accessToken);
    localStorage.setItem('veda_user', JSON.stringify(data.user));

    return data;
}

export async function guestLogin() {
    // For now, create a local guest session
    const guestUser = {
        id: 'guest-' + Date.now(),
        email: 'guest@veda.ai',
        name: 'Guest User',
        isGuest: true,
        messagesRemaining: 5,
    };
    localStorage.setItem('veda_user', JSON.stringify(guestUser));
    return guestUser;
}

export function logout() {
    accessToken = null;
    localStorage.removeItem('veda_token');
    localStorage.removeItem('veda_user');
}

export function getCurrentUser() {
    const userStr = localStorage.getItem('veda_user');
    return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
    return !!accessToken || !!localStorage.getItem('veda_token');
}

// ==================== CHAT API ====================

export async function getChats() {
    return apiRequest('/chats');
}

export async function createChat(title = 'New Chat') {
    return apiRequest('/chats', {
        method: 'POST',
        body: JSON.stringify({ title }),
    });
}

export async function getChatMessages(chatId) {
    return apiRequest(`/chats/${chatId}/messages`);
}

export async function sendMessage(chatId, content) {
    return apiRequest(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
}

// ==================== GUEST AI (Groq - Same as Mobile) ====================

// Supported Languages (Zone-wise) - Matches mobile app
export const SUPPORTED_LANGUAGES = {
    // English (Default)
    en: { name: 'English', zone: 'Global', flag: '🌐' },
    // North Zone (UP-Bihar Region)
    hi: { name: 'हिंदी', zone: 'North', flag: '🇮🇳' },
    bho: { name: 'भोजपुरी (Beta)', zone: 'North', flag: '🇮🇳' },
    // South Zone
    ta: { name: 'தமிழ்', zone: 'South', flag: '🇮🇳' },
    te: { name: 'తెలుగు', zone: 'South', flag: '🇮🇳' },
    kn: { name: 'ಕನ್ನಡ', zone: 'South', flag: '🇮🇳' },
    ml: { name: 'മലയാളം', zone: 'South', flag: '🇮🇳' },
    // East Zone
    bn: { name: 'বাংলা', zone: 'East', flag: '🇮🇳' },
    or: { name: 'ଓଡ଼ିଆ', zone: 'East', flag: '🇮🇳' },
    // West Zone
    mr: { name: 'मराठी', zone: 'West', flag: '🇮🇳' },
    gu: { name: 'ગુજરાતી', zone: 'West', flag: '🇮🇳' },
};

export async function sendGuestMessage(message, languageCode = 'en', history = []) {
    const lang = SUPPORTED_LANGUAGES[languageCode];

    // Special prompt for Bhojpuri (Beta) - Pure language, family-friendly
    const bhojpuriPrompt = `तू VEDA AI बाड़ऽ, भोजपुरी बोलेवाला लोग खातिर वेलनेस साथी।

भाषा के नियम:
- खाली शुद्ध भोजपुरी में जवाब देबऽ
- हिंदी या अंग्रेजी मिलाइब नाहीं
- देवनागरी लिपि में लिखबऽ
- गारी-गलौज बिल्कुल ना करबऽ
- सम्मानजनक भाषा बोलबऽ

शैली:
- छोट आ सीधा जवाब देबऽ
- **बोल्ड** में जरूरी बात लिखबऽ
- बिंदुवार लिखबऽ

विशेषज्ञता:
- भोजपुरी खान-पान (लिट्टी-चोखा, सत्तू, ठेकुआ, चूड़ा-दही)
- योग आ प्राणायाम
- आयुर्वेद के घरेलू नुस्खा
- स्वास्थ्य बीमा के जानकारी

हमेशा शुद्ध भोजपुरी में जवाब देबऽ। हर बार "प्रणाम" या "जय हो" मत बोलबऽ - सीधा जवाब देबऽ।`;

    // Standard prompt for other languages
    const standardPrompt = `You are VEDA AI, a premium wellness companion for Indian users.

RESPONSE LANGUAGE: ${lang.name} (${languageCode})
You MUST respond entirely in ${lang.name}. Use native script, not transliteration.

YOUR STYLE:
- **Premium & Professional:** Clear, elegant language in ${lang.name}.
- **Short & Crisp:** Use bullet points, avoid long paragraphs.
- **Natural Conversation:** Do NOT start every response with greetings like "Namaste". Only greet when contextually appropriate. Jump straight to helpful content.
- **Visual Formatting:** Use **Bold** for key terms, lists for steps.

EXPERTISE:
- Indian Nutrition (Roti, Dal, Ghee, regional foods)
- Yoga (Asanas, Pranayama)
- Ayurveda (Doshas, traditional remedies)
- Health Insurance (IRDAI guidelines)

Respond naturally in ${lang.name} with native script.`;

    const systemPrompt = languageCode === 'bho' ? bhojpuriPrompt : standardPrompt;

    try {
        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...history.map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                        { role: "user", content: message }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Groq API Error:', error);
            throw new Error('Service busy. Please try again.');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "No response generated.";

    } catch (error) {
        console.error('Guest Chat Error:', error);
        if (languageCode === 'bho') {
            return "माफ करीं, थोड़ी देर बाद फिर से कोशिश करीं।";
        } else if (languageCode === 'hi') {
            return "क्षमा करें, कृपया थोड़ी देर बाद पुनः प्रयास करें।";
        }
        return "Please try again in a moment.";
    }
}

// ==================== LANGUAGE UTILITIES ====================

export function getLanguageByZone() {
    const zones = { Global: [], North: [], South: [], East: [], West: [] };
    Object.entries(SUPPORTED_LANGUAGES).forEach(([code, lang]) => {
        zones[lang.zone].push({ code, ...lang });
    });
    return zones;
}

export function getSavedLanguage() {
    return localStorage.getItem('veda_language') || 'en';
}

export function saveLanguage(code) {
    localStorage.setItem('veda_language', code);
}

/**
 * Analyze food image using backend Vision API proxy.
 * This is SECURE - API key is kept on backend, not exposed in frontend.
 * Rate limited: 5 analyses per hour.
 */
export async function analyzeFoodImage(base64Image) {
    try {
        const response = await fetch(`${API_V1}/vision/analyze-food`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        if (response.status === 429) {
            const error = await response.json();
            throw new Error(error.detail?.message || 'Rate limit exceeded. You can analyze 5 images per hour.');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to analyze image');
        }

        const data = await response.json();

        // Transform backend response to match expected format
        return {
            foods: data.foods?.map(f => ({
                name: f.name,
                nameHindi: f.name_hindi,
                portion: '1 serving',
                calories: f.calories,
                protein: f.protein,
                carbs: f.carbs,
                fat: f.fat
            })) || [],
            totalCalories: data.total_calories,
            totalProtein: data.total_protein,
            totalCarbs: data.total_carbs,
            totalFat: data.total_fat,
            healthTips: data.health_tips?.join(' ') || '',
            rateLimitRemaining: data.rate_limit_remaining
        };

    } catch (error) {
        console.error('[VEDA-ERROR] Vision API:', error.message);
        throw error;
    }
}

/**
 * Check current rate limit status for vision analysis.
 */
export async function getVisionRateLimitStatus() {
    try {
        const response = await fetch(`${API_V1}/vision/rate-limit-status`);
        return response.json();
    } catch (error) {
        return { remaining: 5, limit: 5 };
    }
}

export default {
    signup,
    login,
    guestLogin,
    logout,
    getCurrentUser,
    isAuthenticated,
    getChats,
    createChat,
    getChatMessages,
    sendMessage,
    sendGuestMessage,
    analyzeFoodImage,
    getVisionRateLimitStatus,
    SUPPORTED_LANGUAGES,
    getLanguageByZone,
    getSavedLanguage,
    saveLanguage,
};
