import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import AuthModal from './components/AuthModal'
import ChatPage from './pages/ChatPage'
import { useAuth } from './contexts/AuthContext'
import {
  Dumbbell,
  Flower2,
  Salad,
  HeartPulse,
  Shield,
  Globe,
  Flame,
  MessageCircle
} from 'lucide-react'

// Service data for VEDA AI with Lucide icons
const services = [
  { icon: Dumbbell, title: 'Fitness & Workout', desc: 'Personalized exercise plans for your body type' },
  { icon: Flower2, title: 'Yoga & Meditation', desc: 'Ancient practices with modern guidance' },
  { icon: Salad, title: 'Diet & Nutrition', desc: 'Indian-focused meal planning and calorie tracking' },
  { icon: HeartPulse, title: 'Health Advice', desc: 'Trusted wellness tips and preventive care' },
  { icon: Shield, title: 'Insurance Guide', desc: 'IRDAI-compliant policy recommendations' },
  { icon: Globe, title: 'General Assistant', desc: 'Ask anything - VEDA knows it all' },
]

// Landing Page Component
function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  // Redirect to chat if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/chat')
    }
  }, [user, loading, navigate])

  // Check if user is already logged in
  const checkExistingUser = () => {
    if (user) {
      navigate('/chat')
    } else {
      setIsAuthOpen(true)
    }
  }

  return (
    <div className="app">
      {/* Hero Section */}
      <header className="hero">
        <nav className="nav glass">
          <img src="/logo.png" alt="VEDA AI" className="nav-logo" />
          <div className="nav-links">
            <a href="#services">Services</a>
            <button className="nav-link-btn" onClick={() => navigate('/tools')}>Tools</button>
            <a href="#about">About</a>
            <button className="premium-btn" onClick={checkExistingUser}>
              Start Chat
            </button>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">VEDA AI</span>
            <br />
            Ancient Wisdom. Modern Intelligence.
          </h1>
          <p className="hero-subtitle">
            Your personal AI companion for Fitness, Health, Diet, Yoga, Meditation,
            and Indian Insurance guidance. Powered by knowledge, designed for you.
          </p>
          <div className="hero-buttons">
            <button className="premium-btn hero-cta" onClick={checkExistingUser}>
              <Flame size={20} />
              Talk to VEDA AI
            </button>
            <button className="secondary-btn hero-cta" onClick={() => navigate('/tools')}>
              <Dumbbell size={20} />
              Free Health Tools
            </button>
          </div>
        </div>

        <div className="hero-glow"></div>
      </header>

      {/* Services Section */}
      <section id="services" className="services-section">
        <h2 className="section-title">What Can <span className="gradient-text">VEDA AI</span> Do?</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card glass"
              onClick={() => {
                if (service.title.includes('Diet')) navigate('/calorie-counter');
                else if (service.title.includes('Insurance')) navigate('/insurance');
                else if (service.title.includes('Health') || service.title.includes('Fitness')) navigate('/tools');
                else checkExistingUser();
              }}
            >
              <service.icon className="service-icon" size={48} strokeWidth={1.5} />
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-content glass">
          <h2>Why <span className="gradient-text">VEDA</span>?</h2>
          <p>
            "Veda" (वेद) means <strong>Knowledge</strong> in Sanskrit — the foundation of
            ancient Indian wisdom. We've combined this timeless philosophy with cutting-edge
            AI to create a platform that truly understands your health, lifestyle, and
            financial protection needs in the Indian context.
          </p>
          <p>
            Whether you need a personalized diet plan with Indian foods, yoga asanas for
            your condition, or help understanding health insurance jargon like TPA and
            Cashless claims — <strong>VEDA AI</strong> is here for you.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 VEDA AI. Powered by Antigravity IDE.</p>
      </footer>

      {/* Floating Chat Button */}
      <button className="floating-chat-btn" onClick={checkExistingUser}>
        <MessageCircle size={28} />
      </button>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}

// Main App with Routing
function App() {
  // Dynamic imports for new pages
  const ToolsPage = lazy(() => import('./pages/ToolsPage'));
  const CalorieCounterPage = lazy(() => import('./pages/CalorieCounterPage'));
  const InsuranceEstimatorPage = lazy(() => import('./pages/InsuranceEstimatorPage'));
  const ProfilePage = lazy(() => import('./pages/ProfilePage'));
  const SnapThaliPage = lazy(() => import('./pages/SnapThaliPage'));

  return (
    <Suspense fallback={<div className="loading-screen">Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/calorie-counter" element={<CalorieCounterPage />} />
        <Route path="/insurance" element={<InsuranceEstimatorPage />} />
        <Route path="/snap-thali" element={<SnapThaliPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Suspense>
  )
}

export default App
