"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, AlertTriangle, Cloud } from 'lucide-react';
import { voiceService } from '@/lib/voiceService';

const LANG_TAGS: Record<string, string> = {
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

interface VoiceButtonProps {
    onTranscript?: (text: string, language: string) => void;
    onResponse?: (text: string) => void;
    position?: 'inline' | 'fixed';
    language?: string;
}

export default function VoiceButton({
    onTranscript,
    onResponse,
    position = 'inline',
    language = 'en'
}: VoiceButtonProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'cloud' | 'browser'>('browser');
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef('');

    // Initialize Voice Service & Browser Fallback
    useEffect(() => {
        // SSR Check
        if (typeof window === 'undefined') return;

        // 1. Try connecting to Cloud Voice
        voiceService.connect();

        const checkConnection = setInterval(() => {
            if (voiceService.isConnected) {
                setMode('cloud');
            } else {
                setMode('browser');
            }
        }, 1000);

        // 2. Setup Browser Speech Recognition (Fallback)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = LANG_TAGS[language] || 'en-IN';

            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0].transcript)
                    .join('');

                transcriptRef.current = transcript;
                if (event.results[0].isFinal) {
                    onTranscript?.(transcript, language);
                    setIsRecording(false);
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setError('Access denied');
                } else {
                    setError('Error');
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
                setMode('browser');
                setIsRecording(false);
                setTimeout(() => setError(null), 3000);
            },
            onConnectionChange: (connected) => {
                setMode(connected ? 'cloud' : 'browser');
            }
        });

        return () => {
            clearInterval(checkConnection);
        };
    }, [onTranscript, onResponse, language, mode]);

    const toggleRecording = useCallback(async () => {
        if (!isSupported && mode === 'browser') {
            setError('Not supported');
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
                    setError('Busy');
                }
            }
        }
    }, [isRecording, isSupported, mode]);

    const getButtonClass = () => {
        let cls = "flex items-center justify-center rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ";

        if (position === 'fixed') {
            cls += "fixed bottom-6 right-6 w-14 h-14 shadow-lg z-50 ";
        } else {
            cls += "w-10 h-10 ";
        }

        if (error) {
            cls += "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 ";
        } else if (isRecording) {
            cls += mode === 'cloud'
                ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse "
                : "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse ";
        } else {
            cls += "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-600 ";
        }

        return cls;
    };

    return (
        <div className="relative inline-flex items-center">
            <button
                className={getButtonClass()}
                onClick={toggleRecording}
                disabled={!isSupported && mode === 'browser'}
                title={mode === 'cloud' ? 'AI Voice Mode (Cloud)' : 'Browser Voice Mode'}
            >
                {isRecording ? (
                    <Mic size={20} />
                ) : error ? (
                    <AlertTriangle size={20} />
                ) : (
                    mode === 'cloud' ? <Cloud size={20} /> : <Mic size={20} />
                )}
            </button>

            {/* Status Tooltip */}
            {(isRecording || error) && (
                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap pointer-events-none ${error ? 'bg-red-900/80 text-red-200' : 'bg-slate-800/90 text-white'
                    }`}>
                    {error || (mode === 'cloud' ? 'Listening (Cloud)...' : 'Listening...')}
                </div>
            )}
        </div>
    );
}
