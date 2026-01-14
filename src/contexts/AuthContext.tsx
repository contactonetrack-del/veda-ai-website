"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isGuest: boolean;
    messagesRemaining?: number;
}

interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    isAuthenticated: boolean;
    isGuest: boolean;
    logout: () => Promise<void>;
    loginAsGuest: () => void;
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // SSR Check
        if (typeof window === 'undefined') return;

        // Check for guest mode first
        const guestMode = localStorage.getItem('veda_guest_mode');
        if (guestMode === 'true') {
            const guestUser: UserData = {
                uid: 'guest-' + Date.now(),
                email: null,
                displayName: 'Guest User',
                photoURL: null,
                isGuest: true,
                messagesRemaining: 5 - parseInt(localStorage.getItem('veda_guest_messages') || '0')
            };
            setUser(guestUser);
            setLoading(false);
            return;
        }

        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userData: UserData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    isGuest: false,
                };
                setUser(userData);
                // Also store in localStorage for compatibility
                localStorage.setItem('veda_user', JSON.stringify(userData));
            } else {
                setUser(null);
                localStorage.removeItem('veda_user');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginAsGuest = () => {
        const guestUser: UserData = {
            uid: 'guest-' + Date.now(),
            email: null,
            displayName: 'Guest User',
            photoURL: null,
            isGuest: true,
            messagesRemaining: 5
        };
        localStorage.setItem('veda_guest_mode', 'true');
        localStorage.setItem('veda_guest_messages', '0');
        setUser(guestUser);
    };

    const logout = async () => {
        try {
            // Check if it's a guest
            if (user?.isGuest) {
                localStorage.removeItem('veda_guest_mode');
                localStorage.removeItem('veda_guest_messages');
                setUser(null);
            } else {
                await signOut(auth);
                localStorage.removeItem('veda_user');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const refreshUser = () => {
        if (auth.currentUser) {
            const userData: UserData = {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName,
                photoURL: auth.currentUser.photoURL,
                isGuest: false,
            };
            setUser(userData);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isGuest: user?.isGuest || false,
        logout,
        loginAsGuest,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
