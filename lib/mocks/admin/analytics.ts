import type {
    UserDemographics,
    NutritionTrend,
    FitnessStat,
    BusinessKpi,
} from "@/types/admin";

export const mockUserDemographics: UserDemographics[] = [
    { age_bucket: "18-24", subscription_status: "FREE", user_count: 482 },
    { age_bucket: "18-24", subscription_status: "PREMIUM", user_count: 67 },
    { age_bucket: "25-34", subscription_status: "FREE", user_count: 1290 },
    { age_bucket: "25-34", subscription_status: "PREMIUM", user_count: 412 },
    { age_bucket: "25-34", subscription_status: "PREMIUM_PLUS", user_count: 108 },
    { age_bucket: "35-44", subscription_status: "FREE", user_count: 624 },
    { age_bucket: "35-44", subscription_status: "PREMIUM", user_count: 217 },
    { age_bucket: "35-44", subscription_status: "PREMIUM_PLUS", user_count: 89 },
    { age_bucket: "45-54", subscription_status: "FREE", user_count: 198 },
    { age_bucket: "45-54", subscription_status: "PREMIUM", user_count: 73 },
    { age_bucket: "55+", subscription_status: "FREE", user_count: 64 },
    { age_bucket: "55+", subscription_status: "B2B", user_count: 41 },
];

const today = new Date();
const dateOffset = (days: number) =>
    new Date(today.getTime() - days * 86400 * 1000).toISOString().slice(0, 10);

export const mockNutritionTrends: NutritionTrend[] = Array.from({ length: 30 }, (_, i) => {
    const d = 29 - i;
    return {
        date: dateOffset(d),
        avg_calories: 1850 + Math.round(Math.sin(d / 4) * 120) + Math.round(Math.random() * 40),
        avg_protein_g: 88 + Math.round(Math.cos(d / 5) * 8),
        avg_carbs_g: 210 + Math.round(Math.sin(d / 3) * 15),
        avg_fat_g: 65 + Math.round(Math.cos(d / 6) * 6),
        sample_size: 3200 + Math.round(Math.random() * 200),
    };
});

export const mockFitnessStats: FitnessStat[] = [
    { exercise_name: "Push-up", exercise_type: "calisthenics", sessions_count: 4821, avg_intensity: "moderate", avg_duration_min: 12 },
    { exercise_name: "Running", exercise_type: "cardio", sessions_count: 4109, avg_intensity: "high", avg_duration_min: 32 },
    { exercise_name: "Plank", exercise_type: "calisthenics", sessions_count: 3987, avg_intensity: "moderate", avg_duration_min: 5 },
    { exercise_name: "Barbell squat", exercise_type: "strength", sessions_count: 2854, avg_intensity: "high", avg_duration_min: 18 },
    { exercise_name: "Cycling", exercise_type: "cardio", sessions_count: 2641, avg_intensity: "moderate", avg_duration_min: 45 },
    { exercise_name: "Deadlift", exercise_type: "strength", sessions_count: 1923, avg_intensity: "high", avg_duration_min: 15 },
    { exercise_name: "Yoga flow", exercise_type: "flexibility", sessions_count: 1812, avg_intensity: "low", avg_duration_min: 30 },
    { exercise_name: "Bench press", exercise_type: "strength", sessions_count: 1654, avg_intensity: "high", avg_duration_min: 20 },
    { exercise_name: "Burpees", exercise_type: "hiit", sessions_count: 1487, avg_intensity: "high", avg_duration_min: 10 },
    { exercise_name: "Pull-up", exercise_type: "calisthenics", sessions_count: 1289, avg_intensity: "high", avg_duration_min: 8 },
];

export const mockBusinessKpis: BusinessKpi[] = [
    { label: "Utilisateurs actifs (30j)", value: 4523, unit: "users", trend_pct: 12.4, period: "30d" },
    { label: "Taux de conversion Premium", value: 8.7, unit: "%", trend_pct: 1.2, period: "30d" },
    { label: "Engagement journalier moyen", value: 17.3, unit: "min/user/jour", trend_pct: -2.1, period: "30d" },
    { label: "Satisfaction (NPS)", value: 42, unit: "score", trend_pct: 4.0, period: "90d" },
    { label: "Sessions sport / utilisateur / semaine", value: 3.2, unit: "sessions", trend_pct: 0.4, period: "30d" },
    { label: "Repas loggés / jour", value: 12847, unit: "logs", trend_pct: 18.9, period: "7d" },
];
