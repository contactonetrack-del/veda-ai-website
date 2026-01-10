/**
 * Protected Route Component
 * Prevents blinking by showing loading state while checking auth
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Show loading spinner while checking auth state
    if (loading) {
        return (
            <div className="auth-loading-screen">
                <div className="auth-loader">
                    <div className="spinner"></div>
                    <p>Initializing...</p>
                </div>
            </div>
        );
    }

    // Redirect to home if not authenticated
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Render protected content
    return children;
}

export default ProtectedRoute;
