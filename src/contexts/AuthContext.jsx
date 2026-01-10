/**
 * Auth Context for VEDA AI Website
 * Manages Firebase authentication state
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
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

    const logout = async () => {
        try {
            await signOut(auth)
            localStorage.removeItem('veda_user')
            localStorage.removeItem('veda_guest_mode')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        logout,
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
