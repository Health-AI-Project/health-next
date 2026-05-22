export type DatasetSource =
    | "daily_food_nutrition"
    | "diet_recommendations"
    | "exercisedb"
    | "gym_members"
    | "fitness_tracker";

export type EtlRunStatus =
    | "pending"
    | "running"
    | "success"
    | "failed"
    | "partial";

export interface EtlRun {
    id: number;
    source_type: "csv" | "json" | "xlsx";
    source_name: DatasetSource;
    status: EtlRunStatus;
    started_at: string;
    finished_at: string | null;
    rows_inserted: number;
    rows_rejected: number;
    error_message: string | null;
}

export interface EtlRejectedRow {
    id: number;
    etl_run_id: number;
    source_file: string;
    reason: string;
    raw_payload: Record<string, unknown>;
    created_at: string;
}

export type ValidationStatus = "PENDING" | "VALIDATED" | "REJECTED";

export interface ValidationItem {
    id: number;
    entity_type: DatasetSource;
    entity_id: string;
    status: ValidationStatus;
    payload: Record<string, unknown>;
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
}

export type AnomalyType =
    | "missing_required"
    | "out_of_range"
    | "type_mismatch"
    | "duplicate"
    | "constraint_violation"
    | "macro_mismatch";

export interface DatasetRow {
    id: string;
    source: DatasetSource;
    data: Record<string, string | number | boolean | null>;
    anomalies: Array<{
        field: string;
        type: AnomalyType;
        message: string;
    }>;
    validation_status: ValidationStatus;
    ingested_at: string;
    etl_run_id: number;
}

export interface DataQualityMetrics {
    total_runs_24h: number;
    successful_runs_24h: number;
    failed_runs_24h: number;
    rows_ingested_24h: number;
    rows_rejected_24h: number;
    rejection_rate_pct: number;
    avg_duration_seconds: number;
    by_source: Array<{
        source: DatasetSource;
        rows_inserted: number;
        rows_rejected: number;
        rejection_rate_pct: number;
        last_run_status: EtlRunStatus;
        last_run_at: string | null;
    }>;
}

export interface UserDemographics {
    age_bucket: "18-24" | "25-34" | "35-44" | "45-54" | "55+";
    subscription_status: "FREE" | "PREMIUM" | "PREMIUM_PLUS" | "B2B";
    user_count: number;
}

export interface NutritionTrend {
    date: string;
    avg_calories: number;
    avg_protein_g: number;
    avg_carbs_g: number;
    avg_fat_g: number;
    sample_size: number;
}

export interface FitnessStat {
    exercise_name: string;
    exercise_type: string;
    sessions_count: number;
    avg_intensity: "low" | "moderate" | "high";
    avg_duration_min: number;
}

export interface BusinessKpi {
    label: string;
    value: number;
    unit: string;
    trend_pct: number | null;
    period: "7d" | "30d" | "90d";
}

export type ExportFormat = "json" | "csv";

export interface ExportRequest {
    source: DatasetSource;
    format: ExportFormat;
    filters?: {
        date_from?: string;
        date_to?: string;
        validation_status?: ValidationStatus;
    };
}

export interface ValidationDecision {
    lot_id: number;
    decision: "approve" | "reject";
    comment?: string;
    reviewed_by: string;
}

export interface DataSourceRegistry {
    id: number;
    code: string;
    label: string;
    format: "csv" | "json" | "xlsx" | "api";
    description: string | null;
    url: string | null;
    license: string | null;
    active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    age: number | null;
    weight: number | null;
    height: number | null;
    subscription_status: "FREE" | "PREMIUM" | "PREMIUM_PLUS" | "B2B";
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}
