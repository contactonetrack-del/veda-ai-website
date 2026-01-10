/**
 * Zero-Cost Error Logger for VEDA AI
 * 
 * Instead of expensive services like Sentry, we use structured console logging.
 * Browse logs in Render Dashboard to debug issues.
 * 
 * Usage:
 * import { logError, logEvent } from '../utils/errorLogger';
 * 
 * try {
 *   // code
 * } catch (e) {
 *   logError('FeatureName', e, { extra: 'data' });
 * }
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://veda-ai-backend-ql2b.onrender.com';

export function logError(category, error, context = {}) {
    const errorLog = {
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        category,
        message: error.message || String(error),
        stack: error.stack,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    // 1. Log to Browser Console (Structured)
    console.error('[VEDA-ERROR]', JSON.stringify(errorLog, null, 2));

    // 2. (Optional) Send to Backend if critical
    // We send this asynchronously and don't await it to avoid blocking UI
    if (category === 'critical' || category === 'payment') {
        fetch(`${API_BASE_URL}/api/log-error`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(errorLog)
        }).catch(e => console.warn('Failed to send error log to backend', e));
    }
}

export function logEvent(category, action, data = {}) {
    const eventLog = {
        level: 'INFO',
        timestamp: new Date().toISOString(),
        category,
        action,
        data
    };

    // Log to Browser Console
    console.log('[VEDA-EVENT]', JSON.stringify(eventLog));
}
