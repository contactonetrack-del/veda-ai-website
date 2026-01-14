import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertTriangle, Loader2, Cloud, WifiOff } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import './VoiceButton.css';

/**
 * VoiceButton - Hybrid Voice Input
 * Priority: WebSocket (Backend AI) -> Web Speech API (Browser Fallback)
 */
const LANG_TAGS = {
    en: 'en-IN',
    hi: 'hi-IN',
    bho: 'hi-IN',
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
    gon: 'hi-IN',
    hne: 'hi-IN',
};

function VoiceButton({ onTranscript, onResponse, position = 'inline', language = 'en' }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported] = useState(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('browser'); // 'cloud' | 'browser'
    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');

    // Initialize Voice Service & Browser Fallback
    useEffect(() => {
        // 1. Try connecting to Cloud Voice
        voiceService.connect();

        const checkConnection = setInterval(() => {
            if (voiceService.isConnected) {
                setMode('cloud');
            } else {
                setMode('browser'); // Fallback if WS not connected
            }
        }, 1000);

        // 2. Setup Browser Speech Recognition (Fallback)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            // setIsSupported(true); 
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = LANG_TAGS[language] || 'en-IN';

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                transcriptRef.current = transcript;
                if (event.results[0].isFinal) {
                    onTranscript?.(transcript, language);
                    setIsRecording(false);
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            };

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
                if (mode === 'browser') setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }

        // 3. Setup Cloud Callbacks
        voiceService.setCallbacks({
            onTranscript: (text, lang) => {
                onTranscript?.(text, lang || language);
            },
            onResponse: (text) => {
                onResponse?.(text);
                setIsRecording(false);
            },
            onError: (err) => {
                console.error('Cloud voice error:', err);
                setError('Cloud error');
                setMode('browser'); // Fallback on error
                setIsRecording(false);
                setTimeout(() => setError(null), 3000);
            },
            onConnectionChange: (connected) => {
                setMode(connected ? 'cloud' : 'browser');
            }
        });

        return () => {
            clearInterval(checkConnection);
            // voiceService.disconnect(); // Keep active for other components
        };
    }, [onTranscript, onResponse, language, mode]);


    const toggleRecording = useCallback(async () => {
        if (!isSupported && mode === 'browser') {
            setError('Voice not supported');
            return;
        }

        if (isRecording) {
            // STOP
            if (mode === 'cloud') {
                voiceService.stopRecording();
            } else {
                recognitionRef.current?.stop();
            }
            setIsRecording(false);
        } else {
            // START
            setError(null);
            transcriptRef.current = '';
            setIsRecording(true);

            if (mode === 'cloud') {
                const success = await voiceService.startRecording();
                if (!success) {
                    // Failover to browser immediately if cloud mic fails
                    console.log('Failing over to browser speech...');
                    setMode('browser');
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        console.error('Fallback mic failed:', e);
                        setIsRecording(false);
                        setError('Mic failed');
                    }
                }
            } else {
                try {
                    recognitionRef.current?.start();
                } catch (err) {
                    console.error('Mic error:', err);
                    setIsRecording(false);
                    setError('Mic busy');
                }
            }
        }
    }, [isRecording, isSupported, mode]);

    const getButtonClass = () => {
        let cls = `voice-btn ${position}`;
        if (isRecording) cls += ' recording';
        if (error) cls += ' error';
        if (mode === 'cloud') cls += ' cloud-mode';
        return cls;
    };

    const getStatusText = () => {
        if (error) return error;
        if (isRecording) return mode === 'cloud' ? 'Listening (Cloud)...' : 'Listening...';
        return '';
    };

    return (
        <div className="voice-button-container">
            <button
                className={getButtonClass()}
                onClick={toggleRecording}
                disabled={!isSupported && mode === 'browser'}
                title={mode === 'cloud' ? 'AI Voice Mode (Cloud)' : 'Browser Voice Mode'}
            >
                {isRecording ? (
                    <Mic size={20} className="pulse" />
                ) : error ? (
                    <AlertTriangle size={20} />
                ) : (
                    mode === 'cloud' ? <Cloud size={20} /> : <Mic size={20} />
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
