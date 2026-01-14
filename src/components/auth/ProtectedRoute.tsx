"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-emerald-400">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Consulting VEDA...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
