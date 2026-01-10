/**
 * Health Calculation Utilities
 * Extracted for reusability and testing.
 * Includes BMI, BMR, TDEE, Water Intake, and Protein Needs.
 */

/**
 * Calculate Body Mass Index (BMI)
 */
export function calculateBMI(weightKg, heightCm) {
    if (weightKg <= 0 || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Get BMI Category and Color
 */
export function getBMICategory(bmi) {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6', label: 'Underweight' };
    if (bmi < 25) return { category: 'Normal', color: '#10B981', label: 'Normal Weight' };
    if (bmi < 30) return { category: 'Overweight', color: '#F59E0B', label: 'Overweight' };
    return { category: 'Obese', color: '#EF4444', label: 'Obese' };
}

/**
 * Calculate Basal Metabolic Rate (BMR)
 * Uses Mifflin-St Jeor Equation
 */
export function calculateBMR(weightKg, heightCm, ageYears, gender) {
    // 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5 (men)
    // 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161 (women)

    let base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);

    if (gender === 'male') {
        return Math.round(base + 5);
    } else {
        return Math.round(base - 161);
    }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr, activityLevel) {
    const multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    };

    const multiplier = multipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
}

/**
 * Calculate Daily Water Intake (in Liters)
 * Standard rule: 35ml per kg of body weight
 */
export function calculateWaterIntake(weightKg) {
    return (weightKg * 0.035).toFixed(1);
}

/**
 * Calculate Daily Protein Needs (in Grams)
 * Based on activity level
 */
export function calculateProteinNeeds(weightKg, activityLevel) {
    const ratios = {
        'sedentary': 0.8,
        'light': 1.0,
        'moderate': 1.2,
        'active': 1.6,
        'very_active': 2.0
    };

    const ratio = ratios[activityLevel] || 0.8;
    // Return range (min-max) or specific target
    return Math.round(weightKg * ratio);
}

/**
 * Calculate Ideal Weight Range (based on BMI 18.5 - 24.9)
 */
export function calculateIdealWeight(heightCm) {
    const heightM = heightCm / 100;
    const minWeight = 18.5 * heightM * heightM;
    const maxWeight = 24.9 * heightM * heightM;

    return {
        min: Math.round(minWeight),
        max: Math.round(maxWeight),
        display: `${Math.round(minWeight)} - ${Math.round(maxWeight)} kg`
    };
}
