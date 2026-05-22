import type { DatasetRow, DatasetSource } from "@/types/admin";

function row(
    id: string,
    source: DatasetSource,
    data: Record<string, string | number | boolean | null>,
    anomalies: DatasetRow["anomalies"] = [],
    status: DatasetRow["validation_status"] = anomalies.length > 0 ? "PENDING" : "VALIDATED",
    etlRunId = 142,
): DatasetRow {
    return {
        id,
        source,
        data,
        anomalies,
        validation_status: status,
        ingested_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        etl_run_id: etlRunId,
    };
}

export const mockDailyFood: DatasetRow[] = [
    row("dfn_001", "daily_food_nutrition", {
        date: "2026-05-21",
        user_id: "u_001",
        food: "Greek yogurt",
        meal_type: "breakfast",
        calories: 150,
        protein_g: 12,
        carbs_g: 18,
        fat_g: 3,
    }),
    row(
        "dfn_002",
        "daily_food_nutrition",
        {
            date: "2026-05-21",
            user_id: "u_4291",
            food: "Caesar salad",
            meal_type: "lunch",
            calories: 850,
            protein_g: 15,
            carbs_g: 22,
            fat_g: 18,
        },
        [
            {
                field: "calories",
                type: "macro_mismatch",
                message: "Écart de 173% entre calories déclarées et calories calculées depuis macros",
            },
        ],
    ),
    row("dfn_003", "daily_food_nutrition", {
        date: "2026-05-21",
        user_id: "u_007",
        food: "Grilled chicken breast",
        meal_type: "dinner",
        calories: 320,
        protein_g: 45,
        carbs_g: 0,
        fat_g: 14,
    }),
    row(
        "dfn_004",
        "daily_food_nutrition",
        {
            date: "2026-05-21",
            user_id: "u_3812",
            food: "Yogurt",
            meal_type: "snack",
            calories: -120,
            protein_g: 5,
            carbs_g: 8,
            fat_g: 0,
        },
        [{ field: "calories", type: "out_of_range", message: "calories négatives" }],
        "REJECTED",
    ),
    row("dfn_005", "daily_food_nutrition", {
        date: "2026-05-21",
        user_id: "u_009",
        food: "Banana",
        meal_type: "snack",
        calories: 105,
        protein_g: 1,
        carbs_g: 27,
        fat_g: 0,
    }),
];

export const mockGymMembers: DatasetRow[] = [
    row("gm_001", "gym_members", {
        age: 28,
        gender: "male",
        weight_kg: 78.5,
        height_m: 1.81,
        max_bpm: 180,
        avg_bpm: 135,
        calories_burned: 480,
        bmi: 23.9,
        experience_level: 2,
    }),
    row(
        "gm_002",
        "gym_members",
        {
            age: 34,
            gender: "F",
            weight_kg: 62,
            height_m: 1.68,
            max_bpm: 240,
            avg_bpm: 150,
            calories_burned: 380,
            bmi: 22.0,
            experience_level: 1,
        },
        [
            {
                field: "max_bpm",
                type: "out_of_range",
                message: "max_bpm=240 hors plage physiologique [60, 220]",
            },
            {
                field: "gender",
                type: "type_mismatch",
                message: "Valeur 'F' non normalisée — attendu : female",
            },
        ],
    ),
    row("gm_003", "gym_members", {
        age: 45,
        gender: "female",
        weight_kg: 70,
        height_m: 1.65,
        max_bpm: 175,
        avg_bpm: 128,
        calories_burned: 320,
        bmi: 25.7,
        experience_level: 3,
    }),
];

export const mockExercises: DatasetRow[] = [
    row("ex_001", "exercisedb", {
        name: "Barbell squat",
        body_part: "legs",
        equipment: "barbell",
        target: "quadriceps",
        difficulty: "intermediate",
    }),
    row(
        "ex_002",
        "exercisedb",
        {
            name: "Standing chest stretch",
            body_part: "chest",
            equipment: "none",
            target: "pectorals",
            difficulty: "beginner",
        },
        [
            {
                field: "instructions",
                type: "constraint_violation",
                message: "1 étape d'instruction au lieu du minimum requis (2+)",
            },
        ],
    ),
    row("ex_003", "exercisedb", {
        name: "Push-up",
        body_part: "chest",
        equipment: "none",
        target: "pectorals",
        difficulty: "beginner",
    }),
];

export const mockDatasetsBySource: Record<DatasetSource, DatasetRow[]> = {
    daily_food_nutrition: mockDailyFood,
    diet_recommendations: [],
    exercisedb: mockExercises,
    gym_members: mockGymMembers,
    fitness_tracker: [],
};
