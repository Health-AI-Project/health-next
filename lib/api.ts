const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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
        throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
}
