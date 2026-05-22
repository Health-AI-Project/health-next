const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3002';

export class BffError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'BffError';
        this.status = status;
    }
}

export async function bffFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BFF_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                headers[key] = value as string;
            }
        });
    }

    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/connexion';
            throw new BffError('Session expirée', 401);
        }
        throw new BffError(
            errorData.message || errorData.error || `BFF error: ${response.status}`,
            response.status,
        );
    }

    return response.json();
}

export function bffStreamUrl(endpoint: string, query?: Record<string, string | undefined>): string {
    const url = new URL(`${BFF_URL}${endpoint}`);
    if (query) {
        for (const [k, v] of Object.entries(query)) {
            if (v != null) url.searchParams.set(k, v);
        }
    }
    return url.toString();
}
