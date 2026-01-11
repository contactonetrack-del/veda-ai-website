/**
 * Voice Input Component for Web
 * Uses Web Speech API for voice recognition
 */

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function VoiceInput({ onTranscript, language = 'en-IN', disabled = false }) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false;
            recog.interimResults = true;
            recog.lang = language;

            recog.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                if (event.results[0].isFinal) {
                    onTranscript(transcript);
                    setIsListening(false);
                }
            };

            recog.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recog.onend = () => {
                setIsListening(false);
            };

            setRecognition(recog);
            setIsSupported(true);
        }
    }, [language, onTranscript]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.lang = language;
            recognition.start();
            setIsListening(true);
        }
    };

    if (!isSupported) {
        return null; // Don't show button if not supported
    }

    return (
        <button
            onClick={toggleListening}
            disabled={disabled}
            className={`voice-input-btn ${isListening ? 'recording' : ''}`}
            title={isListening ? 'Stop recording' : 'Start voice input'}
        >
            {isListening ? (
                <MicOff size={20} className="mic-icon recording" />
            ) : (
                <Mic size={20} className="mic-icon" />
            )}
        </button>
    );
}

// Text-to-Speech component
export function TextToSpeech({ text, language = 'en-IN' }) {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speak = () => {
        if ('speechSynthesis' in window) {
            // Stop any current speech
            window.speechSynthesis.cancel();

            if (isSpeaking) {
                setIsSpeaking(false);
                return;
            }

            // Clean text (remove markdown)
            const cleanText = text.replace(/[*#_`]/g, '');

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = language;
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    return (
        <button onClick={speak} className="tts-btn" title={isSpeaking ? 'Stop' : 'Read aloud'}>
            {isSpeaking ? (
                <VolumeX size={16} className="tts-icon speaking" />
            ) : (
                <Volume2 size={16} className="tts-icon" />
            )}
        </button>
    );
}

// Language code mapping for Web Speech API
export const SPEECH_LANG_CODES = {
    en: 'en-IN',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    or: 'or-IN',
    bho: 'hi-IN', // Bhojpuri fallback to Hindi
};

export default VoiceInput;
