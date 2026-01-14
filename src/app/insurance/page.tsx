"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Shield, User, Users, Heart, Calculator, Check,
    Info, AlertCircle, Stethoscope, Building2, FileCheck
} from 'lucide-react';
import { calculatePremium } from '@/lib/insuranceCalculations';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface CoverageOption {
    name: string;
    amount: string;
    value: string;
    color: string;
    benefits: string[];
}

const COVERAGE_OPTIONS: Record<string, CoverageOption> = {
    basic: {
        name: 'Essential',
        amount: '₹3 Lakh',
        value: '300000',
        color: '#3B82F6',
        benefits: ['Hospitalization', 'Day Care', 'Pre-hospitalization (30 days)']
    },
    standard: {
        name: 'Comprehensive',
        amount: '₹5 Lakh',
        value: '500000',
        color: '#10B981',
        benefits: ['All Essential +', 'Maternity Cover', 'OPD Benefits', 'No-Claim Bonus']
    },
    premium: {
        name: 'Supreme',
        amount: '₹10 Lakh',
        value: '1000000',
        color: '#F59E0B',
        benefits: ['All Comprehensive +', 'Air Ambulance', 'Worldwide Cover', 'Restore Benefit', 'Annual Health Checkup']
    },
};

const INSURANCE_TERMS = [
    { term: 'Sum Insured', desc: 'Maximum amount insurer will pay for treatment in a policy year' },
    { term: 'Cashless Treatment', desc: 'Direct payment to network hospital, no out-of-pocket expense' },
    { term: 'Waiting Period', desc: 'Time before certain illnesses are covered (usually 2-4 years for pre-existing)' },
    { term: 'Co-payment', desc: 'Percentage of claim amount you pay from your pocket (usually 10-20%)' },
];

interface Result {
    monthly: number;
    yearly: number;
    savings: number;
    coverageAmount: string;
    coverageColor: string;
    benefits: string[];
}

export default function InsuranceEstimatorPage() {
    const router = useRouter();

    const [age, setAge] = useState('');
    const [coverage, setCoverage] = useState('standard');
    const [familySize, setFamilySize] = useState(1);
    const [hasPreExisting, setHasPreExisting] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [showTerms, setShowTerms] = useState(false);

    const handleCalculate = () => {
        if (!age) return;
        const ageNum = parseInt(age);
        const coverageOption = COVERAGE_OPTIONS[coverage];

        const annualPremium = calculatePremium({
            age: ageNum,
            coverage: coverageOption.value,
            members: familySize,
            hasPreExisting,
            zone: 'Zone 1'
        });

        setResult({
            monthly: Math.round(annualPremium / 12),
            yearly: annualPremium,
            savings: Math.round(annualPremium * 0.08),
            coverageAmount: coverageOption.amount,
            coverageColor: coverageOption.color,
            benefits: coverageOption.benefits,
        });
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-900 text-white">
                <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/tools')} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Health Protection</h1>
                </header>

                <main className="max-w-6xl mx-auto p-4 md:p-6 grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <section className="bg-gradient-to-br from-blue-900/30 to-slate-800/50 border border-blue-800/30 rounded-2xl p-6 flex items-start gap-4">
                            <Shield size={40} className="text-blue-400 flex-shrink-0" />
                            <div>
                                <h2 className="font-bold text-lg">Health Protection Calculator</h2>
                                <p className="text-sm text-slate-400">Estimate premiums for IRDAI-registered insurers like <strong className="text-white">Star Health, ICICI Lombard, HDFC Ergo</strong>.</p>
                            </div>
                        </section>

                        <section className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <Stethoscope size={24} className="mx-auto mb-2 text-emerald-400" />
                                <div className="font-bold">4000+</div>
                                <div className="text-xs text-slate-400">Network Hospitals</div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <Building2 size={24} className="mx-auto mb-2 text-blue-400" />
                                <div className="font-bold">30+</div>
                                <div className="text-xs text-slate-400">IRDAI Insurers</div>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <FileCheck size={24} className="mx-auto mb-2 text-purple-400" />
                                <div className="font-bold">98%</div>
                                <div className="text-xs text-slate-400">Claim Ratio</div>
                            </div>
                        </section>

                        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-5">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2"><User size={16} /> Eldest Member's Age</label>
                                <input type="number" placeholder="e.g., 35" value={age} onChange={(e) => setAge(e.target.value)} min={18} max={80}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                <p className="text-xs text-slate-500 mt-1">Premium is based on the oldest person covered</p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2"><Users size={16} /> Family Members</label>
                                <div className="flex items-center gap-4 bg-slate-900 rounded-xl p-2 w-fit">
                                    <button onClick={() => setFamilySize(Math.max(1, familySize - 1))} disabled={familySize <= 1}
                                        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 font-bold">-</button>
                                    <span className="text-xl font-bold w-8 text-center">{familySize}</span>
                                    <button onClick={() => setFamilySize(Math.min(6, familySize + 1))}
                                        className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold">+</button>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2"><AlertCircle size={16} /> Pre-existing Conditions?</label>
                                <div className="flex gap-3">
                                    <button onClick={() => setHasPreExisting(false)}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${!hasPreExisting ? 'bg-emerald-600' : 'bg-slate-900 border border-slate-700'}`}>No</button>
                                    <button onClick={() => setHasPreExisting(true)}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${hasPreExisting ? 'bg-amber-600' : 'bg-slate-900 border border-slate-700'}`}>Yes</button>
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium mb-2"><Heart size={16} /> Coverage Amount</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(COVERAGE_OPTIONS).map(([key, option]) => (
                                        <button key={key} onClick={() => setCoverage(key)}
                                            className={`p-4 rounded-xl text-center transition-all border-2 ${coverage === key ? 'ring-2' : 'border-transparent bg-slate-900'}`}
                                            style={{ borderColor: coverage === key ? option.color : 'transparent', background: coverage === key ? `${option.color}20` : undefined }}>
                                            <div className="font-bold text-sm">{option.name}</div>
                                            <div className="text-lg font-bold" style={{ color: option.color }}>{option.amount}</div>
                                            {coverage === key && <Check size={16} className="mx-auto mt-1" style={{ color: option.color }} />}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-3 p-3 bg-slate-900/50 rounded-xl">
                                    <strong className="text-xs text-slate-400">Includes:</strong>
                                    <ul className="text-xs text-slate-300 mt-1 space-y-1">
                                        {COVERAGE_OPTIONS[coverage].benefits.map((b, i) => <li key={i}>• {b}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <button onClick={handleCalculate}
                                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold transition-colors">
                                <Calculator size={20} /> Calculate Premium
                            </button>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {result ? (
                            <section className="bg-gradient-to-br from-emerald-900/30 to-slate-800/50 border-2 rounded-2xl p-6" style={{ borderColor: result.coverageColor }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">Estimated Premium</h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${result.coverageColor}30`, color: result.coverageColor }}>{COVERAGE_OPTIONS[coverage].name}</span>
                                </div>
                                <div className="text-center py-4">
                                    <div className="text-4xl font-bold">₹{result.yearly.toLocaleString('en-IN')}<span className="text-base text-slate-400 font-normal">/year</span></div>
                                    <div className="text-slate-400">≈ ₹{result.monthly.toLocaleString('en-IN')}/month</div>
                                </div>
                                <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
                                    <div className="flex justify-between"><span>Coverage</span><span className="font-bold" style={{ color: result.coverageColor }}>{result.coverageAmount}</span></div>
                                    <div className="flex justify-between"><span>Family Size</span><span>{familySize} {familySize > 1 ? 'persons' : 'person'}</span></div>
                                    <div className="flex justify-between text-emerald-400"><span>Annual Savings</span><span className="font-bold">₹{result.savings.toLocaleString('en-IN')}</span></div>
                                </div>
                                <div className="mt-4 p-3 bg-slate-900/50 rounded-xl">
                                    <strong className="text-xs text-slate-400">Highlights:</strong>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {result.benefits.map((b, i) => <span key={i} className="px-2 py-1 bg-slate-800 rounded text-xs">{b}</span>)}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-4 text-center">* Indicative only. Actual premium depends on medical history & city.</p>
                            </section>
                        ) : (
                            <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                                <Calculator size={48} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="font-bold text-lg">Calculate Your Premium</h3>
                                <p className="text-sm text-slate-400">Enter your details to see a personalized estimate.</p>
                            </section>
                        )}

                        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
                            <h3 className="font-bold mb-3">🛡️ Smart Tips</h3>
                            <ul className="space-y-2 text-sm">
                                <li><strong>Buy early</strong> - 50% cheaper before 30</li>
                                <li><strong>Family Floater</strong> - Best value for families</li>
                                <li><strong>Check Limits</strong> - Look for room rent capping</li>
                                <li><strong>No-Claim Bonus</strong> - Don't claim for small ills</li>
                            </ul>
                        </section>

                        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                            <button onClick={() => setShowTerms(!showTerms)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors">
                                <span className="flex items-center gap-2 font-medium"><Info size={16} /> Insurance Terms</span>
                                <span className={`transition-transform ${showTerms ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {showTerms && (
                                <div className="p-4 pt-0 space-y-3 border-t border-slate-700">
                                    {INSURANCE_TERMS.map((item, i) => (
                                        <div key={i}>
                                            <div className="font-medium text-sm">{item.term}</div>
                                            <div className="text-xs text-slate-400">{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <p className="text-center text-xs text-slate-500">Regulated by <strong>IRDAI</strong>. Verify at irdai.gov.in</p>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
