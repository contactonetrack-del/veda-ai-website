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

// ==================== ORCHESTRATOR API (Phase 1: Perplexity-class) ====================

/**
 * Send message through the multi-agent orchestrator.
 * Uses backend AI with web search capabilities.
 * 
 * @param {string} message - User's query
 * @param {string} userId - User ID (optional, defaults to 'guest')
 * @param {string} mode - Agent mode: 'auto', 'research', 'analyze', 'study', etc.
 * @param {string} style - Conversation style: 'auto', 'fast', 'planning'
 * @returns {Object} Response with citations and metadata
 */
export async function sendOrchestratedMessage(message, userId = 'guest', mode = 'auto', style = 'auto') {
    try {
        const data = await apiRequest('/orchestrator/query', {
            method: 'POST',
            body: JSON.stringify({
                message,
                user_id: userId,
                context: {},
                mode: mode,
                style: style  // Conversation style
            }),
        });

        return {
            response: data.response,
            intent: data.intent,
            agentUsed: data.agent_used,
            sources: data.sources || [],
            reviewed: data.reviewed,
            contextUsed: data.context_used,
            timestamp: data.timestamp,
            success: true
        };
    } catch (error) {
        console.error('[Orchestrator] Error:', error);
        return {
            response: "I'm having trouble processing your request. Please try again.",
            intent: 'error',
            agentUsed: null,
            sources: [],
            success: false,
            error: error.message
        };
    }
}

/**
 * Get orchestrator status and available agents.
 */
export async function getOrchestratorStatus() {
    try {
        return await apiRequest('/orchestrator/status');
    } catch (error) {
        console.error('[Orchestrator] Status check failed:', error);
        return { status: 'unavailable', error: error.message };
    }
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
    try {
        // Use the backend orchestrator for guest chats too!
        // This ensures they get the same intelligence and we hide API keys.

        let contextMessage = message;
        // If language is not English, prepend context about the language
        if (languageCode !== 'en') {
            const lang = SUPPORTED_LANGUAGES[languageCode];
            contextMessage = `[Response Language: ${lang.name}] ${message}`;
        }

        const result = await sendOrchestratedMessage(contextMessage, "guest");

        if (result.success) {
            return result.response;
        } else {
            throw new Error(result.error || "Failed to get response");
        }

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

// ==================== LOCAL AI API (Zero-Cost Local Models) ====================

/**
 * Query local LLM directly (zero-cost, runs on Ollama)
 * @param {string} prompt - User query
 * @param {string} modelType - 'reasoning', 'fast', 'coding', 'vision'
 * @param {Object} options - Optional: temperature, maxTokens, reasoningMode
 */
export async function queryLocalLLM(prompt, modelType = 'reasoning', options = {}) {
    return apiRequest('/local-llm/query', {
        method: 'POST',
        body: JSON.stringify({
            prompt,
            model_type: modelType,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            system_prompt: options.systemPrompt || null,
            reasoning_mode: options.reasoningMode || false
        }),
    });
}

/**
 * Get local LLM status (check if Ollama is running)
 */
export async function getLocalLLMStatus() {
    return apiRequest('/local-llm/status');
}

/**
 * Compare responses from multiple local models
 */
export async function compareLocalModels(prompt) {
    return apiRequest('/local-llm/compare', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
    });
}

// ==================== ADVANCED REASONING API ====================

/**
 * Use advanced reasoning for complex problems
 * @param {string} query - User's question
 * @param {string} method - 'auto', 'chain_of_thought', 'tree_of_thought', 'self_consistency', 'decomposed'
 */
export async function advancedReasoning(query, method = 'auto', context = null) {
    return apiRequest('/reasoning/query', {
        method: 'POST',
        body: JSON.stringify({
            query,
            method,
            context,
            num_attempts: 3,
            num_paths: 3
        }),
    });
}

/**
 * Get available reasoning methods
 */
export async function getReasoningMethods() {
    return apiRequest('/reasoning/methods');
}

// ==================== KNOWLEDGE BASE & RAG API ====================

/**
 * Query knowledge base with RAG (Retrieval-Augmented Generation)
 * Returns LLM response enhanced with knowledge base context
 */
export async function queryKnowledge(query, options = {}) {
    return apiRequest('/knowledge/query', {
        method: 'POST',
        body: JSON.stringify({
            query,
            collection: options.collection || null,
            num_contexts: options.numContexts || 3,
            model_type: options.modelType || 'reasoning',
            include_sources: options.includeSources !== false
        }),
    });
}

/**
 * Search knowledge base (without LLM generation)
 */
export async function searchKnowledge(query, limit = 5) {
    return apiRequest('/knowledge/search', {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
    });
}

/**
 * Add knowledge to the database
 */
export async function addKnowledge(content, source = 'user', title = '', category = 'general') {
    return apiRequest('/knowledge/add', {
        method: 'POST',
        body: JSON.stringify({ content, source, title, category }),
    });
}

/**
 * Get knowledge base status
 */
export async function getKnowledgeStatus() {
    return apiRequest('/knowledge/status');
}

// ==================== DOMAIN EXPERTS API ====================

/**
 * Query a specific domain expert
 * @param {string} query - User's question
 * @param {string} expert - Expert type or null for auto-detect
 * @param {Object} options - useReasoning, reasoningMethod, context
 */
export async function queryExpert(query, expert = null, options = {}) {
    return apiRequest('/experts/query', {
        method: 'POST',
        body: JSON.stringify({
            query,
            expert,
            use_reasoning: options.useReasoning || false,
            reasoning_method: options.reasoningMethod || 'auto',
            context: options.context || null
        }),
    });
}

/**
 * List all available domain experts
 */
export async function listExperts() {
    return apiRequest('/experts/list');
}

/**
 * Detect intent/domain from a query
 */
export async function detectIntent(query) {
    return apiRequest('/experts/detect-intent', {
        method: 'POST',
        body: JSON.stringify({ query }),
    });
}

// ==================== BROWSER AGENT API ====================

/**
 * Search the web using browser agent (like Perplexity)
 */
export async function webSearch(query, numResults = 3) {
    return apiRequest('/browser/search', {
        method: 'POST',
        body: JSON.stringify({ query, num_results: numResults }),
    });
}

/**
 * Get browser agent status
 */
export async function getBrowserStatus() {
    return apiRequest('/browser/status');
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
    sendOrchestratedMessage,
    getOrchestratorStatus,
    sendGuestMessage,
    analyzeFoodImage,
    getVisionRateLimitStatus,
    SUPPORTED_LANGUAGES,
    getLanguageByZone,
    getSavedLanguage,
    saveLanguage,
    // Local AI (Zero-cost)
    queryLocalLLM,
    getLocalLLMStatus,
    compareLocalModels,
    // Advanced Reasoning
    advancedReasoning,
    getReasoningMethods,
    // Knowledge Base
    queryKnowledge,
    searchKnowledge,
    addKnowledge,
    getKnowledgeStatus,
    // Domain Experts
    queryExpert,
    listExperts,
    detectIntent,
    // Browser Agent
    webSearch,
    getBrowserStatus,
};
