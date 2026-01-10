/**
 * VEDA AI Website - API Client
 * Unified with Mobile App - Uses Groq for consistent guest experience
 * Supports multilingual responses including Bhojpuri (Beta)
 */

// Production backend URL (Render)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://veda-ai-backend-ql2b.onrender.com';
const API_V1 = `${API_BASE_URL}/api/v1`;

// Groq API for guest mode (same as mobile for consistency)
// Groq API for guest mode (same as mobile for consistency)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
// Gemini API for Vision
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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

export async function analyzeFoodImage(base64Image) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PLACE_YOUR')) {
        throw new Error('Gemini API Key is missing. Please update .env file.');
    }

    const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    // Nutrition Expert Prompt
    const FOOD_ANALYSIS_PROMPT = `You are a nutrition expert specializing in Indian cuisine. Analyze this image of a meal.

Identify all food items visible and for each provide:
1. Name in English
2. Name in Hindi
3. Estimated portion size
4. Approximate calories
5. Protein in grams
6. Carbohydrates in grams
7. Fat in grams

Common Indian foods reference:
- Roti/Chapati: ~70-100 kcal each
- Rice (1 cup): ~200 kcal
- Dal (1 bowl): ~150 kcal
- Sabzi (vegetables): ~80-120 kcal
- Paneer curry: ~250-300 kcal

Respond ONLY with valid JSON in this exact format:
{
  "foods": [
    {"name": "Roti", "nameHindi": "रोटी", "portion": "2 pieces", "calories": 140, "protein": 4, "carbs": 30, "fat": 1}
  ],
  "totalCalories": 140,
  "totalProtein": 4,
  "totalCarbs": 30,
  "totalFat": 1,
  "healthTips": "Your meal is balanced. Consider adding more vegetables for fiber."
}`;

    try {
        const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: FOOD_ANALYSIS_PROMPT },
                        {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to analyze image');
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) throw new Error('No analysis generated.');

        // Extract JSON using Regex
        let jsonStr = textContent;
        const jsonMatch = textContent.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) jsonStr = jsonMatch[1];
        else {
            const objMatch = textContent.match(/\{[\s\S]*\}/);
            if (objMatch) jsonStr = objMatch[0];
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error('Vision API Error:', error);
        throw error;
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
    SUPPORTED_LANGUAGES,
    getLanguageByZone,
    getSavedLanguage,
    saveLanguage,
};
