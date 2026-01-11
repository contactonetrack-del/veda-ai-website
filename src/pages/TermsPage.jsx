/**
 * Terms of Service Page - VEDA AI
 */

import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LegalPage.css';

function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <header className="legal-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <FileText size={20} className="header-icon" />
                <h1>Terms of Service</h1>
            </header>

            <main className="legal-content">
                <p className="last-updated">Last updated: January 2026</p>

                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using VEDA AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
                </section>

                <section>
                    <h2>2. Description of Service</h2>
                    <p>VEDA AI is an AI-powered wellness assistant that provides:</p>
                    <ul>
                        <li>Health and fitness guidance</li>
                        <li>Yoga and meditation recommendations</li>
                        <li>Diet and nutrition advice</li>
                        <li>Insurance information</li>
                        <li>General knowledge assistance</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Medical Disclaimer</h2>
                    <p><strong>Important:</strong> VEDA AI is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.</p>
                </section>

                <section>
                    <h2>4. User Responsibilities</h2>
                    <ul>
                        <li>Provide accurate information</li>
                        <li>Use services for lawful purposes only</li>
                        <li>Not attempt to harm or disrupt the service</li>
                        <li>Not share your account credentials</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Intellectual Property</h2>
                    <p>All content, features, and functionality of VEDA AI are owned by us and protected by intellectual property laws.</p>
                </section>

                <section>
                    <h2>6. Limitation of Liability</h2>
                    <p>VEDA AI is provided "as is" without warranties. We are not liable for any damages arising from your use of the service.</p>
                </section>

                <section>
                    <h2>7. Changes to Terms</h2>
                    <p>We may update these terms from time to time. Continued use after changes constitutes acceptance.</p>
                </section>

                <section>
                    <h2>8. Contact</h2>
                    <p>Questions about these terms? Contact us at: <strong>legal@vedaai.app</strong></p>
                </section>
            </main>
        </div>
    );
}

export default TermsPage;
