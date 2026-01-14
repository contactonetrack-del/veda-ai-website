"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Calculator, Scale, Activity, Shield, Apple, TrendingUp,
    Flame, Target, Droplets, User, Zap, Heart, Lightbulb, Camera
} from 'lucide-react';
import {
    calculateBMI, getBMICategory, calculateBMR, calculateTDEE,
    calculateIdealWeight, calculateWaterIntake, calculateProteinNeeds,
    ActivityLevel, Gender, BMICategory
} from '@/lib/healthCalculations';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little/no exercise' },
    { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 'very_active', label: 'Very Active', desc: 'Physical job + intense exercise' },
];

const GOALS = [
    { value: -500, label: 'Lose Weight', desc: '-0.5 kg/week', color: '#3B82F6' },
    { value: 0, label: 'Maintain', desc: 'Stay same weight', color: '#10B981' },
    { value: 500, label: 'Gain Weight', desc: '+0.5 kg/week', color: '#F59E0B' },
];

interface Results {
    bmi: string;
    bmiCategory: BMICategory;
    bmr: number;
    tdee: number;
    targetCalories: number;
    idealWeightMin: number;
    idealWeightMax: number;
    waterIntake: number;
    proteinMin: number;
    proteinMax: number;
}

export default function ToolsPage() {
    const router = useRouter();

    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender>('male');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
    const [goal, setGoal] = useState(0);
    const [results, setResults] = useState<Results | null>(null);

    const calculateAll = () => {
        if (!height || !weight || !age) return;

        const weightKg = parseFloat(weight);
        const heightCm = parseFloat(height);
        const ageYears = parseInt(age);

        const bmi = calculateBMI(weightKg, heightCm);
        const bmiInfo = getBMICategory(bmi);
        const bmr = calculateBMR(weightKg, heightCm, ageYears, gender);
        const tdee = calculateTDEE(bmr, activityLevel);
        const targetCalories = tdee + goal;
        const idealWeight = calculateIdealWeight(heightCm);
        const waterIntake = calculateWaterIntake(weightKg);
        const proteinRange = {
            min: calculateProteinNeeds(weightKg, 'sedentary'),
            max: calculateProteinNeeds(weightKg, 'very_active')
        };

        const adviceMap: Record<string, string> = {
            'Underweight': 'Consider increasing calorie intake with nutritious foods like ghee, paneer, and nuts.',
            'Normal': 'Excellent! Maintain your weight with balanced meals and regular exercise.',
            'Overweight': 'Reduce fried foods, increase fiber intake. Try walking and yoga daily.',
            'Obese': 'Consult a doctor. Switch to whole grains, reduce sugar, and start light exercise.'
        };
        bmiInfo.advice = adviceMap[bmiInfo.category] || 'Maintain a balanced diet.';

        setResults({
            bmi: bmi.toFixed(1),
            bmiCategory: bmiInfo,
            bmr,
            tdee,
            targetCalories,
            idealWeightMin: idealWeight.min,
            idealWeightMax: idealWeight.max,
            waterIntake,
            proteinMin: proteinRange.min,
            proteinMax: proteinRange.max,
        });
    };

    const resetAll = () => {
        setHeight('');
        setWeight('');
        setAge('');
        setGender('male');
        setActivityLevel('moderate');
        setGoal(0);
        setResults(null);
    };

    const getPersonalizedTips = () => {
        if (!results) return [];
        const tips = [];
        const bmiVal = parseFloat(results.bmi);

        if (bmiVal < 18.5) {
            tips.push({ icon: '🥜', text: 'Add healthy fats: ghee, almonds, avocados daily' });
            tips.push({ icon: '🍳', text: 'Include protein-rich foods: eggs, paneer, legumes' });
        } else if (bmiVal > 25) {
            tips.push({ icon: '🥗', text: 'Fill half your plate with vegetables before grains' });
            tips.push({ icon: '🚶', text: 'Start with 10,000 steps/day and morning yoga' });
        }

        tips.push({ icon: '💧', text: `Drink ${results.waterIntake}L water daily (${Math.round(results.waterIntake * 4)} glasses)` });
        tips.push({ icon: '🥛', text: `Aim for ${results.proteinMin}-${results.proteinMax}g protein daily` });
        tips.push({ icon: '⏰', text: 'Eat dinner by 7 PM for better digestion and sleep' });
        tips.push({ icon: '🧘', text: 'Practice 15-20 mins of breathing exercises daily' });

        return tips;
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-900 text-white">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/chat')} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Health Tools</h1>
                </header>

                <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                    {/* Tools Grid */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-emerald-900/30 border-2 border-emerald-500/50 rounded-2xl p-4 text-center">
                            <Calculator size={32} className="mx-auto mb-2 text-emerald-400" />
                            <h3 className="font-bold text-sm">Health Metrics</h3>
                            <p className="text-xs text-slate-400">BMI, BMR, TDEE</p>
                        </div>
                        <div onClick={() => router.push('/calorie-counter')} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                            <Apple size={32} className="mx-auto mb-2 text-orange-400" />
                            <h3 className="font-bold text-sm">Calorie Counter</h3>
                            <p className="text-xs text-slate-400">Track intake</p>
                        </div>
                        <div onClick={() => router.push('/insurance')} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                            <Shield size={32} className="mx-auto mb-2 text-blue-400" />
                            <h3 className="font-bold text-sm">Insurance</h3>
                            <p className="text-xs text-slate-400">Estimator</p>
                        </div>
                        <div onClick={() => router.push('/snap-thali')} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                            <Camera size={32} className="mx-auto mb-2 text-purple-400" />
                            <h3 className="font-bold text-sm">Snap Thali</h3>
                            <p className="text-xs text-slate-400">AI Analyzer</p>
                        </div>
                    </section>

                    {/* Calculator */}
                    <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                            <Scale size={24} className="text-emerald-400" />
                            <h2 className="text-lg font-bold">Health Metrics Calculator</h2>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Height (cm)</label>
                                <input type="number" placeholder="e.g., 170" value={height} onChange={(e) => setHeight(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                                <input type="number" placeholder="e.g., 70" value={weight} onChange={(e) => setWeight(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Age (years)</label>
                                <input type="number" placeholder="e.g., 25" value={age} onChange={(e) => setAge(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Gender</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setGender('male')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${gender === 'male' ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}>
                                        <User size={16} /> Male
                                    </button>
                                    <button onClick={() => setGender('female')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors ${gender === 'female' ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}>
                                        <User size={16} /> Female
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Activity Level */}
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">Activity Level</label>
                            <div className="flex flex-wrap gap-2">
                                {ACTIVITY_LEVELS.map((level) => (
                                    <button key={level.value} onClick={() => setActivityLevel(level.value)} title={level.desc}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activityLevel === level.value ? 'bg-emerald-600' : 'bg-slate-900 border border-slate-700 hover:bg-slate-800'}`}>
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Goal */}
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">Your Goal</label>
                            <div className="grid grid-cols-3 gap-3">
                                {GOALS.map((g) => (
                                    <button key={g.value} onClick={() => setGoal(g.value)}
                                        className={`p-3 rounded-xl text-center transition-all ${goal === g.value ? 'ring-2' : 'bg-slate-900 border border-slate-700'}`}
                                        style={{ borderColor: goal === g.value ? g.color : undefined, boxShadow: goal === g.value ? `0 0 15px ${g.color}40` : undefined }}>
                                        <div className="font-bold text-sm">{g.label}</div>
                                        <div className="text-xs text-slate-400">{g.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button onClick={calculateAll} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-bold transition-colors">
                                <Zap size={20} /> Calculate All Metrics
                            </button>
                            <button onClick={resetAll} className="px-6 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-colors">
                                Reset
                            </button>
                        </div>

                        {/* Results */}
                        {results && (
                            <div className="space-y-6 pt-6 border-t border-slate-700">
                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                    <Activity size={20} className="text-emerald-400" /> Your Health Metrics
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-900/50 rounded-xl p-4 text-center border-l-4" style={{ borderColor: results.bmiCategory.color }}>
                                        <Scale size={24} className="mx-auto mb-2 text-slate-400" />
                                        <div className="text-2xl font-bold">{results.bmi}</div>
                                        <div className="text-xs text-slate-400">BMI</div>
                                        <div className="text-xs font-medium mt-1" style={{ color: results.bmiCategory.color }}>{results.bmiCategory.label}</div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                                        <Heart size={24} className="mx-auto mb-2 text-red-400" />
                                        <div className="text-2xl font-bold">{results.bmr}</div>
                                        <div className="text-xs text-slate-400">BMR kcal/day</div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                                        <Flame size={24} className="mx-auto mb-2 text-orange-400" />
                                        <div className="text-2xl font-bold">{results.tdee}</div>
                                        <div className="text-xs text-slate-400">TDEE kcal/day</div>
                                    </div>
                                    <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 text-center">
                                        <Target size={24} className="mx-auto mb-2 text-emerald-400" />
                                        <div className="text-2xl font-bold text-emerald-400">{results.targetCalories}</div>
                                        <div className="text-xs text-slate-400">Target kcal</div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-slate-400"><Target size={16} /> Ideal Weight</span>
                                        <span className="font-medium">{results.idealWeightMin} - {results.idealWeightMax} kg</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-slate-400"><Droplets size={16} /> Daily Water</span>
                                        <span className="font-medium">{results.waterIntake} L ({Math.round(results.waterIntake * 4)} glasses)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-slate-400"><Zap size={16} /> Daily Protein</span>
                                        <span className="font-medium">{results.proteinMin} - {results.proteinMax} g</span>
                                    </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 font-bold mb-3"><Lightbulb size={18} className="text-yellow-400" /> Personalized Tips</h4>
                                    <ul className="space-y-2">
                                        {getPersonalizedTips().map((tip, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm">
                                                <span className="text-lg">{tip.icon}</span>
                                                <span className="text-slate-300">{tip.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Advice */}
                                <div className="p-4 rounded-xl border-l-4" style={{ borderColor: results.bmiCategory.color, backgroundColor: `${results.bmiCategory.color}10` }}>
                                    <p className="text-sm">{results.bmiCategory.advice}</p>
                                </div>
                            </div>
                        )}

                        {/* BMI Scale */}
                        <div className="grid grid-cols-4 gap-1 rounded-xl overflow-hidden text-center text-xs">
                            <div className="bg-blue-500/30 py-2"><span className="font-bold">Underweight</span><br />&lt;18.5</div>
                            <div className="bg-emerald-500/30 py-2"><span className="font-bold">Normal</span><br />18.5-24.9</div>
                            <div className="bg-yellow-500/30 py-2"><span className="font-bold">Overweight</span><br />25-29.9</div>
                            <div className="bg-red-500/30 py-2"><span className="font-bold">Obese</span><br />&gt;30</div>
                        </div>
                    </section>

                    {/* Info Section */}
                    <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                        <h3 className="flex items-center gap-2 font-bold mb-4"><TrendingUp size={20} className="text-emerald-400" /> Understanding Your Metrics</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li><strong>BMI</strong> - Body Mass Index measures body fat based on height/weight</li>
                            <li><strong>BMR</strong> - Basal Metabolic Rate, calories burned at complete rest</li>
                            <li><strong>TDEE</strong> - Total Daily Energy Expenditure, your daily calorie burn</li>
                            <li><strong>Target</strong> - Adjusted calories based on your weight goal</li>
                        </ul>
                    </section>
                </main>
            </div>
        </ProtectedRoute>
    );
}
