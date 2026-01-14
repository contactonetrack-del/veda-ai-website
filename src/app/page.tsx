"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import {
    Dumbbell,
    Flower2,
    Salad,
    HeartPulse,
    Shield,
    Globe,
    Flame,
    MessageCircle
} from 'lucide-react';

const services = [
    { icon: Dumbbell, title: 'Fitness & Workout', desc: 'Personalized exercise plans for your body type' },
    { icon: Flower2, title: 'Yoga & Meditation', desc: 'Ancient practices with modern guidance' },
    { icon: Salad, title: 'Diet & Nutrition', desc: 'Indian-focused meal planning and calorie tracking' },
    { icon: HeartPulse, title: 'Health Advice', desc: 'Trusted wellness tips and preventive care' },
    { icon: Shield, title: 'Insurance Guide', desc: 'IRDAI-compliant policy recommendations' },
    { icon: Globe, title: 'General Assistant', desc: 'Ask anything - VEDA knows it all' },
];

export default function LandingPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const router = useRouter();
    const { user, loading } = useAuth();

    // Redirect to chat if already logged in
    useEffect(() => {
        if (!loading && user) {
            router.push('/chat');
        }
    }, [user, loading, router]);

    // Check if user is already logged in
    const checkExistingUser = () => {
        if (user) {
            router.push('/chat');
        } else {
            setIsAuthOpen(true);
        }
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-900"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Hero Section */}
            <header className="relative pt-6 px-6 lg:px-12 flex flex-col justify-center min-h-[90vh]">
                <nav className="fixed top-6 left-6 right-6 z-50 glass flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        {/* Logo Placeholder */}
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
                        <span className="font-bold text-xl tracking-tight text-white">VEDA AI</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-slate-300 font-medium">
                        <a href="#services" className="hover:text-emerald-400 transition-colors">Services</a>
                        <button onClick={() => router.push('/tools')} className="hover:text-emerald-400 transition-colors">Tools</button>
                        <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
                        <button className="premium-btn text-sm py-2 px-6" onClick={checkExistingUser}>
                            Start Chat
                        </button>
                    </div>
                </nav>

                <div className="max-w-4xl mx-auto text-center mt-24">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                        <span className="gradient-text">VEDA AI</span>
                        <br />
                        <span className="text-3xl md:text-5xl text-slate-300 font-normal">Ancient Wisdom. Modern Intelligence.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        Your personal AI companion for Fitness, Health, Diet, Yoga, Meditation,
                        and Indian Insurance guidance. Powered by knowledge, designed for you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="premium-btn flex items-center gap-2 text-lg" onClick={checkExistingUser}>
                            <Flame size={20} />
                            Talk to VEDA AI
                        </button>
                        <button className="secondary-btn flex items-center gap-2 text-lg" onClick={() => router.push('/tools')}>
                            <Dumbbell size={20} />
                            Free Health Tools
                        </button>
                    </div>
                </div>

                <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-transparent to-slate-900/90 pointer-events-none"></div>
            </header>

            {/* Services Section */}
            <section id="services" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">What Can <span className="gradient-text">VEDA AI</span> Do?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="glass p-8 hover:-translate-y-2 transition-transform cursor-pointer group"
                                onClick={() => {
                                    if (service.title.includes('Diet')) router.push('/calorie-counter');
                                    else if (service.title.includes('Insurance')) router.push('/insurance');
                                    else if (service.title.includes('Health') || service.title.includes('Fitness')) router.push('/tools');
                                    else checkExistingUser();
                                }}
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                                    <service.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">{service.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-6 relative">
                <div className="max-w-4xl mx-auto glass p-12 text-center">
                    <h2 className="text-3xl font-bold mb-8 text-white">Why <span className="gradient-text">VEDA</span>?</h2>
                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                        "Veda" (वेद) means <strong className="text-emerald-400">Knowledge</strong> in Sanskrit — the foundation of
                        ancient Indian wisdom. We've combined this timeless philosophy with cutting-edge
                        AI to create a platform that truly understands your health, lifestyle, and
                        financial protection needs in the Indian context.
                    </p>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        Whether you need a personalized diet plan with Indian foods, yoga asanas for
                        your condition, or help understanding health insurance jargon like TPA and
                        Cashless claims — <strong className="text-emerald-400">VEDA AI</strong> is here for you.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-slate-600 border-t border-slate-800/50">
                <p>© 2026 VEDA AI. Powered by Antigravity IDE.</p>
            </footer>

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
}
