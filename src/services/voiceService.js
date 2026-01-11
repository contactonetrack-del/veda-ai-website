/**
 * VoiceService - Handles WebSocket voice communication with VEDA AI
 */

// Use local WebSocket in development
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const WS_URL = isLocalDev
    ? 'ws://localhost:8000/api/v1/voice/ws'
    : (import.meta.env.VITE_API_URL?.replace('http', 'ws') + '/api/v1/voice/ws' || 'wss://veda-ai-backend-ql2b.onrender.com/api/v1/voice/ws');

class VoiceService {
    constructor() {
        this.ws = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.callbacks = {
            onTranscript: null,
            onResponse: null,
            onAudioStart: null,
            onAudioEnd: null,
            onError: null,
            onConnectionChange: null,
        };
        this.isConnected = false;
        this.audioBuffer = [];
    }

    // Set callback functions
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    // Connect to WebSocket
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

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
    }

    // Disconnect from WebSocket
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    // Start recording audio
    async startRecording() {
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
                this.ws.send(arrayBuffer);
                this.ws.send(JSON.stringify({ type: 'end_stream' }));

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

    // Stop recording audio
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }

    // Play received audio
    playAudio() {
        if (this.audioBuffer.length === 0) return;

        const blob = new Blob(this.audioBuffer, { type: 'audio/wav' });
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play().catch(err => console.error('Audio playback error:', err));
    }
}

// Singleton instance
export const voiceService = new VoiceService();
export default voiceService;
