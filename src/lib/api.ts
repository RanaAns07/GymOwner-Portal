/**
 * Generic API Client
 * 
 * This client automatically prefixes all requests with /api/proxy/v1
 * so frontend components never talk directly to the backend.
 * All requests are routed through the Next.js API proxy.
 */

const API_BASE = '/api/proxy/v1';

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(message: string, status: number, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiClientError';
        this.status = status;
        this.errors = errors;
    }
}

interface RequestOptions<TBody = unknown> extends Omit<RequestInit, 'body'> {
    body?: TBody;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('Content-Type');

    if (!response.ok) {
        let errorData: ApiError = {
            message: 'An error occurred',
            status: response.status,
        };

        if (contentType?.includes('application/json')) {
            try {
                const json = await response.json();
                errorData = {
                    message: json.message || json.error || 'An error occurred',
                    status: response.status,
                    errors: json.errors,
                };
            } catch {
                // Use default error
            }
        }

        throw new ApiClientError(errorData.message, errorData.status, errorData.errors);
    }

    if (contentType?.includes('application/json')) {
        return response.json();
    }

    return response.text() as unknown as T;
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

function buildHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const token = getAuthToken();
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
}

export const apiClient = {
    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: buildHeaders(options?.headers),
            ...options,
        });
        return handleResponse<T>(response);
    },

    /**
     * POST request
     */
    async post<T, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        options?: Omit<RequestOptions<TBody>, 'body'>
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: buildHeaders(options?.headers),
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        });
        return handleResponse<T>(response);
    },

    /**
     * PUT request
     */
    async put<T, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        options?: Omit<RequestOptions<TBody>, 'body'>
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: buildHeaders(options?.headers),
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        });
        return handleResponse<T>(response);
    },

    /**
     * PATCH request
     */
    async patch<T, TBody = unknown>(
        endpoint: string,
        body?: TBody,
        options?: Omit<RequestOptions<TBody>, 'body'>
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PATCH',
            headers: buildHeaders(options?.headers),
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        });
        return handleResponse<T>(response);
    },

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: buildHeaders(options?.headers),
            ...options,
        });
        return handleResponse<T>(response);
    },
};

export default apiClient;
