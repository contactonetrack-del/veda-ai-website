/**
 * Firebase Configuration for VEDA AI Website
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyCjWigElA2r4fXwlv26SsOIw742_h9WQG4",
    authDomain: "veda-ai-b412f.firebaseapp.com",
    projectId: "veda-ai-b412f",
    storageBucket: "veda-ai-b412f.firebasestorage.app",
    messagingSenderId: "247809272190",
    appId: "1:247809272190:web:bb6d6e307d976760feab2f",
    measurementId: "G-16EH06Y7BC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser)
let analytics = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}
export { analytics };

export default app;
