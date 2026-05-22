import type { ValidationItem } from "@/types/admin";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

export const mockValidationQueue: ValidationItem[] = [
    {
        id: 1,
        entity_type: "daily_food_nutrition",
        entity_id: "dfn_002",
        status: "PENDING",
        payload: {
            food: "Caesar salad",
            calories: 850,
            anomaly: "macro_mismatch",
            suggested_fix: { calories: 312 },
        },
        reviewed_by: null,
        reviewed_at: null,
        created_at: hoursAgo(2),
    },
    {
        id: 2,
        entity_type: "gym_members",
        entity_id: "gm_002",
        status: "PENDING",
        payload: {
            max_bpm: 240,
            anomaly: "out_of_range",
            suggested_fix: { max_bpm: 190 },
        },
        reviewed_by: null,
        reviewed_at: null,
        created_at: hoursAgo(8),
    },
    {
        id: 3,
        entity_type: "exercisedb",
        entity_id: "ex_002",
        status: "VALIDATED",
        payload: {
            instructions_completed: true,
            reviewer_note: "Instructions complétées manuellement",
        },
        reviewed_by: "admin@healthai.coach",
        reviewed_at: hoursAgo(4),
        created_at: hoursAgo(6),
    },
    {
        id: 4,
        entity_type: "daily_food_nutrition",
        entity_id: "dfn_004",
        status: "REJECTED",
        payload: {
            calories: -120,
            anomaly: "out_of_range",
            reviewer_note: "Donnée corrompue — rejet définitif",
        },
        reviewed_by: "admin@healthai.coach",
        reviewed_at: hoursAgo(3),
        created_at: hoursAgo(2),
    },
];
