/**
 * Tools Page - Comprehensive Health Metrics Calculator
 * Features: BMI, BMR, TDEE, Target Calories, Ideal Weight, Personalized Tips
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calculator,
    Scale,
    Activity,
    Shield,
    Apple,
    TrendingUp,
    Flame,
    Target,
    Droplets,
    User,
    Zap,
    Heart,
    Lightbulb
} from 'lucide-react';
import './ToolsPage.css';

// BMI Categories
const BMI_CATEGORIES = [
    { min: 0, max: 18.5, label: 'Underweight', color: '#3B82F6', advice: 'Consider increasing calorie intake with nutritious Indian foods like ghee, paneer, and nuts.' },
    { min: 18.5, max: 24.9, label: 'Normal', color: '#10B981', advice: 'Excellent! Maintain your weight with balanced dal-chawal, sabzi, and regular yoga.' },
    { min: 25, max: 29.9, label: 'Overweight', color: '#F59E0B', advice: 'Reduce fried foods, increase fiber intake. Try walking and Surya Namaskar daily.' },
    { min: 30, max: 100, label: 'Obese', color: '#EF4444', advice: 'Consult a doctor. Switch to millets, reduce sugar, and start with light exercise.' },
];

// Activity Level Multipliers for TDEE
const ACTIVITY_LEVELS = [
    { value: 1.2, label: 'Sedentary', desc: 'Desk job, little/no exercise' },
    { value: 1.375, label: 'Light', desc: 'Light exercise 1-3 days/week' },
    { value: 1.55, label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
    { value: 1.725, label: 'Active', desc: 'Hard exercise 6-7 days/week' },
    { value: 1.9, label: 'Very Active', desc: 'Physical job + intense exercise' },
];

// Goal Options
const GOALS = [
    { value: -500, label: 'Lose Weight', desc: '-0.5 kg/week', color: '#3B82F6' },
    { value: 0, label: 'Maintain', desc: 'Stay same weight', color: '#10B981' },
    { value: 500, label: 'Gain Weight', desc: '+0.5 kg/week', color: '#F59E0B' },
];

function ToolsPage() {
    const navigate = useNavigate();

    // User Inputs
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [activityLevel, setActivityLevel] = useState(1.55);
    const [goal, setGoal] = useState(0);

    // Results
    const [results, setResults] = useState(null);

    const calculateAll = () => {
        if (!height || !weight || !age) return;

        const heightM = parseFloat(height) / 100;
        const weightKg = parseFloat(weight);
        const ageYears = parseInt(age);

        // BMI Calculation
        const bmi = weightKg / (heightM * heightM);
        const bmiCategory = BMI_CATEGORIES.find(cat => bmi >= cat.min && bmi < cat.max);

        // BMR Calculation (Mifflin-St Jeor Equation)
        let bmr;
        if (gender === 'male') {
            bmr = (10 * weightKg) + (6.25 * parseFloat(height)) - (5 * ageYears) + 5;
        } else {
            bmr = (10 * weightKg) + (6.25 * parseFloat(height)) - (5 * ageYears) - 161;
        }

        // TDEE Calculation
        const tdee = bmr * activityLevel;

        // Target Calories
        const targetCalories = tdee + goal;

        // Ideal Weight Range (BMI 18.5 - 24.9)
        const idealWeightMin = 18.5 * heightM * heightM;
        const idealWeightMax = 24.9 * heightM * heightM;

        // Water Intake (30-35ml per kg)
        const waterIntake = weightKg * 0.033; // liters

        // Protein Needs (0.8-1g per kg for sedentary, 1.2-1.7g for active)
        const proteinMin = weightKg * 0.8;
        const proteinMax = weightKg * 1.2;

        setResults({
            bmi: bmi.toFixed(1),
            bmiCategory,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories: Math.round(targetCalories),
            idealWeightMin: idealWeightMin.toFixed(1),
            idealWeightMax: idealWeightMax.toFixed(1),
            waterIntake: waterIntake.toFixed(1),
            proteinMin: Math.round(proteinMin),
            proteinMax: Math.round(proteinMax),
        });
    };

    const resetAll = () => {
        setHeight('');
        setWeight('');
        setAge('');
        setGender('male');
        setActivityLevel(1.55);
        setGoal(0);
        setResults(null);
    };

    // Get personalized tips based on results
    const getPersonalizedTips = () => {
        if (!results) return [];
        const tips = [];

        if (results.bmi < 18.5) {
            tips.push({ icon: '🥜', text: 'Add healthy fats: ghee in dal, handful of almonds daily' });
            tips.push({ icon: '🍳', text: 'Include protein-rich foods: paneer, eggs, legumes with every meal' });
        } else if (results.bmi > 25) {
            tips.push({ icon: '🥗', text: 'Fill half your plate with vegetables (sabzi) before rice/roti' });
            tips.push({ icon: '🚶', text: 'Start with 10,000 steps/day and morning Surya Namaskar' });
        }

        tips.push({ icon: '💧', text: `Drink ${results.waterIntake}L water daily (${Math.round(results.waterIntake * 4)} glasses)` });
        tips.push({ icon: '🥛', text: `Aim for ${results.proteinMin}-${results.proteinMax}g protein (dal, paneer, curd)` });
        tips.push({ icon: '⏰', text: 'Eat dinner by 7 PM for better digestion and sleep' });
        tips.push({ icon: '🧘', text: 'Practice 15-20 mins of Pranayama for metabolism boost' });

        return tips;
    };

    return (
        <div className="tools-page">
            <header className="tools-header glass">
                <button className="back-btn" onClick={() => navigate('/chat')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Health Tools</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="tools-content">
                {/* Tools Grid */}
                <section className="tools-grid">
                    <div className="tool-card active glass">
                        <Calculator size={32} className="tool-icon" />
                        <h3>Health Metrics</h3>
                        <p>BMI, BMR, TDEE & more</p>
                    </div>

                    <div className="tool-card glass" onClick={() => navigate('/calorie-counter')}>
                        <Apple size={32} className="tool-icon" />
                        <h3>Calorie Counter</h3>
                        <p>Track daily calories</p>
                    </div>

                    <div className="tool-card glass" onClick={() => navigate('/insurance')}>
                        <Shield size={32} className="tool-icon" />
                        <h3>Health Protection</h3>
                        <p>Insurance estimator</p>
                    </div>

                    <div className="tool-card glass" onClick={() => navigate('/snap-thali')}>
                        <Camera size={32} className="tool-icon" />
                        <h3>Snap Your Thali</h3>
                        <p>AI Calorie Analyzer</p>
                    </div>
                </section>

                {/* Health Metrics Calculator */}
                <section className="bmi-calculator glass">
                    <div className="section-header">
                        <Scale size={24} />
                        <h2>Health Metrics Calculator</h2>
                    </div>

                    {/* Basic Info Row */}
                    <div className="input-row">
                        <div className="input-group">
                            <label>Height (cm)</label>
                            <input
                                type="number"
                                placeholder="e.g., 170"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                placeholder="e.g., 70"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Age & Gender Row */}
                    <div className="input-row">
                        <div className="input-group">
                            <label>Age (years)</label>
                            <input
                                type="number"
                                placeholder="e.g., 25"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Gender</label>
                            <div className="toggle-buttons">
                                <button
                                    className={`toggle-btn ${gender === 'male' ? 'active' : ''}`}
                                    onClick={() => setGender('male')}
                                >
                                    <User size={16} /> Male
                                </button>
                                <button
                                    className={`toggle-btn ${gender === 'female' ? 'active' : ''}`}
                                    onClick={() => setGender('female')}
                                >
                                    <User size={16} /> Female
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Level */}
                    <div className="input-group full-width">
                        <label>Activity Level</label>
                        <div className="activity-selector">
                            {ACTIVITY_LEVELS.map((level) => (
                                <button
                                    key={level.value}
                                    className={`activity-btn ${activityLevel === level.value ? 'active' : ''}`}
                                    onClick={() => setActivityLevel(level.value)}
                                    title={level.desc}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="input-group full-width">
                        <label>Your Goal</label>
                        <div className="goal-selector">
                            {GOALS.map((g) => (
                                <button
                                    key={g.value}
                                    className={`goal-btn ${goal === g.value ? 'active' : ''}`}
                                    onClick={() => setGoal(g.value)}
                                    style={{ '--goal-color': g.color }}
                                >
                                    <span className="goal-label">{g.label}</span>
                                    <span className="goal-desc">{g.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="button-group">
                        <button className="calc-btn primary" onClick={calculateAll}>
                            <Zap size={20} />
                            Calculate All Metrics
                        </button>
                        <button className="calc-btn secondary" onClick={resetAll}>
                            Reset
                        </button>
                    </div>

                    {/* Results Dashboard */}
                    {results && (
                        <div className="results-dashboard">
                            <h3 className="results-title">
                                <Activity size={20} /> Your Health Metrics
                            </h3>

                            <div className="metrics-grid">
                                {/* BMI Card */}
                                <div className="metric-card" style={{ '--card-color': results.bmiCategory.color }}>
                                    <div className="metric-icon"><Scale size={24} /></div>
                                    <div className="metric-value">{results.bmi}</div>
                                    <div className="metric-label">BMI</div>
                                    <div className="metric-status" style={{ color: results.bmiCategory.color }}>
                                        {results.bmiCategory.label}
                                    </div>
                                </div>

                                {/* BMR Card */}
                                <div className="metric-card">
                                    <div className="metric-icon"><Heart size={24} /></div>
                                    <div className="metric-value">{results.bmr}</div>
                                    <div className="metric-label">BMR</div>
                                    <div className="metric-status">kcal/day at rest</div>
                                </div>

                                {/* TDEE Card */}
                                <div className="metric-card">
                                    <div className="metric-icon"><Flame size={24} /></div>
                                    <div className="metric-value">{results.tdee}</div>
                                    <div className="metric-label">TDEE</div>
                                    <div className="metric-status">Total daily burn</div>
                                </div>

                                {/* Target Calories Card */}
                                <div className="metric-card highlight">
                                    <div className="metric-icon"><Target size={24} /></div>
                                    <div className="metric-value">{results.targetCalories}</div>
                                    <div className="metric-label">Target</div>
                                    <div className="metric-status">kcal/day for goal</div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="additional-metrics">
                                <div className="info-row">
                                    <span className="info-label"><Target size={16} /> Ideal Weight Range:</span>
                                    <span className="info-value">{results.idealWeightMin} - {results.idealWeightMax} kg</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label"><Droplets size={16} /> Daily Water Intake:</span>
                                    <span className="info-value">{results.waterIntake} L ({Math.round(results.waterIntake * 4)} glasses)</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label"><Zap size={16} /> Daily Protein Need:</span>
                                    <span className="info-value">{results.proteinMin} - {results.proteinMax} g</span>
                                </div>
                            </div>

                            {/* Personalized Tips */}
                            <div className="personalized-tips">
                                <h4><Lightbulb size={18} /> Personalized Tips for You</h4>
                                <ul>
                                    {getPersonalizedTips().map((tip, idx) => (
                                        <li key={idx}>
                                            <span className="tip-icon">{tip.icon}</span>
                                            <span className="tip-text">{tip.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* BMI Advice */}
                            <div className="bmi-advice" style={{ borderColor: results.bmiCategory.color }}>
                                <p>{results.bmiCategory.advice}</p>
                            </div>
                        </div>
                    )}

                    {/* BMI Scale */}
                    <div className="bmi-scale">
                        <div className="scale-bar">
                            <div className="scale-segment underweight">Underweight<br />&lt;18.5</div>
                            <div className="scale-segment normal">Normal<br />18.5-24.9</div>
                            <div className="scale-segment overweight">Overweight<br />25-29.9</div>
                            <div className="scale-segment obese">Obese<br />&gt;30</div>
                        </div>
                    </div>
                </section>

                {/* Quick Tips (static) */}
                <section className="quick-stats glass">
                    <h3><TrendingUp size={20} /> Understanding Your Metrics</h3>
                    <ul>
                        <li><strong>BMI</strong> - Body Mass Index measures body fat based on height/weight</li>
                        <li><strong>BMR</strong> - Basal Metabolic Rate, calories burned at complete rest</li>
                        <li><strong>TDEE</strong> - Total Daily Energy Expenditure, your daily calorie burn</li>
                        <li><strong>Target</strong> - Adjusted calories based on your weight goal</li>
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default ToolsPage;
