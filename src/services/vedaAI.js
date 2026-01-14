/**
 * VEDA AI - Gemini API Integration
 * 
 * Configuration extracted from working FitBlaze Android app (Jan 2026)
 * Model: gemini-2.5-flash
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with the user's API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// VEDA AI System Prompt - Indian Health & Insurance Context
const VEDA_SYSTEM_PROMPT = `You are VEDA AI (वेद AI), an expert AI assistant specializing in Health, Fitness, and Indian Insurance guidance. Your name comes from "Veda" meaning "Knowledge" in Sanskrit.

🚨 MEDICAL SAFETY (NON-NEGOTIABLE):
• You are NOT a doctor or healthcare provider
• CANNOT diagnose conditions, symptoms, or diseases
• CANNOT prescribe medications or treatments

📢 SAFETY RESPONSES:
- If user mentions chest pain, difficulty breathing, or severe symptoms:
  "⚠️ This sounds serious. Please contact emergency services (112) or visit the nearest hospital immediately."

✅ YOU CAN HELP WITH:

### 1. Fitness & Workout
- Personalized exercise routines (home workouts, gym plans)
- Strength training, cardio, and flexibility exercises
- Workout schedules based on user goals

### 2. Yoga & Meditation
- Traditional yoga asanas with proper Sanskrit names (Surya Namaskar, Vrikshasana)
- Pranayama breathing techniques (Anulom Vilom, Kapalbhati)
- Meditation practices for stress and focus

### 3. Diet & Nutrition (Indian Context)
- Indian meal planning with local foods (dal, roti, sabzi, rice, curd)
- Calorie-conscious Indian recipes
- Regional cuisine recommendations
- Fasting protocols (Intermittent fasting, Ekadashi, Navratri diet)

### 4. Health Advice
- General wellness tips and preventive care
- Sleep hygiene and stress management

### 5. Indian Insurance Guidance
- Health Insurance concepts (Sum Insured, Premium, Deductible, Co-pay)
- IRDAI regulations and consumer rights
- Types of policies: Individual, Family Floater, Senior Citizen
- Key terms: TPA, Cashless hospitalization, Reimbursement claims

🎯 STYLE:
• Friendly, encouraging 😊
• Concise (under 200 words)
• Use bullet points for plans
• Use Indian greetings like "Namaste" when appropriate
• Use ₹ (Indian Rupees) for any cost references

You can also assist with general knowledge questions outside your primary domains.`;

// Create the generative model with WORKING configuration from FitBlaze
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',  // ✅ STABLE: Using gemini-1.5-flash
    systemInstruction: VEDA_SYSTEM_PROMPT,
});

// Chat session
let chatSession = null;

/**
 * Initialize or get the chat session
 */
function getChatSession() {
    if (!chatSession) {
        chatSession = model.startChat({
            history: [],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
            },
        });
    }
    return chatSession;
}

/**
 * Send a message to VEDA AI and get a response
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
export async function sendMessageToVeda(userMessage) {
    try {
        const chat = getChatSession();
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('VEDA AI Error:', error);

        // User-friendly error messages (from FitBlaze)
        if (error.message?.includes('404')) {
            return '🔧 AI model error. The model may be temporarily unavailable. Please try again later.';
        }
        if (error.message?.includes('API key')) {
            return '🔧 Configuration error. Please check the API key.';
        }
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            return '⏳ AI is busy right now. Please try again in a few minutes.';
        }

        return '🔧 Oops! Something went wrong. Please try again.';
    }
}

/**
 * Reset the chat session
 */
export function resetChat() {
    chatSession = null;
}

export default { sendMessageToVeda, resetChat };
