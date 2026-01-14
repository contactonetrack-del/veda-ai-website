"use client";

import { useEffect, useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [showModal, setShowModal] = useState(false);
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If already logged in, redirect to valid page (e.g., dashboard or home)
        if (!loading && isAuthenticated) {
            // router.push('/dashboard'); // dashboard doesn't exist yet
            console.log("User is authenticated");
        }
        // Show modal immediately for this page
        setShowModal(true);
    }, [loading, isAuthenticated, router]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black pointer-events-none"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="z-10 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">VEDA AI Platform</h1>
                <p className="text-slate-400">Next.js 15 Migration Build</p>
            </div>

            <AuthModal
                isOpen={showModal}
                onClose={() => console.log('Modal cannot be closed on login page')}
            />
        </div>
    );
}
