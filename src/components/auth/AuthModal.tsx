"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, User, Chrome, UserCircle, Loader2 } from 'lucide-react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

// Firebase error to user-friendly message
function getErrorMessage(code: string) {
    const messages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Try logging in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid credentials. Check your email and password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    };
    return messages[code] || 'An error occurred. Please try again.';
}

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const router = useRouter();
    const { loginAsGuest } = useAuth();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        if (mode === 'signup' && !name) {
            setError('Please enter your name');
            setLoading(false);
            return;
        }

        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update display name
                if (userCredential.user) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onClose();
            router.push('/chat');
        } catch (err: any) {
            setError(getErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');

        try {
            await signInWithPopup(auth, provider);
            onClose();
            router.push('/chat');
        } catch (err: any) {
            console.error('Google Sign-in error:', err.code, err.message);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in popup was closed. Please try again.');
            } else {
                setError(getErrorMessage(err.code) || err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestAccess = () => {
        loginAsGuest();
        onClose();
        router.push('/chat');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-md p-6 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    {/* Placeholder for Logo */}
                    <div className="w-12 h-12 mx-auto mb-4 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">V</div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">VEDA AI</span>
                    </h2>
                    <p className="text-slate-400 text-sm">Your AI companion for Health & Wellness</p>
                </div>

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-50 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                >
                    <Chrome size={20} className="text-blue-500" />
                    Continue with Google
                </button>

                <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <span className="text-slate-500 text-sm">or</span>
                    <div className="h-px bg-slate-700 flex-1"></div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {mode === 'signup' && (
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <p className="mt-4 text-center text-slate-400 text-sm">
                    {mode === 'login' ? (
                        <>Don't have an account? <button onClick={() => setMode('signup')} className="text-emerald-400 hover:text-emerald-300 font-medium ml-1">Sign Up</button></>
                    ) : (
                        <>Already have an account? <button onClick={() => setMode('login')} className="text-emerald-400 hover:text-emerald-300 font-medium ml-1">Sign In</button></>
                    )}
                </p>

                <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <span className="text-slate-500 text-sm">or</span>
                    <div className="h-px bg-slate-700 flex-1"></div>
                </div>

                {/* Guest Access */}
                <button
                    onClick={handleGuestAccess}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-xl font-medium hover:bg-slate-800 hover:text-white transition-all hover:scale-[1.02]"
                >
                    <UserCircle size={20} />
                    Continue as Guest
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full ml-2">Limit: 5 msgs</span>
                </button>
            </div>
        </div>
    );
}
