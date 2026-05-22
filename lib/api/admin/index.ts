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
    AdminUser,
    BusinessKpi,
    DataQualityMetrics,
    DataSourceRegistry,
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

export async function updateDatasetRow(
    source: DatasetSource,
    rowId: string,
    data: Record<string, string | number | boolean | null>,
): Promise<DatasetRow | null> {
    if (USE_MOCKS) return null;
    try {
        const res = await bffFetch<ApiResponse<DatasetRow>>(
            `/api/admin/datasets/${source}/${encodeURIComponent(rowId)}`,
            { method: 'PATCH', body: JSON.stringify({ data }) },
        );
        return res.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[admin API] PATCH ${source}/${rowId} failed:`, error);
        }
        return null;
    }
}

export async function createDatasetRow(
    source: DatasetSource,
    data: Record<string, string | number | boolean | null>,
): Promise<DatasetRow | null> {
    if (USE_MOCKS) return null;
    try {
        const res = await bffFetch<ApiResponse<DatasetRow>>(
            `/api/admin/datasets/${source}`,
            { method: 'POST', body: JSON.stringify({ data }) },
        );
        return res.data;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[admin API] POST ${source} failed:`, error);
        }
        return null;
    }
}

export async function deleteDatasetRow(
    source: DatasetSource,
    rowId: string,
): Promise<boolean> {
    if (USE_MOCKS) return true;
    try {
        await bffFetch<ApiResponse<unknown>>(
            `/api/admin/datasets/${source}/${encodeURIComponent(rowId)}`,
            { method: 'DELETE' },
        );
        return true;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[admin API] DELETE ${source}/${rowId} failed:`, error);
        }
        return false;
    }
}

// ---------------------------------------------------------------------------
// Registre dynamique des sources de données
// ---------------------------------------------------------------------------

export function fetchDataSources(): Promise<DataSourceRegistry[]> {
    return callOrFallback<DataSourceRegistry[]>('/api/admin/sources', []);
}

export async function createDataSource(
    data: Partial<DataSourceRegistry> & { code: string; label: string; format: string },
): Promise<DataSourceRegistry | null> {
    if (USE_MOCKS) return null;
    try {
        const res = await bffFetch<ApiResponse<DataSourceRegistry>>('/api/admin/sources', {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
        return res.data;
    } catch {
        return null;
    }
}

export async function updateDataSource(
    id: number,
    data: Partial<DataSourceRegistry>,
): Promise<DataSourceRegistry | null> {
    if (USE_MOCKS) return null;
    try {
        const res = await bffFetch<ApiResponse<DataSourceRegistry>>(`/api/admin/sources/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ data }),
        });
        return res.data;
    } catch {
        return null;
    }
}

export async function deactivateDataSource(id: number): Promise<boolean> {
    if (USE_MOCKS) return true;
    try {
        await bffFetch(`/api/admin/sources/${id}`, { method: 'DELETE' });
        return true;
    } catch {
        return false;
    }
}

// ---------------------------------------------------------------------------
// Users management
// ---------------------------------------------------------------------------

export function fetchUsers(search?: string, limit = 100): Promise<AdminUser[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    return callOrFallback<AdminUser[]>(`/api/admin/users?${params}`, []);
}

export async function updateUserSubscription(
    userId: string,
    subscriptionStatus: AdminUser['subscription_status'],
): Promise<AdminUser | null> {
    if (USE_MOCKS) return null;
    try {
        const res = await bffFetch<ApiResponse<AdminUser>>(
            `/api/admin/users/${encodeURIComponent(userId)}`,
            { method: 'PATCH', body: JSON.stringify({ data: { subscription_status: subscriptionStatus } }) },
        );
        return res.data;
    } catch {
        return null;
    }
}

export async function deleteUser(userId: string): Promise<boolean> {
    if (USE_MOCKS) return true;
    try {
        await bffFetch(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
        return true;
    } catch {
        return false;
    }
}

export async function triggerEtlRun(includeApi = false): Promise<{ started: boolean; message?: string }> {
    if (USE_MOCKS) return { started: true, message: 'Mock run started' };
    try {
        const res = await bffFetch<ApiResponse<unknown>>('/api/admin/etl/run', {
            method: 'POST',
            body: JSON.stringify({ include_api: includeApi }),
        });
        return { started: true, message: JSON.stringify(res.data).slice(0, 200) };
    } catch (error) {
        return { started: false, message: String(error) };
    }
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
