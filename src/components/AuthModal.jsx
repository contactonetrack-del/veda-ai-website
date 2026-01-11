import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Mail, Lock, User, Chrome, UserCircle, Loader2 } from 'lucide-react'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import './AuthModal.css'

// Firebase error to user-friendly message
function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'This email is already registered. Try logging in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid credentials. Check your email and password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    }
    return messages[code] || 'An error occurred. Please try again.'
}

function AuthModal({ isOpen, onClose }) {
    const navigate = useNavigate()
    const { loginAsGuest } = useAuth()
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleEmailAuth = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!email || !password) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        if (mode === 'signup' && !name) {
            setError('Please enter your name')
            setLoading(false)
            return
        }

        try {
            if (mode === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                // Update display name
                await updateProfile(userCredential.user, { displayName: name })
            } else {
                await signInWithEmailAndPassword(auth, email, password)
            }
            onClose()
            navigate('/chat')
        } catch (err) {
            setError(getErrorMessage(err.code))
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setLoading(true)

        const provider = new GoogleAuthProvider()
        // Add scopes
        provider.addScope('email')
        provider.addScope('profile')

        try {
            const result = await signInWithPopup(auth, provider)
            console.log('Google Sign-in successful:', result.user.email)
            onClose()
            navigate('/chat')
        } catch (err) {
            console.error('Google Sign-in error:', err.code, err.message)

            // Handle specific error codes
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in popup was closed. Please try again.')
            } else if (err.code === 'auth/cancelled-popup-request') {
                setError('Another popup is already open.')
            } else if (err.code === 'auth/popup-blocked') {
                setError('Popup was blocked. Please allow popups for this site.')
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized. Add localhost to Firebase Auth settings.')
            } else {
                setError(getErrorMessage(err.code) || err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGuestAccess = () => {
        // Use auth context for proper guest login
        loginAsGuest()
        onClose()
        navigate('/chat')
    }

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal glass" onClick={(e) => e.stopPropagation()}>
                <button className="auth-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="auth-header">
                    <img src="/logo.png" alt="VEDA AI" className="auth-logo" />
                    <h2>Welcome to <span className="gradient-text">VEDA AI</span></h2>
                    <p>Your AI companion for Health, Fitness & Insurance</p>
                </div>

                {/* Google Sign In */}
                <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
                    <Chrome size={20} />
                    Continue with Google
                </button>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailAuth} className="auth-form">
                    {mode === 'signup' && (
                        <div className="input-group">
                            <User size={18} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? (
                            <><Loader2 size={18} className="spin" /> Please wait...</>
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <p className="auth-switch">
                    {mode === 'login' ? (
                        <>Don't have an account? <button onClick={() => setMode('signup')}>Sign Up</button></>
                    ) : (
                        <>Already have an account? <button onClick={() => setMode('login')}>Sign In</button></>
                    )}
                </p>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* Guest Access */}
                <button className="guest-btn" onClick={handleGuestAccess} disabled={loading}>
                    <UserCircle size={20} />
                    Continue as Guest
                    <span className="guest-limit-badge">5 messages limit</span>
                </button>
            </div>
        </div>
    )
}

export default AuthModal
