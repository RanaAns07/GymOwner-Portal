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
                const detail =
                    typeof json.detail === 'string'
                        ? json.detail
                        : Array.isArray(json.detail)
                          ? json.detail.map((d: unknown) =>
                                typeof d === 'string' ? d : JSON.stringify(d)
                            ).join(', ')
                          : undefined;

                // Nested field errors e.g. { profile: { profile_image: ["..."] } }
                let nestedMessage: string | undefined;
                if (json.profile && typeof json.profile === 'object') {
                    for (const msgs of Object.values(json.profile)) {
                        if (Array.isArray(msgs) && typeof msgs[0] === 'string') {
                            nestedMessage = msgs[0];
                            break;
                        }
                    }
                }
                if (!nestedMessage && json && typeof json === 'object') {
                    for (const value of Object.values(json)) {
                        if (Array.isArray(value) && typeof value[0] === 'string') {
                            nestedMessage = value[0];
                            break;
                        }
                    }
                }

                errorData = {
                    message:
                        detail ||
                        nestedMessage ||
                        json.message ||
                        json.error ||
                        (Array.isArray(json.non_field_errors)
                            ? String(json.non_field_errors[0])
                            : undefined) ||
                        'An error occurred',
                    status: response.status,
                    errors: json.errors,
                };
            } catch {
                // Use default error
            }
        }

        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_refresh_token');
                localStorage.removeItem('auth_branding');
                // Avoid infinite redirect loops if already on login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?reason=session_expired';
                }
            }
        }

        throw new ApiClientError(errorData.message, errorData.status, errorData.errors);
    }

    // 204/205 have no body — parsing as JSON would throw and break deletes
    if (response.status === 204 || response.status === 205) {
        return undefined as T;
    }

    const raw = await response.text();
    if (!raw) {
        return undefined as T;
    }

    if (contentType?.includes('application/json')) {
        try {
            return JSON.parse(raw) as T;
        } catch {
            return undefined as T;
        }
    }

    return raw as unknown as T;
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

function buildHeaders(customHeaders?: HeadersInit, skipJsonContentType = false): Headers {
    const headers = new Headers(customHeaders);

    if (!skipJsonContentType && !headers.has('Content-Type')) {
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
     * PATCH multipart/form-data (do not set Content-Type — browser sets boundary)
     */
    async patchFormData<T>(endpoint: string, formData: FormData): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PATCH',
            headers: buildHeaders(undefined, true),
            body: formData,
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
