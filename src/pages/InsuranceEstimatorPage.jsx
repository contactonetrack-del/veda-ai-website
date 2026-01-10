/**
 * Health Protection Page (formerly Insurance Estimator)
 * Calculate health insurance premiums for Indian users
 * Deep focus on health insurance knowledge and IRDAI compliance
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Shield,
    User,
    Users,
    Heart,
    Calculator,
    Check,
    IndianRupee,
    Info,
    AlertCircle,
    Stethoscope,
    Building2,
    FileCheck
} from 'lucide-react';
import './InsuranceEstimatorPage.css';

// Coverage options with detailed benefits
const COVERAGE_OPTIONS = {
    basic: {
        name: 'Essential',
        amount: '₹3 Lakh',
        value: 300000,
        multiplier: 1.0,
        color: '#3B82F6',
        benefits: ['Hospitalization', 'Day Care', 'Pre-hospitalization (30 days)']
    },
    standard: {
        name: 'Comprehensive',
        amount: '₹5 Lakh',
        value: 500000,
        multiplier: 1.5,
        color: '#10B981',
        benefits: ['All Essential +', 'Maternity Cover', 'OPD Benefits', 'No-Claim Bonus']
    },
    premium: {
        name: 'Supreme',
        amount: '₹10 Lakh',
        value: 1000000,
        multiplier: 2.2,
        color: '#F59E0B',
        benefits: ['All Comprehensive +', 'Air Ambulance', 'Worldwide Cover', 'Restore Benefit', 'Annual Health Checkup']
    },
};

// Base premium rates per age group (annual, per lakh coverage)
const AGE_RATES = {
    '18-25': 120,
    '26-35': 180,
    '36-45': 280,
    '46-55': 450,
    '56-65': 700,
    '66+': 1100,
};

// Key health insurance terms
const INSURANCE_TERMS = [
    { term: 'Sum Insured', desc: 'Maximum amount insurer will pay for treatment in a policy year' },
    { term: 'Cashless Treatment', desc: 'Direct payment to network hospital, no out-of-pocket expense' },
    { term: 'Waiting Period', desc: 'Time before certain illnesses are covered (usually 2-4 years for pre-existing)' },
    { term: 'Co-payment', desc: 'Percentage of claim amount you pay from your pocket (usually 10-20%)' },
    { term: 'TPA', desc: 'Third Party Administrator - processes claims between you and insurer' },
    { term: 'Network Hospital', desc: 'Hospitals where cashless treatment is available' },
];

function InsuranceEstimatorPage() {
    const navigate = useNavigate();

    // State
    const [age, setAge] = useState('');
    const [coverage, setCoverage] = useState('standard');
    const [familySize, setFamilySize] = useState(1);
    const [hasPreExisting, setHasPreExisting] = useState(false);
    const [result, setResult] = useState(null);
    const [showTerms, setShowTerms] = useState(false);

    // Get age bracket
    const getAgeBracket = (ageNum) => {
        if (ageNum <= 25) return '18-25';
        if (ageNum <= 35) return '26-35';
        if (ageNum <= 45) return '36-45';
        if (ageNum <= 55) return '46-55';
        if (ageNum <= 65) return '56-65';
        return '66+';
    };

    // Calculate premium
    const calculatePremium = () => {
        if (!age) return;

        const ageNum = parseInt(age);
        const bracket = getAgeBracket(ageNum);
        const baseRate = AGE_RATES[bracket];
        const coverageOption = COVERAGE_OPTIONS[coverage];
        const lakhs = coverageOption.value / 100000;

        // Base annual premium
        let annual = baseRate * lakhs * coverageOption.multiplier;

        // Family multiplier (each additional member adds 60% of base)
        annual = annual * (1 + (familySize - 1) * 0.6);

        // Pre-existing condition loading (15% extra)
        if (hasPreExisting) {
            annual = annual * 1.15;
        }

        // Round to nearest 100
        annual = Math.round(annual / 100) * 100;

        const monthly = Math.round(annual / 12);
        const savings = Math.round(annual * 0.08); // 8% annual discount

        setResult({
            monthly,
            yearly: annual,
            savings,
            coverageAmount: coverageOption.amount,
            coverageColor: coverageOption.color,
            benefits: coverageOption.benefits,
        });
    };

    return (
        <div className="insurance-page">
            <header className="insurance-header glass">
                <button className="back-btn" onClick={() => navigate('/tools')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Health Protection</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="insurance-content">
                {/* LEFT COLUMN: Main Calculator & Info */}
                <div className="insurance-main-column">
                    {/* Info Card */}
                    <section className="info-card glass">
                        <Shield size={32} className="info-icon" />
                        <div className="info-text">
                            <h2>Health Protection Calculator</h2>
                            <p>Estimate premiums for IRDAI-registered insurers like <strong>Star Health, Care Health, ICICI Lombard, HDFC Ergo</strong>. Get the right coverage for your family.</p>
                        </div>
                    </section>

                    {/* Key Stats */}
                    <section className="stats-row">
                        <div className="stat-item glass">
                            <Stethoscope size={20} />
                            <div>
                                <span className="stat-value">4000+</span>
                                <span className="stat-label">Network Hospitals</span>
                            </div>
                        </div>
                        <div className="stat-item glass">
                            <Building2 size={20} />
                            <div>
                                <span className="stat-value">30+</span>
                                <span className="stat-label">IRDAI Insurers</span>
                            </div>
                        </div>
                        <div className="stat-item glass">
                            <FileCheck size={20} />
                            <div>
                                <span className="stat-value">98%</span>
                                <span className="stat-label">Claim Ratio</span>
                            </div>
                        </div>
                    </section>

                    {/* Calculator Form */}
                    <section className="calculator-form glass">
                        {/* Age Input */}
                        <div className="form-group">
                            <label>
                                <User size={18} />
                                Eldest Member's Age
                            </label>
                            <input
                                type="number"
                                placeholder="e.g., 35"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                min="18"
                                max="80"
                            />
                            <span className="input-hint">Premium is based on the oldest person covered</span>
                        </div>

                        {/* Family Size */}
                        <div className="form-group">
                            <label>
                                <Users size={18} />
                                Family Members to Cover
                            </label>
                            <div className="stepper">
                                <button
                                    onClick={() => setFamilySize(Math.max(1, familySize - 1))}
                                    disabled={familySize <= 1}
                                >
                                    -
                                </button>
                                <span>{familySize}</span>
                                <button onClick={() => setFamilySize(Math.min(6, familySize + 1))}>
                                    +
                                </button>
                            </div>
                            <span className="input-hint">Self, spouse, children, parents</span>
                        </div>

                        {/* Pre-existing Condition Toggle */}
                        <div className="form-group toggle-group">
                            <label>
                                <AlertCircle size={18} />
                                Any Pre-existing Conditions?
                            </label>
                            <div className="toggle-switch">
                                <button
                                    className={!hasPreExisting ? 'active' : ''}
                                    onClick={() => setHasPreExisting(false)}
                                >
                                    No
                                </button>
                                <button
                                    className={hasPreExisting ? 'active' : ''}
                                    onClick={() => setHasPreExisting(true)}
                                >
                                    Yes
                                </button>
                            </div>
                            <span className="input-hint">Diabetes, BP, heart conditions, etc.</span>
                        </div>

                        {/* Coverage Options */}
                        <div className="form-group">
                            <label>
                                <Heart size={18} />
                                Sum Insured (Coverage Amount)
                            </label>
                            <div className="coverage-options">
                                {Object.entries(COVERAGE_OPTIONS).map(([key, option]) => (
                                    <button
                                        key={key}
                                        className={`coverage-option ${coverage === key ? 'active' : ''}`}
                                        onClick={() => setCoverage(key)}
                                        style={{
                                            borderColor: coverage === key ? option.color : 'transparent',
                                            background: coverage === key ? `${option.color}20` : 'rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <span className="coverage-name">{option.name}</span>
                                        <span className="coverage-amount" style={{ color: option.color }}>{option.amount}</span>
                                        {coverage === key && <Check size={16} className="check" style={{ color: option.color }} />}
                                    </button>
                                ))}
                            </div>

                            {/* Show selected plan benefits */}
                            <div className="plan-benefits">
                                <strong>Includes:</strong>
                                <ul>
                                    {COVERAGE_OPTIONS[coverage].benefits.map((benefit, i) => (
                                        <li key={i}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <button className="calculate-btn" onClick={calculatePremium}>
                            <Calculator size={20} />
                            Calculate Health Protection Premium
                        </button>
                    </section>
                </div>

                {/* RIGHT COLUMN: Results & Education */}
                <div className="insurance-sidebar-column">
                    {/* Results */}
                    {result ? (
                        <section className="results-card glass" style={{ borderColor: result.coverageColor }}>
                            <div className="result-header">
                                <h3>Estimated Premium</h3>
                                <div className="result-badge">
                                    {COVERAGE_OPTIONS[coverage].name} Plan
                                </div>
                            </div>

                            <div className="premium-display">
                                <div className="premium-main">
                                    <IndianRupee size={28} />
                                    <span className="amount">{result.yearly.toLocaleString('en-IN')}</span>
                                    <span className="period">/year</span>
                                </div>
                                <div className="premium-monthly">
                                    (approx. ₹{result.monthly.toLocaleString('en-IN')}/month)
                                </div>
                            </div>

                            <div className="result-details">
                                <div className="detail-row">
                                    <span>Detailed Coverage</span>
                                    <span style={{ color: result.coverageColor, fontWeight: 'bold' }}>{result.coverageAmount}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Family Size</span>
                                    <span>{familySize} {familySize > 1 ? 'persons' : 'person'}</span>
                                </div>
                                <div className="detail-row savings">
                                    <span>Annual Savings</span>
                                    <span className="save-amount">₹{result.savings.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="result-benefits">
                                <strong>Plan Highlights:</strong>
                                <div className="benefits-grid">
                                    {result.benefits.map((benefit, i) => (
                                        <span key={i} className="benefit-tag">{benefit}</span>
                                    ))}
                                </div>
                            </div>

                            <p className="disclaimer">
                                * Indicative only. Actual premium depends on medical history & city.
                            </p>
                        </section>
                    ) : (
                        <section className="placeholder-card glass">
                            <Calculator size={48} className="placeholder-icon" />
                            <h3>Calculate Your Premium</h3>
                            <p>Enter your details to see a personalized health protection estimate.</p>
                        </section>
                    )}

                    {/* Tips */}
                    <section className="tips-card glass">
                        <h3>🛡️ Smart Tips</h3>
                        <ul>
                            <li><strong>Buy early</strong> - 50% cheaper before 30</li>
                            <li><strong>Family Floater</strong> - Best value for families</li>
                            <li><strong>Check Limits</strong> - Look for room rent capping</li>
                            <li><strong>No-Claim Bonus</strong> - Don't claim for small ills</li>
                        </ul>
                    </section>

                    {/* Insurance Terms */}
                    <section className="terms-section glass">
                        <button className="terms-toggle" onClick={() => setShowTerms(!showTerms)}>
                            <Info size={18} />
                            <span>Insurance Terms</span>
                            <span className={`arrow ${showTerms ? 'open' : ''}`}>▼</span>
                        </button>

                        {showTerms && (
                            <div className="terms-content">
                                {INSURANCE_TERMS.slice(0, 4).map((item, i) => (
                                    <div key={i} className="term-item">
                                        <span className="term-name">{item.term}</span>
                                        <span className="term-desc">{item.desc}</span>
                                    </div>
                                ))}
                                <div className="term-more">...and more in policy document</div>
                            </div>
                        )}
                    </section>

                    {/* IRDAI Notice */}
                    <section className="irdai-notice-sidebar">
                        <p>Regulated by <strong>IRDAI</strong>. Verify at irdai.gov.in</p>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default InsuranceEstimatorPage;
