/**
 * Privacy Policy Page - VEDA AI
 */

import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

function PrivacyPolicyPage() {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <header className="legal-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <Shield size={20} className="header-icon" />
                <h1>Privacy Policy</h1>
            </header>

            <main className="legal-content">
                <p className="last-updated">Last updated: January 2026</p>

                <section>
                    <h2>1. Information We Collect</h2>
                    <p>VEDA AI collects minimal information to provide our services:</p>
                    <ul>
                        <li><strong>Account Information:</strong> Email address and display name when you create an account.</li>
                        <li><strong>Chat Data:</strong> Your conversations are processed locally and not stored on our servers.</li>
                        <li><strong>Voice Data:</strong> Audio is processed in real-time and not retained.</li>
                        <li><strong>Usage Analytics:</strong> Anonymous usage statistics to improve the service.</li>
                    </ul>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <ul>
                        <li>Provide personalized AI responses</li>
                        <li>Improve our services and features</li>
                        <li>Send important service updates</li>
                        <li>Ensure platform security</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Data Security</h2>
                    <p>We implement industry-standard security measures:</p>
                    <ul>
                        <li>End-to-end encryption for data transmission</li>
                        <li>Local AI processing when possible</li>
                        <li>Regular security audits</li>
                        <li>Secure cloud infrastructure (Firebase)</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Third-Party Services</h2>
                    <p>We use the following third-party services:</p>
                    <ul>
                        <li><strong>Firebase:</strong> Authentication and analytics</li>
                        <li><strong>Render:</strong> Backend hosting</li>
                        <li><strong>Hugging Face:</strong> AI model hosting</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal data</li>
                        <li>Request data deletion</li>
                        <li>Export your data</li>
                        <li>Opt-out of analytics</li>
                    </ul>
                </section>

                <section>
                    <h2>6. Contact Us</h2>
                    <p>For privacy concerns, contact us at: <strong>privacy@vedaai.app</strong></p>
                </section>
            </main>
        </div>
    );
}

export default PrivacyPolicyPage;
