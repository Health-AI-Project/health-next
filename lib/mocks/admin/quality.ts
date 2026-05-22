import type { DataQualityMetrics } from "@/types/admin";

export const mockDataQualityMetrics: DataQualityMetrics = {
    total_runs_24h: 12,
    successful_runs_24h: 10,
    failed_runs_24h: 1,
    rows_ingested_24h: 30253,
    rows_rejected_24h: 354,
    rejection_rate_pct: 1.17,
    avg_duration_seconds: 184,
    by_source: [
        {
            source: "daily_food_nutrition",
            rows_inserted: 19759,
            rows_rejected: 241,
            rejection_rate_pct: 1.21,
            last_run_status: "success",
            last_run_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
        {
            source: "fitness_tracker",
            rows_inserted: 2956,
            rows_rejected: 44,
            rejection_rate_pct: 1.47,
            last_run_status: "success",
            last_run_at: new Date(Date.now() - 2.1 * 3600 * 1000).toISOString(),
        },
        {
            source: "exercisedb",
            rows_inserted: 1289,
            rows_rejected: 28,
            rejection_rate_pct: 2.12,
            last_run_status: "partial",
            last_run_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        },
        {
            source: "gym_members",
            rows_inserted: 962,
            rows_rejected: 11,
            rejection_rate_pct: 1.13,
            last_run_status: "success",
            last_run_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        },
        {
            source: "diet_recommendations",
            rows_inserted: 4987,
            rows_rejected: 13,
            rejection_rate_pct: 0.26,
            last_run_status: "failed",
            last_run_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        },
    ],
};
