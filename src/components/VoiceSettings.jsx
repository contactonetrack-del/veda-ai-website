/**
 * Voice Settings Component
 * Voice Gender Toggle + Voice Personas for Web
 */

import React, { useState, useEffect } from 'react';
import { Volume2, User, UserCircle, Mic, Sparkles, X, Zap } from 'lucide-react';
import './VoiceSettings.css';

// Voice Personas - Different AI personalities with unique test messages
const VOICE_PERSONAS = [
    {
        id: 'default',
        name: 'VEDA',
        description: 'Calm & Balanced',
        color: '#10B981',
        pitch: 1.0,
        rate: 0.9,
        testMsg: 'Namaste! I am VEDA, your wellness guide.'
    },
    {
        id: 'enthusiast',
        name: 'Ananya',
        description: 'Energetic & Motivating',
        color: '#F59E0B',
        pitch: 1.15,
        rate: 1.05,
        testMsg: 'Hey there! I am Ananya, ready to energize your day!'
    },
    {
        id: 'expert',
        name: 'Dr. Sharma',
        description: 'Professional & Precise',
        color: '#3B82F6',
        pitch: 0.85,
        rate: 0.85,
        testMsg: 'Good day. I am Dr. Sharma, here to assist you professionally.'
    },
    {
        id: 'friendly',
        name: 'Priya',
        description: 'Warm & Supportive',
        color: '#EC4899',
        pitch: 1.1,
        rate: 0.95,
        testMsg: 'Hello friend! I am Priya, always here for you.'
    },
    {
        id: 'guru',
        name: 'Guruji',
        description: 'Wise & Traditional',
        color: '#8B5CF6',
        pitch: 0.75,
        rate: 0.8,
        testMsg: 'Om Shanti. I am Guruji, your guide to wisdom.'
    }
];

export function VoiceSettingsModal({ isOpen, onClose, settings, onSettingsChange }) {
    const [voiceGender, setVoiceGender] = useState(settings?.gender || 'female');
    const [selectedPersona, setSelectedPersona] = useState(settings?.persona || 'default');
    const [testPlaying, setTestPlaying] = useState(false);

    useEffect(() => {
        if (settings) {
            setVoiceGender(settings.gender || 'female');
            setSelectedPersona(settings.persona || 'default');
        }
    }, [settings]);

    const handleSave = () => {
        onSettingsChange({
            gender: voiceGender,
            persona: selectedPersona
        });
        onClose();
    };

    const testVoice = () => {
        if ('speechSynthesis' in window) {
            // If already playing, stop it
            if (testPlaying) {
                window.speechSynthesis.cancel();
                setTestPlaying(false);
                return;
            }

            window.speechSynthesis.cancel();

            const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona);
            const utterance = new SpeechSynthesisUtterance(persona.testMsg);

            // Get available voices and select based on gender
            const voices = window.speechSynthesis.getVoices();

            // Find appropriate voice based on gender
            let selectedVoice = null;
            if (voiceGender === 'male') {
                // Look for male voices (Indian English preferred)
                selectedVoice = voices.find(v =>
                    v.name.toLowerCase().includes('male') ||
                    v.name.toLowerCase().includes('ravi') ||
                    v.name.toLowerCase().includes('hemant') ||
                    v.name.includes('David') ||
                    v.name.includes('Mark')
                );
                // Fallback: lower pitch for male effect
                if (!selectedVoice) {
                    utterance.pitch = Math.max(0.5, persona.pitch - 0.3);
                }
            } else {
                // Look for female voices
                selectedVoice = voices.find(v =>
                    v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('heera') ||
                    v.name.includes('Zira') ||
                    v.name.includes('Samantha')
                );
                if (!selectedVoice) {
                    utterance.pitch = Math.min(1.5, persona.pitch + 0.1);
                }
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            utterance.lang = 'en-IN';
            utterance.pitch = selectedVoice ? persona.pitch : utterance.pitch;
            utterance.rate = persona.rate;

            utterance.onstart = () => setTestPlaying(true);
            utterance.onend = () => setTestPlaying(false);
            utterance.onerror = () => setTestPlaying(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="voice-modal-overlay" onClick={onClose}>
            <div className="voice-modal" onClick={(e) => e.stopPropagation()}>
                <div className="voice-modal-header">
                    <div className="voice-modal-title">
                        <Volume2 size={20} />
                        <h2>Voice Settings</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="voice-modal-content">
                    {/* Gender Toggle */}
                    <section className="voice-section">
                        <h3>Voice Gender</h3>
                        <div className="gender-toggle">
                            <button
                                className={`gender-btn ${voiceGender === 'female' ? 'active' : ''}`}
                                onClick={() => setVoiceGender('female')}
                            >
                                <Sparkles size={24} />
                                <span>Female</span>
                            </button>
                            <button
                                className={`gender-btn ${voiceGender === 'male' ? 'active' : ''}`}
                                onClick={() => setVoiceGender('male')}
                            >
                                <Zap size={24} />
                                <span>Male</span>
                            </button>
                        </div>
                    </section>

                    {/* Voice Personas */}
                    <section className="voice-section">
                        <h3>
                            <Sparkles size={16} />
                            Voice Persona
                        </h3>
                        <div className="persona-grid">
                            {VOICE_PERSONAS.map((persona) => (
                                <button
                                    key={persona.id}
                                    className={`persona-card ${selectedPersona === persona.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPersona(persona.id)}
                                    style={{ '--persona-color': persona.color }}
                                >
                                    <div className="persona-avatar">
                                        {persona.name.charAt(0)}
                                    </div>
                                    <div className="persona-info">
                                        <span className="persona-name">{persona.name}</span>
                                        <span className="persona-desc">{persona.description}</span>
                                    </div>
                                    {selectedPersona === persona.id && (
                                        <div className="selected-check">✓</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Test/Stop Button */}
                    <button
                        className={`test-voice-btn ${testPlaying ? 'playing' : ''}`}
                        onClick={testVoice}
                    >
                        {testPlaying ? (
                            <><X size={16} /> Stop</>
                        ) : (
                            <><Mic size={16} /> Test Voice</>
                        )}
                    </button>
                </div>

                <div className="voice-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="save-btn" onClick={handleSave}>Save Settings</button>
                </div>
            </div>
        </div>
    );
}

// Compact trigger button for header
export function VoiceSettingsButton({ onClick, gender }) {
    return (
        <button className="voice-settings-trigger" onClick={onClick} title="Voice Settings">
            <Volume2 size={20} />
        </button>
    );
}

export default VoiceSettingsModal;
