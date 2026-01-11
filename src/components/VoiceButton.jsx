import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import voiceService from '../services/voiceService';
import './VoiceButton.css';

/**
 * VoiceButton - Push-to-talk voice input component
 * 
 * Props:
 * - onTranscript: (text, language) => void - Called when speech is transcribed
 * - onResponse: (text, language) => void - Called when AI responds
 * - position: 'inline' | 'floating' - Button position style
 */
function VoiceButton({ onTranscript, onResponse, position = 'inline' }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    // Connect to voice service on mount
    useEffect(() => {
        voiceService.setCallbacks({
            onConnectionChange: setIsConnected,
            onTranscript: (text, language, confidence) => {
                onTranscript?.(text, language);
                setIsProcessing(true);
            },
            onResponse: (text, language) => {
                onResponse?.(text, language);
                setIsProcessing(false);
            },
            onAudioStart: () => setIsPlaying(true),
            onAudioEnd: () => setIsPlaying(false),
            onError: (msg) => {
                setError(msg);
                setIsProcessing(false);
                setIsRecording(false);
                setTimeout(() => setError(null), 3000);
            },
        });

        voiceService.connect();

        return () => {
            voiceService.disconnect();
        };
    }, [onTranscript, onResponse]);

    // Handle recording start
    const handleMouseDown = useCallback(async () => {
        if (!isConnected) {
            setError('Connecting...');
            return;
        }

        const success = await voiceService.startRecording();
        if (success) {
            setIsRecording(true);
            setError(null);
        }
    }, [isConnected]);

    // Handle recording stop
    const handleMouseUp = useCallback(() => {
        if (isRecording) {
            voiceService.stopRecording();
            setIsRecording(false);
        }
    }, [isRecording]);

    // Determine button state
    const getButtonState = () => {
        if (isPlaying) return 'playing';
        if (isProcessing) return 'processing';
        if (isRecording) return 'recording';
        if (!isConnected) return 'disconnected';
        return 'idle';
    };

    const buttonState = getButtonState();

    // Render icon based on state
    const renderIcon = () => {
        switch (buttonState) {
            case 'playing':
                return <Volume2 size={24} className="voice-icon pulse" />;
            case 'processing':
                return <Loader2 size={24} className="voice-icon spin" />;
            case 'recording':
                return <Mic size={24} className="voice-icon recording" />;
            case 'disconnected':
                return <MicOff size={24} className="voice-icon" />;
            default:
                return <Mic size={24} className="voice-icon" />;
        }
    };

    return (
        <div className={`voice-button-container ${position}`}>
            <button
                className={`voice-button ${buttonState}`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                disabled={isProcessing || isPlaying}
                title={isConnected ? 'Hold to speak' : 'Connecting...'}
            >
                {renderIcon()}
            </button>

            {error && (
                <div className="voice-error">
                    {error}
                </div>
            )}

            {isRecording && (
                <div className="voice-status">
                    🎙️ Listening...
                </div>
            )}
        </div>
    );
}

export default VoiceButton;
