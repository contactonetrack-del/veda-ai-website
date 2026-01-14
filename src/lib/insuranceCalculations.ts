/**
 * Insurance Calculation Utilities
 * IRDAI-compliant premium estimation logic (TypeScript).
 */

export interface PremiumParams {
    age: number;
    coverage: string;
    members: number;
    hasPreExisting: boolean;
    zone?: 'Zone 1' | 'Zone 2';
}

const BASE_RATES: Record<string, number> = {
    '18-25': 5000,
    '26-35': 6500,
    '36-45': 8500,
    '46-55': 12000,
    '56-60': 18000,
    '60+': 25000
};

const COVERAGE_MULTIPLIERS: Record<string, number> = {
    '300000': 0.7,
    '500000': 1.0,
    '1000000': 1.8,
    '1500000': 2.5,
    '2500000': 3.5,
    '5000000': 6.0,
    '10000000': 10.0
};

const MEMBER_MULTIPLIERS: Record<string, number> = {
    '1': 1.0,
    '2': 1.5,
    '3': 1.9,
    '4': 2.3,
    '5': 2.7,
    '6': 3.0
};

export function calculatePremium({ age, coverage, members, hasPreExisting, zone = 'Zone 1' }: PremiumParams): number {
    let ageBand = '18-25';
    if (age >= 26 && age <= 35) ageBand = '26-35';
    if (age >= 36 && age <= 45) ageBand = '36-45';
    if (age >= 46 && age <= 55) ageBand = '46-55';
    if (age >= 56 && age <= 60) ageBand = '56-60';
    if (age > 60) ageBand = '60+';

    let premium = BASE_RATES[ageBand];
    premium *= (COVERAGE_MULTIPLIERS[coverage] || 1.0);
    premium *= (MEMBER_MULTIPLIERS[String(members)] || (1 + (members - 1) * 0.4));
    if (hasPreExisting) premium *= 1.2;
    if (zone === 'Zone 1') premium *= 1.1;

    return Math.round(premium);
}

export function getInsuranceTips(age: number, hasPreExisting: boolean, familySize: number): string[] {
    const tips: string[] = [];

    if (age < 30) {
        tips.push("Young Age Advantage: Lock in a high coverage policy now while premiums are low.");
        tips.push("No Claim Bonus: Start building your NCB early to get up to 100% extra coverage free.");
    } else if (age > 45) {
        tips.push("Critical Illness Cover: Highly recommended to add a rider for cardiac or cancer cover.");
        tips.push("Restoration Benefit: Ensure your policy auto-refills sum insured if exhausted.");
    }

    if (hasPreExisting) {
        tips.push("Waiting Period: Be aware of the 2-4 year waiting period for your pre-existing conditions.");
        tips.push("Disclosure: Always disclose full medical history to avoid claim rejection.");
    }

    if (familySize > 1) {
        tips.push("Family Floater: A single floater plan is ~30% cheaper than individual plans for each member.");
        tips.push("Maternity Benefit: If planning a family, check waiting periods for maternity cover.");
    }

    return tips;
}
