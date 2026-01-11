import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertTriangle, Loader2 } from 'lucide-react';
import './VoiceButton.css';

/**
 * VoiceButton - Voice input using Web Speech API (Browser native)
 * Falls back gracefully when WebSocket voice server is unavailable
 */
const LANG_TAGS = {
    en: 'en-IN',
    hi: 'hi-IN',
    bho: 'hi-IN', // Fallback to Hindi for STT
    pa: 'pa-IN',
    ur: 'ur-IN',
    ne: 'ne-NP',
    ks: 'ks-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    bn: 'bn-IN',
    or: 'or-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    as: 'as-IN',
    brx: 'brx-IN',
    doi: 'doi-IN',
    kok: 'kok-IN',
    mai: 'mai-IN',
    mni: 'mni-IN',
    sat: 'sat-IN',
    sd: 'sd-IN',
    gon: 'hi-IN', // Fallback
    hne: 'hi-IN', // Fallback
};

function VoiceButton({ onTranscript, onResponse, position = 'inline', language = 'en' }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');

    // Check browser support for Web Speech API
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = LANG_TAGS[language] || 'en-IN';

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                transcriptRef.current = transcript;

                // Update input field with interim results
                if (event.results[0].isFinal) {
                    onTranscript?.(transcript, language);
                    setIsRecording(false);
                    // Haptic feedback if available (Web Vibration API)
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            };
            // ... (rest same, just closing)
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setError('Microphone access denied');
                } else {
                    setError('Voice error');
                }
                setIsRecording(false);
                setTimeout(() => setError(null), 3000);
            };

            recognition.onend = () => {
                setIsRecording(false);
                if (transcriptRef.current) {
                    onTranscript?.(transcriptRef.current, language);
                }
            };

            recognitionRef.current = recognition;
        }
    }, [onTranscript, language]);

    const toggleRecording = useCallback(() => {
        if (!isSupported) {
            setError('Voice not supported');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            transcriptRef.current = '';
            try {
                recognitionRef.current?.start();
                setIsRecording(true);
                setError(null);
            } catch (err) {
                console.error('Failed to start recording:', err);
                setError('Mic busy');
                setTimeout(() => setError(null), 2000);
            }
        }
    }, [isRecording, isSupported]);

    const getButtonClass = () => {
        let cls = `voice-btn ${position}`;
        if (isRecording) cls += ' recording';
        if (error) cls += ' error';
        if (!isSupported) cls += ' unsupported';
        return cls;
    };

    const getStatusText = () => {
        if (error) return error;
        if (isRecording) return 'Listening...';
        if (!isSupported) return 'Not supported';
        return '';
    };

    return (
        <div className="voice-button-container">
            <button
                className={getButtonClass()}
                onClick={toggleRecording}
                disabled={!isSupported}
                title={isSupported ? 'Click to speak' : 'Voice not supported'}
            >
                {isRecording ? (
                    <Mic size={20} className="pulse" />
                ) : error ? (
                    <AlertTriangle size={20} />
                ) : (
                    <Mic size={20} />
                )}
            </button>

            {getStatusText() && (
                <span className={`voice-status ${error ? 'error' : ''}`}>
                    {getStatusText()}
                </span>
            )}
        </div>
    );
}

export default VoiceButton;
