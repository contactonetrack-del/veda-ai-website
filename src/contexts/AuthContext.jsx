/**
 * Auth Context for VEDA AI Website
 * Manages Firebase authentication state + Guest mode
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for guest mode first
        const guestMode = localStorage.getItem('veda_guest_mode')
        if (guestMode === 'true') {
            const guestUser = {
                uid: 'guest-' + Date.now(),
                email: null,
                displayName: 'Guest User',
                photoURL: null,
                isGuest: true,
                messagesRemaining: 5 - parseInt(localStorage.getItem('veda_guest_messages') || '0')
            }
            setUser(guestUser)
            setLoading(false)
            return () => { }
        }

        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    isGuest: false,
                }
                setUser(userData)
                // Also store in localStorage for compatibility
                localStorage.setItem('veda_user', JSON.stringify(userData))
            } else {
                setUser(null)
                localStorage.removeItem('veda_user')
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const loginAsGuest = () => {
        const guestUser = {
            uid: 'guest-' + Date.now(),
            email: null,
            displayName: 'Guest User',
            photoURL: null,
            isGuest: true,
            messagesRemaining: 5
        }
        localStorage.setItem('veda_guest_mode', 'true')
        localStorage.setItem('veda_guest_messages', '0')
        setUser(guestUser)
    }

    const logout = async () => {
        try {
            // Check if it's a guest
            if (user?.isGuest) {
                localStorage.removeItem('veda_guest_mode')
                localStorage.removeItem('veda_guest_messages')
                setUser(null)
            } else {
                await signOut(auth)
                localStorage.removeItem('veda_user')
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const refreshUser = () => {
        if (auth.currentUser) {
            const userData = {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName,
                photoURL: auth.currentUser.photoURL,
                isGuest: false,
            }
            setUser(userData)
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isGuest: user?.isGuest || false,
        logout,
        loginAsGuest,
        refreshUser,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
