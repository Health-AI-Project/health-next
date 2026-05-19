const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// --- Cache intelligent ---
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_CACHE_TTL = 30_000; // 30 secondes

export function cachedFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    ttl: number = DEFAULT_CACHE_TTL,
): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET') {
        return apiFetch<T>(endpoint, options);
    }

    const cacheKey = endpoint;
    const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;

    if (cached && Date.now() - cached.timestamp < ttl) {
        return Promise.resolve(cached.data);
    }

    return apiFetch<T>(endpoint, options).then((data) => {
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
    });
}

export function invalidateCache(endpoint?: string) {
    if (endpoint) {
        cache.delete(endpoint);
    } else {
        cache.clear();
    }
}

export class ApiError extends Error {
    status: number;
    required_tier?: string;

    constructor(message: string, status: number, required_tier?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.required_tier = required_tier;
    }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {};
    const isFormData = options.body instanceof FormData;

    // Copy headers from options
    if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                headers[key] = value as string;
            }
        });
    }

    // Automatically set Content-Type to application/json if not FormData and not already set
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Browser must set multipart boundary automatically for FormData
    if (isFormData && headers['Content-Type']) {
        delete headers['Content-Type'];
    }

    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 401: redirect to login
        if (response.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/connexion';
            throw new ApiError('Session expiree', 401);
        }

        throw new ApiError(
            errorData.message || `API error: ${response.status}`,
            response.status,
            errorData.required_tier,
        );
    }

    return response.json();
}
