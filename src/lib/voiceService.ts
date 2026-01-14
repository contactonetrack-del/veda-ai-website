"use client";

const API_Base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Convert HTTP URL to WebSocket URL
const WS_URL = API_Base.startsWith('https')
    ? API_Base.replace('https', 'wss') + '/api/v1/voice/ws'
    : API_Base.replace('http', 'ws') + '/api/v1/voice/ws';

type VoiceCallback = (...args: any[]) => void;

interface VoiceCallbacks {
    onTranscript: ((text: string, language: string, confidence: number) => void) | null;
    onResponse: ((text: string, language: string) => void) | null;
    onAudioStart: (() => void) | null;
    onAudioEnd: (() => void) | null;
    onError: ((error: string) => void) | null;
    onConnectionChange: ((connected: boolean) => void) | null;
}

class VoiceService {
    private ws: WebSocket | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private callbacks: VoiceCallbacks = {
        onTranscript: null,
        onResponse: null,
        onAudioStart: null,
        onAudioEnd: null,
        onError: null,
        onConnectionChange: null,
    };
    public isConnected: boolean = false;
    private audioBuffer: Uint8Array[] = [];

    constructor() { }

    setCallbacks(callbacks: Partial<VoiceCallbacks>) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    connect() {
        if (typeof window === 'undefined') return;
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = () => {
                this.isConnected = true;
                this.callbacks.onConnectionChange?.(true);
                console.log('Voice WebSocket connected');
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.callbacks.onConnectionChange?.(false);
                console.log('Voice WebSocket disconnected');
                // Auto-reconnect after 3 seconds
                setTimeout(() => this.connect(), 3000);
            };

            this.ws.onerror = (error) => {
                console.error('Voice WebSocket error:', error);
                this.callbacks.onError?.('Connection error');
            };

            this.ws.onmessage = async (event) => {
                if (event.data instanceof Blob) {
                    // Audio chunk received
                    const arrayBuffer = await event.data.arrayBuffer();
                    this.audioBuffer.push(new Uint8Array(arrayBuffer));
                } else {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case 'transcript':
                            this.callbacks.onTranscript?.(data.text, data.language, data.confidence);
                            break;
                        case 'response':
                            this.callbacks.onResponse?.(data.text, data.language);
                            break;
                        case 'audio_start':
                            this.audioBuffer = [];
                            this.callbacks.onAudioStart?.();
                            break;
                        case 'audio_end':
                            this.playAudio();
                            this.callbacks.onAudioEnd?.();
                            break;
                        case 'error':
                            this.callbacks.onError?.(data.message);
                            break;
                    }
                }
            };
        } catch (error) {
            console.error('Failed to connect to Voice WebSocket:', error);
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    async startRecording(): Promise<boolean> {
        if (!this.isConnected) {
            this.callbacks.onError?.('Not connected to voice server');
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { sampleRate: 16000, channelCount: 1 }
            });

            this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.audioChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const arrayBuffer = await blob.arrayBuffer();

                // Send audio to server
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(arrayBuffer);
                    this.ws.send(JSON.stringify({ type: 'end_stream' }));
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start(100); // Collect data every 100ms
            return true;
        } catch (err) {
            console.error('Microphone access denied:', err);
            this.callbacks.onError?.('Microphone access denied');
            return false;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }

    playAudio() {
        if (this.audioBuffer.length === 0) return;

        const blob = new Blob(this.audioBuffer as BlobPart[], { type: 'audio/wav' });
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play().catch(err => console.error('Audio playback error:', err));
    }

    async synthesize(text: string, language: string = 'hi'): Promise<HTMLAudioElement> {
        try {
            // Replace WS protocol with HTTP for REST endpoint
            const API_URL = WS_URL.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '/synthesize');

            const params = new URLSearchParams({
                text: text,
                language: language
            });

            const response = await fetch(`${API_URL}?${params.toString()}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('TTS generation failed');
            }

            const blob = await response.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            return audio;
        } catch (error) {
            console.error('Backend TTS Error:', error);
            throw error;
        }
    }
}

export const voiceService = new VoiceService();
export default voiceService;
