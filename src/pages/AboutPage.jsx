/**
 * About Page - VEDA AI
 * App information and credits
 */

import { ArrowLeft, Github, Globe, Heart, Shield, Cpu, Mic, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="about-page">
            <header className="about-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h1>About VEDA AI</h1>
            </header>

            <main className="about-content">
                {/* App Info Card */}
                <section className="about-card">
                    <div className="app-logo">
                        <div className="logo-icon">🧘</div>
                        <h2>VEDA AI</h2>
                        <p className="version">Version 1.0.0</p>
                    </div>
                    <p className="tagline">
                        Your AI-powered wellness companion for Health, Fitness, Yoga, Diet, and Insurance guidance.
                    </p>
                </section>

                {/* Features */}
                <section className="about-card">
                    <h3>Key Features</h3>
                    <ul className="feature-list">
                        <li>
                            <Languages size={18} />
                            <div>
                                <strong>25 Indian Languages</strong>
                                <span>100% Scheduled Language Coverage</span>
                            </div>
                        </li>
                        <li>
                            <Mic size={18} />
                            <div>
                                <strong>Voice Interface</strong>
                                <span>Speak naturally in your language</span>
                            </div>
                        </li>
                        <li>
                            <Cpu size={18} />
                            <div>
                                <strong>12 Domain Experts</strong>
                                <span>Specialized AI agents for every need</span>
                            </div>
                        </li>
                        <li>
                            <Shield size={18} />
                            <div>
                                <strong>Privacy First</strong>
                                <span>Local AI processing, no data sharing</span>
                            </div>
                        </li>
                    </ul>
                </section>

                {/* Tech Stack */}
                <section className="about-card">
                    <h3>Built With</h3>
                    <div className="tech-grid">
                        <span className="tech-tag">React 19</span>
                        <span className="tech-tag">FastAPI</span>
                        <span className="tech-tag">Whisper ASR</span>
                        <span className="tech-tag">Facebook MMS</span>
                        <span className="tech-tag">DeepSeek-R1</span>
                        <span className="tech-tag">Firebase</span>
                    </div>
                </section>

                {/* Credits */}
                <section className="about-card">
                    <h3>Credits</h3>
                    <div className="credits-info">
                        <p><strong>Company:</strong> One Track</p>
                        <p><strong>Developed by:</strong> Shiney</p>
                        <p style={{ marginTop: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Powered by open-source AI models and community contributions.</p>
                    </div>
                    <div className="links">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <Github size={18} />
                            GitHub
                        </a>
                        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                            <Globe size={18} />
                            Website
                        </a>
                    </div>
                </section>

                {/* Legal Links */}
                <section className="about-card legal">
                    <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
                    <button onClick={() => navigate('/terms')}>Terms of Service</button>
                </section>

                <footer className="about-footer">
                    <p>Made with <Heart size={14} className="heart" /> in India</p>
                    <p>© 2026 VEDA AI. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}

export default AboutPage;
