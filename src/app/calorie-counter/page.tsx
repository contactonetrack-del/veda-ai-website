"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    ArrowLeft, Plus, Search, Flame, Coffee, Sun, Moon, Cookie, Trash2
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface FoodItem {
    id: string;
    name: string;
    nameHi: string;
    serving: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    category: string;
}

interface LogEntry extends FoodItem {
    entryId: string;
    quantity: number;
    meal: string;
    timestamp: string;
}

// Indian Food Database
const FOOD_DATABASE: FoodItem[] = [
    { id: '1', name: 'Roti', nameHi: 'रोटी', serving: '1 pc (30g)', calories: 72, protein: 2.1, carbs: 15, fat: 0.4, category: 'bread' },
    { id: '2', name: 'Rice (Steamed)', nameHi: 'चावल', serving: '1 bowl (150g)', calories: 195, protein: 4, carbs: 45, fat: 0.4, category: 'grain' },
    { id: '3', name: 'Dal (Lentils)', nameHi: 'दाल', serving: '1 bowl (150g)', calories: 150, protein: 9, carbs: 20, fat: 3, category: 'protein' },
    { id: '4', name: 'Mixed Sabzi', nameHi: 'सब्जी', serving: '1 bowl (100g)', calories: 80, protein: 2, carbs: 8, fat: 4, category: 'vegetable' },
    { id: '5', name: 'Paneer Curry', nameHi: 'पनीर', serving: '1 bowl (100g)', calories: 265, protein: 15, carbs: 8, fat: 20, category: 'protein' },
    { id: '6', name: 'Curd/Dahi', nameHi: 'दही', serving: '1 bowl (100g)', calories: 60, protein: 3, carbs: 5, fat: 3, category: 'dairy' },
    { id: '7', name: 'Raita', nameHi: 'रायता', serving: '1 bowl (100g)', calories: 75, protein: 3, carbs: 6, fat: 4, category: 'dairy' },
    { id: '8', name: 'Paratha', nameHi: 'पराठा', serving: '1 pc (60g)', calories: 180, protein: 4, carbs: 25, fat: 7, category: 'bread' },
    { id: '9', name: 'Chai (Milk Tea)', nameHi: 'चाय', serving: '1 cup (150ml)', calories: 80, protein: 2, carbs: 10, fat: 3, category: 'beverage' },
    { id: '10', name: 'Banana', nameHi: 'केला', serving: '1 medium (120g)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'fruit' },
    { id: '11', name: 'Idli', nameHi: 'इडली', serving: '2 pcs (100g)', calories: 150, protein: 4, carbs: 30, fat: 1, category: 'breakfast' },
    { id: '12', name: 'Dosa', nameHi: 'डोसा', serving: '1 pc (100g)', calories: 130, protein: 3, carbs: 22, fat: 3, category: 'breakfast' },
    { id: '13', name: 'Upma', nameHi: 'उपमा', serving: '1 plate (150g)', calories: 220, protein: 5, carbs: 35, fat: 7, category: 'breakfast' },
    { id: '14', name: 'Poha', nameHi: 'पोहा', serving: '1 plate (150g)', calories: 250, protein: 5, carbs: 45, fat: 6, category: 'breakfast' },
    { id: '15', name: 'Apple', nameHi: 'सेब', serving: '1 medium (150g)', calories: 78, protein: 0.4, carbs: 21, fat: 0.2, category: 'fruit' },
];

const QUICK_ADD_IDS = ['1', '2', '3', '4', '9'];

const MEAL_TYPES = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'lunch', label: 'Lunch', icon: Sun },
    { id: 'dinner', label: 'Dinner', icon: Moon },
    { id: 'snacks', label: 'Snacks', icon: Cookie },
];

export default function CalorieCounterPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [selectedMeal, setSelectedMeal] = useState('breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [dailyLog, setDailyLog] = useState<LogEntry[]>([]);
    const [showFoodList, setShowFoodList] = useState(false);
    const dailyGoal = 2000;

    // Load from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const today = new Date().toISOString().split('T')[0];
            const saved = localStorage.getItem(`veda_calories_${today}`);
            if (saved) setDailyLog(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && dailyLog.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem(`veda_calories_${today}`, JSON.stringify(dailyLog));
        }
    }, [dailyLog]);

    // Calculations
    const totalCalories = dailyLog.reduce((sum, entry) => sum + entry.calories, 0);
    const totalProtein = dailyLog.reduce((sum, entry) => sum + entry.protein, 0);
    const totalCarbs = dailyLog.reduce((sum, entry) => sum + entry.carbs, 0);
    const totalFat = dailyLog.reduce((sum, entry) => sum + entry.fat, 0);
    const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

    const filteredFoods = FOOD_DATABASE.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.nameHi.includes(searchQuery)
    );
    const quickAddFoods = FOOD_DATABASE.filter(f => QUICK_ADD_IDS.includes(f.id));

    const addFood = (food: FoodItem, quantity = 1) => {
        const entry: LogEntry = {
            ...food,
            entryId: `${Date.now()}-${food.id}`,
            calories: food.calories * quantity,
            protein: food.protein * quantity,
            carbs: food.carbs * quantity,
            fat: food.fat * quantity,
            quantity,
            meal: selectedMeal,
            timestamp: new Date().toISOString()
        };
        setDailyLog(prev => [...prev, entry]);
        setShowFoodList(false);
        setSearchQuery('');
    };

    const removeEntry = (entryId: string) => {
        setDailyLog(prev => prev.filter(e => e.entryId !== entryId));
    };

    const getMealCalories = (mealType: string) => {
        return dailyLog.filter(e => e.meal === mealType).reduce((sum, e) => sum + e.calories, 0);
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-900 text-white">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.push('/tools')} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Calorie Counter</h1>
                </header>

                <main className="max-w-6xl mx-auto p-4 md:p-6 grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Meal Tabs */}
                        <section className="flex flex-wrap gap-2">
                            {MEAL_TYPES.map(meal => (
                                <button key={meal.id} onClick={() => setSelectedMeal(meal.id)}
                                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${selectedMeal === meal.id ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                    <meal.icon size={18} />
                                    <div className="text-left">
                                        <div className="text-sm font-medium">{meal.label}</div>
                                        <div className="text-xs text-slate-400">{getMealCalories(meal.id)} kcal</div>
                                    </div>
                                </button>
                            ))}
                        </section>

                        {/* Search */}
                        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 space-y-4">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search foods (e.g., Roti, दाल)..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowFoodList(e.target.value.length > 0); }}
                                    onFocus={() => setShowFoodList(true)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                            </div>

                            {showFoodList && (
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {filteredFoods.map(food => (
                                        <div key={food.id} onClick={() => addFood(food)}
                                            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                                            <div>
                                                <div className="font-medium">{food.name} <span className="text-slate-500">{food.nameHi}</span></div>
                                                <div className="text-xs text-slate-400">{food.serving}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="font-bold text-emerald-400">{food.calories}</div>
                                                    <div className="text-xs text-slate-500">kcal</div>
                                                </div>
                                                <button className="p-2 bg-emerald-600 rounded-lg hover:bg-emerald-500"><Plus size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Quick Add */}
                        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
                            <h3 className="font-bold mb-3">Quick Add</h3>
                            <div className="flex flex-wrap gap-2">
                                {quickAddFoods.map(food => (
                                    <button key={food.id} onClick={() => addFood(food)}
                                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors">
                                        <span className="font-medium">{food.nameHi}</span>
                                        <span className="text-xs text-emerald-400 ml-2">{food.calories}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Progress Card */}
                        <section className="bg-gradient-to-br from-emerald-900/30 to-slate-800/50 border border-emerald-800/30 rounded-2xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Flame size={32} className="text-orange-400" />
                                <div>
                                    <span className="text-3xl font-bold">{totalCalories}</span>
                                    <span className="text-slate-400"> / {dailyGoal} kcal</span>
                                </div>
                            </div>
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                                    style={{ width: `${progress}%` }} />
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                                    <div className="text-xl font-bold text-blue-400">{totalProtein.toFixed(0)}g</div>
                                    <div className="text-xs text-slate-400">Protein</div>
                                </div>
                                <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                                    <div className="text-xl font-bold text-yellow-400">{totalCarbs.toFixed(0)}g</div>
                                    <div className="text-xs text-slate-400">Carbs</div>
                                </div>
                                <div className="text-center p-3 bg-slate-900/50 rounded-xl">
                                    <div className="text-xl font-bold text-red-400">{totalFat.toFixed(0)}g</div>
                                    <div className="text-xs text-slate-400">Fat</div>
                                </div>
                            </div>
                        </section>

                        {/* Daily Log */}
                        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
                            <h3 className="font-bold mb-3">Today's {MEAL_TYPES.find(m => m.id === selectedMeal)?.label}</h3>
                            {dailyLog.filter(e => e.meal === selectedMeal).length === 0 ? (
                                <p className="text-slate-500 text-center py-6">No foods logged yet</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {dailyLog.filter(e => e.meal === selectedMeal).map(entry => (
                                        <div key={entry.entryId} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                                            <div>
                                                <div className="font-medium">{entry.name}</div>
                                                <div className="text-xs text-slate-500">{entry.nameHi}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">{entry.calories} kcal</span>
                                                <button onClick={() => removeEntry(entry.entryId)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
