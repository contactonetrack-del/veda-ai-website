export const SUPPORTED_LANGUAGES: Record<string, { name: string; zone: string; flag: string; beta?: boolean }> = {
    en: { name: 'English', zone: 'Global', flag: '🌐' },
    hi: { name: 'हिंदी (Hindi)', zone: 'North', flag: '🇮🇳' },
    bho: { name: 'भोजपुरी (Bhojpuri)', zone: 'North', flag: '🇮🇳', beta: true },
    pa: { name: 'ਪੰਜਾਬੀ (Punjabi)', zone: 'North', flag: '🇮🇳' },
    ur: { name: 'اردو (Urdu)', zone: 'North', flag: '🇮🇳' },
    ne: { name: 'नेपाली (Nepali)', zone: 'North', flag: '🇳🇵' },
    ks: { name: 'कॉशुर (Kashmiri)', zone: 'North', flag: '🇮🇳' },
    sd: { name: 'سنڌي (Sindhi)', zone: 'North', flag: '🇮🇳' },
    doi: { name: 'डोगरी (Dogri)', zone: 'North', flag: '🇮🇳' },
    mai: { name: 'मैथिली (Maithili)', zone: 'North', flag: '🇮🇳' },
    sat: { name: 'संताली (Santali)', zone: 'North', flag: '🇮🇳' },
    ta: { name: 'தமிழ் (Tamil)', zone: 'South', flag: '🇮🇳' },
    te: { name: 'తెలుగు (Telugu)', zone: 'South', flag: '🇮🇳' },
    kn: { name: 'ಕನ್ನಡ (Kannada)', zone: 'South', flag: '🇮🇳' },
    ml: { name: 'മലയാളം (Malayalam)', zone: 'South', flag: '🇮🇳' },
    bn: { name: 'বাংলা (Bengali)', zone: 'East', flag: '🇮🇳' },
    or: { name: 'ଓଡ଼ିଆ (Odia)', zone: 'East', flag: '🇮🇳' },
    as: { name: 'অসমীয়া (Assamese)', zone: 'East', flag: '🇮🇳' },
    mni: { name: 'মৈতৈলোন (Manipuri)', zone: 'East', flag: '🇮🇳' },
    brx: { name: 'बड़ो (Bodo)', zone: 'East', flag: '🇮🇳' },
    mr: { name: 'मराठी (Marathi)', zone: 'West', flag: '🇮🇳' },
    gu: { name: 'ગુજરાતી (Gujarati)', zone: 'West', flag: '🇮🇳' },
    kok: { name: 'कोंकणी (Konkani)', zone: 'West', flag: '🇮🇳' },
    gon: { name: 'गोंडी (Gondi)', zone: 'Tribal', flag: '🇮🇳' },
    hne: { name: 'छत्तीसगढ़ी (Chhattisgarhi)', zone: 'Tribal', flag: '🇮🇳' },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE_URL}/api/v1`;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('veda_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_V1}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
            const error = await response.json();
            errorMessage = error.detail || errorMessage;
        } catch {
            // ignore json parse error
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

export interface OrchestratedResponse {
    response: string;
    intent: string;
    agentUsed: string | null;
    sources: Source[];
    reviewed?: boolean;
    contextUsed?: Record<string, unknown>;
    timestamp?: string;
    success: boolean;
    error?: string;
    verified?: boolean;
    confidence?: number;
}

export interface Source {
    url: string;
    title?: string;
    favicon?: string;
}

export interface Memory {
    id: string;
    text: string;
    created_at: string;
    metadata?: {
        role?: string;
    };
}

export async function sendOrchestratedMessage(
    message: string,
    userId: string = 'guest',
    mode: string = 'auto',
    style: string = 'auto',
    languageCode: string = 'en'
): Promise<OrchestratedResponse> {
    try {
        let contextMessage = message;
        if (languageCode && languageCode !== 'en') {
            const lang = SUPPORTED_LANGUAGES[languageCode];
            const langName = lang ? lang.name : languageCode;
            contextMessage = `[Response Language: ${langName}] ${message}`;
        }

        const data = await apiRequest('/orchestrator/query', {
            method: 'POST',
            body: JSON.stringify({
                message: contextMessage,
                user_id: userId,
                context: {},
                mode: mode,
                style: style
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
            success: true,
            verified: data.verified,
            confidence: data.confidence
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Orchestrator] Error:', error);
        return {
            response: "I'm having trouble processing your request. Please try again.",
            intent: 'error',
            agentUsed: null,
            sources: [],
            success: false,
            error: errorMessage
        };
    }
}

export async function sendGuestMessage(message: string, languageCode: string = 'en', history: Message[] = []): Promise<string> {
    try {
        let contextMessage = message;
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
        if (languageCode === 'bho') return "माफ करीं, थोड़ी देर बाद फिर से कोशिश करीं।";
        if (languageCode === 'hi') return "क्षमा करें, कृपया थोड़ी देर बाद पुनः प्रयास करें।";
        return "Please try again in a moment.";
    }
}

export interface Message {
    role: 'assistant' | 'user';
    content: string;
    sources?: Source[];
    agentUsed?: string | null;
    intent?: string;
    verified?: boolean;
    confidence?: number;
}

export function getSavedLanguage(): string {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem('veda_language') || 'en';
}

export function saveLanguage(code: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('veda_language', code);
}

// Memory Bank API Functions
export async function getMemories(userId: string): Promise<Memory[]> {
    try {
        return await apiRequest(`/memory/${userId}`);
    } catch (error) {
        console.error('Failed to fetch memories:', error);
        return [];
    }
}

export async function deleteMemory(userId: string, memoryId: string): Promise<void> {
    await apiRequest(`/memory/${userId}/${memoryId}`, { method: 'DELETE' });
}

export async function clearMemory(userId: string): Promise<void> {
    await apiRequest(`/memory/${userId}`, { method: 'DELETE' });
}
