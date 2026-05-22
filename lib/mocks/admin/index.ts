export { mockEtlRuns, mockRejectedRows } from "./runs";
export { mockDataQualityMetrics } from "./quality";
export {
    mockDailyFood,
    mockGymMembers,
    mockExercises,
    mockDatasetsBySource,
} from "./datasets";
export {
    mockUserDemographics,
    mockNutritionTrends,
    mockFitnessStats,
    mockBusinessKpis,
} from "./analytics";
export { mockValidationQueue } from "./validation";

export const DATASET_LABELS: Record<string, string> = {
    daily_food_nutrition: "Daily Food & Nutrition",
    diet_recommendations: "Diet Recommendations",
    exercisedb: "ExerciseDB",
    gym_members: "Gym Members",
    fitness_tracker: "Fitness Tracker",
};

export const STATUS_LABELS: Record<string, string> = {
    pending: "En attente",
    running: "En cours",
    success: "Succès",
    failed: "Échec",
    partial: "Partiel",
    PENDING: "À valider",
    VALIDATED: "Validée",
    REJECTED: "Rejetée",
};
