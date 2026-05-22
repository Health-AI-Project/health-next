import { bffFetch, bffStreamUrl } from '@/lib/api/bff';
import {
    mockBusinessKpis,
    mockDataQualityMetrics,
    mockDatasetsBySource,
    mockEtlRuns,
    mockFitnessStats,
    mockNutritionTrends,
    mockUserDemographics,
    mockValidationQueue,
} from '@/lib/mocks/admin';
import type {
    BusinessKpi,
    DataQualityMetrics,
    DatasetRow,
    DatasetSource,
    EtlRun,
    ExportFormat,
    FitnessStat,
    NutritionTrend,
    UserDemographics,
    ValidationItem,
} from '@/types/admin';

const USE_MOCKS = process.env.NEXT_PUBLIC_ADMIN_USE_MOCKS === '1';

interface ApiResponse<T> {
    data: T;
    meta?: { source?: string; count?: number };
}

async function callOrFallback<T>(endpoint: string, fallback: T): Promise<T> {
    if (USE_MOCKS) return fallback;
    try {
        const res = await bffFetch<ApiResponse<T>>(endpoint);
        return res.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[admin API] ${endpoint} failed, fallback to mock:`, error);
        }
        return fallback;
    }
}

// ---------------------------------------------------------------------------
// Data quality + runs
// ---------------------------------------------------------------------------

export function fetchDataQualityMetrics(): Promise<DataQualityMetrics> {
    return callOrFallback<DataQualityMetrics>('/api/admin/data-quality', mockDataQualityMetrics);
}

export function fetchEtlRuns(limit = 50): Promise<EtlRun[]> {
    return callOrFallback<EtlRun[]>(`/api/admin/runs?limit=${limit}`, mockEtlRuns);
}

// ---------------------------------------------------------------------------
// Validation queue
// ---------------------------------------------------------------------------

export function fetchValidationQueue(
    status?: 'PENDING' | 'VALIDATED' | 'REJECTED',
): Promise<ValidationItem[]> {
    const qs = status ? `?status=${status}` : '';
    return callOrFallback<ValidationItem[]>(`/api/admin/validation${qs}`, mockValidationQueue);
}

export async function approveValidationItem(itemId: number): Promise<ValidationItem | null> {
    if (USE_MOCKS) return null;
    try {
        const res = await bffFetch<ApiResponse<ValidationItem>>(
            `/api/admin/validation/${itemId}/approve`,
            { method: 'POST', body: JSON.stringify({}) },
        );
        return res.data;
    } catch {
        return null;
    }
}

export async function rejectValidationItem(itemId: number): Promise<ValidationItem | null> {
    if (USE_MOCKS) return null;
    try {
        const res = await bffFetch<ApiResponse<ValidationItem>>(
            `/api/admin/validation/${itemId}/reject`,
            { method: 'POST', body: JSON.stringify({}) },
        );
        return res.data;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Datasets
// ---------------------------------------------------------------------------

export function fetchDatasetRows(source: DatasetSource, limit = 50): Promise<DatasetRow[]> {
    return callOrFallback<DatasetRow[]>(
        `/api/admin/datasets/${source}?limit=${limit}`,
        mockDatasetsBySource[source] ?? [],
    );
}

// ---------------------------------------------------------------------------
// Exports — retourne l'URL pour téléchargement direct (streamé par le BFF)
// ---------------------------------------------------------------------------

export function buildExportUrl(source: DatasetSource, format: ExportFormat): string {
    return bffStreamUrl(`/api/admin/export/${source}`, { format });
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export function fetchDemographics(): Promise<UserDemographics[]> {
    return callOrFallback<UserDemographics[]>(
        '/api/admin/analytics/demographics',
        mockUserDemographics,
    );
}

export function fetchNutritionTrends(days = 30): Promise<NutritionTrend[]> {
    return callOrFallback<NutritionTrend[]>(
        `/api/admin/analytics/nutrition-trends?days=${days}`,
        mockNutritionTrends,
    );
}

export function fetchFitnessStats(limit = 10): Promise<FitnessStat[]> {
    return callOrFallback<FitnessStat[]>(
        `/api/admin/analytics/fitness-stats?limit=${limit}`,
        mockFitnessStats,
    );
}

export function fetchBusinessKpis(): Promise<BusinessKpi[]> {
    return callOrFallback<BusinessKpi[]>(
        '/api/admin/analytics/business-kpis',
        mockBusinessKpis,
    );
}
