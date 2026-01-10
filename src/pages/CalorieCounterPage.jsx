/**
 * Calorie Counter Page
 * Track daily calories with Indian food database
 * Port of mobile CalorieCounterScreen
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    addLogEntry,
    deleteLogEntry,
    subscribeToDailyLogs
} from '../services/calorieService';
import {
    ArrowLeft,
    Plus,
    Minus,
    Search,
    Flame,
    Apple,
    Coffee,
    Sun,
    Moon,
    Cookie,
    Trash2,
    ChevronDown
} from 'lucide-react';
import './CalorieCounterPage.css';

// Indian Food Database with nutritional info
const FOOD_DATABASE = [
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

// Quick add foods
const QUICK_ADD_IDS = ['1', '2', '3', '4', '9'];

// Meal types
const MEAL_TYPES = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'lunch', label: 'Lunch', icon: Sun },
    { id: 'dinner', label: 'Dinner', icon: Moon },
    { id: 'snacks', label: 'Snacks', icon: Cookie },
];

function CalorieCounterPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [selectedMeal, setSelectedMeal] = useState('breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [dailyLog, setDailyLog] = useState([]);
    const [showFoodList, setShowFoodList] = useState(false);
    const dailyGoal = 2000;

    // Load data from Firestore
    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = subscribeToDailyLogs(user.uid, (logs) => {
                setDailyLog(logs);
            });
            return () => unsubscribe();
        } else {
            setDailyLog([]); // Clear logs if no user
        }
    }, [user]);

    // Calculate totals
    const totalCalories = dailyLog.reduce((sum, entry) => sum + entry.calories, 0);
    const totalProtein = dailyLog.reduce((sum, entry) => sum + entry.protein, 0);
    const totalCarbs = dailyLog.reduce((sum, entry) => sum + entry.carbs, 0);
    const totalFat = dailyLog.reduce((sum, entry) => sum + entry.fat, 0);
    const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

    // Filter foods
    const filteredFoods = FOOD_DATABASE.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.nameHi.includes(searchQuery)
    );

    // Quick add foods
    const quickAddFoods = FOOD_DATABASE.filter(f => QUICK_ADD_IDS.includes(f.id));

    // Add food entry
    const addFood = async (food, quantity = 1) => {
        if (!user) {
            alert("Please login to save your data!");
            return;
        }

        const entry = {
            foodId: food.id,
            name: food.name,
            nameHi: food.nameHi,
            calories: food.calories * quantity,
            protein: food.protein * quantity,
            carbs: food.carbs * quantity,
            fat: food.fat * quantity,
            quantity,
            meal: selectedMeal
        };

        try {
            await addLogEntry(user.uid, entry);
            setShowFoodList(false);
            setSearchQuery('');
        } catch (error) {
            alert("Failed to save entry");
        }
    };

    // Remove entry
    const removeEntry = async (entryId) => {
        if (!user) return;
        try {
            await deleteLogEntry(entryId);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    // Get meal calories
    const getMealCalories = (mealType) => {
        return dailyLog
            .filter(e => e.meal === mealType)
            .reduce((sum, e) => sum + e.calories, 0);
    };

    return (
        <div className="calorie-page">
            <header className="calorie-header glass">
                <button className="back-btn" onClick={() => navigate('/tools')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Calorie Counter</h1>
                <div className="header-spacer"></div>
            </header>

            <main className="calorie-content">
                {/* Left Column: Actions */}
                <div className="calorie-main-column">
                    <section className="meal-tabs">
                        {MEAL_TYPES.map(meal => (
                            <button
                                key={meal.id}
                                className={`meal-tab ${selectedMeal === meal.id ? 'active' : ''}`}
                                onClick={() => setSelectedMeal(meal.id)}
                            >
                                <meal.icon size={18} />
                                <span>{meal.label}</span>
                                <span className="meal-cal">{getMealCalories(meal.id)} kcal</span>
                            </button>
                        ))}
                    </section>

                    <section className="search-section glass">
                        <div className="search-bar">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search foods (e.g., Roti, दाल)..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowFoodList(e.target.value.length > 0);
                                }}
                                onFocus={() => setShowFoodList(true)}
                            />
                        </div>

                        {showFoodList && (
                            <div className="food-list">
                                {filteredFoods.map(food => (
                                    <div key={food.id} className="food-item" onClick={() => addFood(food)}>
                                        <div className="food-info">
                                            <span className="food-name">{food.name}</span>
                                            <span className="food-hindi">{food.nameHi}</span>
                                            <span className="food-serving">{food.serving}</span>
                                        </div>
                                        <div className="food-calories">
                                            <span>{food.calories}</span>
                                            <span className="unit">kcal</span>
                                        </div>
                                        <button className="add-food-btn">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="quick-add glass">
                        <h3>Quick Add</h3>
                        <div className="quick-foods">
                            {quickAddFoods.map(food => (
                                <button
                                    key={food.id}
                                    className="quick-food-btn"
                                    onClick={() => addFood(food)}
                                >
                                    <span className="food-name">{food.nameHi}</span>
                                    <span className="food-cal">{food.calories}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Tracking */}
                <div className="calorie-sidebar-column">
                    <section className="progress-card glass">
                        <div className="progress-header">
                            <Flame size={24} className="flame-icon" />
                            <div className="calorie-stats">
                                <span className="current">{totalCalories}</span>
                                <span className="divider">/</span>
                                <span className="goal">{dailyGoal} kcal</span>
                            </div>
                        </div>

                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="macro-grid">
                            <div className="macro-item">
                                <span className="macro-value">{totalProtein.toFixed(0)}g</span>
                                <span className="macro-label">Protein</span>
                            </div>
                            <div className="macro-item">
                                <span className="macro-value">{totalCarbs.toFixed(0)}g</span>
                                <span className="macro-label">Carbs</span>
                            </div>
                            <div className="macro-item">
                                <span className="macro-value">{totalFat.toFixed(0)}g</span>
                                <span className="macro-label">Fat</span>
                            </div>
                        </div>
                    </section>

                    <section className="daily-log glass">
                        <h3>Today's Log - {MEAL_TYPES.find(m => m.id === selectedMeal)?.label}</h3>

                        {dailyLog.filter(e => e.meal === selectedMeal).length === 0 ? (
                            <p className="empty-log">No foods logged for {selectedMeal} yet</p>
                        ) : (
                            <div className="log-entries">
                                {dailyLog
                                    .filter(e => e.meal === selectedMeal)
                                    .map(entry => (
                                        <div key={entry.id} className="log-entry">
                                            <div className="entry-info">
                                                <span className="entry-name">{entry.name}</span>
                                                <span className="entry-hindi">{entry.nameHi}</span>
                                            </div>
                                            <span className="entry-cal">{entry.calories} kcal</span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeEntry(entry.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

export default CalorieCounterPage;
