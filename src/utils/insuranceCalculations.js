/**
 * Insurance Calculation Utilities
 * IRDAI-compliant premium estimation logic.
 */

// Base rates per age group (Annual Premium in INR for 5 Lakh cover)
const BASE_RATES = {
    '18-25': 5000,
    '26-35': 6500,
    '36-45': 8500,
    '46-55': 12000,
    '56-60': 18000,
    '60+': 25000
};

// Multipliers for Coverage Amount (Reference: 5 Lakhs = 1.0)
const COVERAGE_MULTIPLIERS = {
    '300000': 0.7,   // 3 Lakhs
    '500000': 1.0,   // 5 Lakhs (Base)
    '1000000': 1.8,  // 10 Lakhs
    '1500000': 2.5,  // 15 Lakhs
    '2500000': 3.5,  // 25 Lakhs
    '5000000': 6.0,  // 50 Lakhs
    '10000000': 10.0 // 1 Crore
};

// Multipliers for Family Members
const MEMBER_MULTIPLIERS = {
    '1': 1.0,   // Self only
    '2': 1.5,   // Self + Spouse (Floater benefit)
    '3': 1.9,   // Self + Spouse + 1 Child
    '4': 2.3    // Self + Spouse + 2 Children
};

/**
 * Calculate Estimated Health Insurance Premium
 */
export function calculatePremium({ age, coverage, members, hasPreExisting, zone = 'Zone 1' }) {
    // 1. Determine Age Band
    let ageBand = '18-25';
    if (age >= 26 && age <= 35) ageBand = '26-35';
    if (age >= 36 && age <= 45) ageBand = '36-45';
    if (age >= 46 && age <= 55) ageBand = '46-55';
    if (age >= 56 && age <= 60) ageBand = '56-60';
    if (age > 60) ageBand = '60+';

    let premium = BASE_RATES[ageBand];

    // 2. Apply Coverage Multiplier
    const covMult = COVERAGE_MULTIPLIERS[coverage] || 1.0;
    premium *= covMult;

    // 3. Apply Family Muliplier
    const memMult = MEMBER_MULTIPLIERS[String(members)] || (1 + (members - 1) * 0.4);
    premium *= memMult;

    // 4. Pre-existing Condition Loading (+20%)
    if (hasPreExisting) {
        premium *= 1.2;
    }

    // 5. Zone Loading (Zone 1 Cities are more expensive)
    if (zone === 'Zone 1') {
        premium *= 1.1; // 10% higher for Metros
    }

    return Math.round(premium);
}

/**
 * Get Insurance Recommendations based on Profile
 */
export function getInsuranceTips(age, hasPreExisting, familySize) {
    const tips = [];

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
