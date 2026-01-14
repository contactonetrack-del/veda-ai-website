/**
 * Health Calculation Utilities
 * TypeScript version for Next.js
 * Includes BMI, BMR, TDEE, Water Intake, and Protein Needs.
 */

export interface BMICategory {
    category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
    color: string;
    label: string;
    advice?: string;
}

export interface IdealWeight {
    min: number;
    max: number;
    display: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female';

/**
 * Calculate Body Mass Index (BMI)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
    if (weightKg <= 0 || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Get BMI Category and Color
 */
export function getBMICategory(bmi: number): BMICategory {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3B82F6', label: 'Underweight' };
    if (bmi < 25) return { category: 'Normal', color: '#10B981', label: 'Normal Weight' };
    if (bmi < 30) return { category: 'Overweight', color: '#F59E0B', label: 'Overweight' };
    return { category: 'Obese', color: '#EF4444', label: 'Obese' };
}

/**
 * Calculate Basal Metabolic Rate (BMR)
 * Uses Mifflin-St Jeor Equation
 */
export function calculateBMR(weightKg: number, heightCm: number, ageYears: number, gender: Gender): number {
    let base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
    return gender === 'male' ? Math.round(base + 5) : Math.round(base - 161);
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multipliers: Record<ActivityLevel, number> = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

/**
 * Calculate Daily Water Intake (in Liters)
 * Standard rule: 35ml per kg of body weight
 */
export function calculateWaterIntake(weightKg: number): number {
    return parseFloat((weightKg * 0.035).toFixed(1));
}

/**
 * Calculate Daily Protein Needs (in Grams)
 */
export function calculateProteinNeeds(weightKg: number, activityLevel: ActivityLevel): number {
    const ratios: Record<ActivityLevel, number> = {
        'sedentary': 0.8,
        'light': 1.0,
        'moderate': 1.2,
        'active': 1.6,
        'very_active': 2.0
    };
    return Math.round(weightKg * (ratios[activityLevel] || 0.8));
}

/**
 * Calculate Ideal Weight Range (based on BMI 18.5 - 24.9)
 */
export function calculateIdealWeight(heightCm: number): IdealWeight {
    const heightM = heightCm / 100;
    const minWeight = 18.5 * heightM * heightM;
    const maxWeight = 24.9 * heightM * heightM;

    return {
        min: Math.round(minWeight),
        max: Math.round(maxWeight),
        display: `${Math.round(minWeight)} - ${Math.round(maxWeight)} kg`
    };
}
