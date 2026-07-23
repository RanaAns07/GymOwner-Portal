/**
 * Auth API — matches Gym Scheduling System
 * POST /api/v1/users/auth/login/
 */

import type { ApiLoginRequest, ApiLoginResponse } from '@/types/api-types';

const AUTH_BASE = '/api/proxy/v1/users/auth';

export class AuthApiError extends Error {
    status: number;
    fieldErrors?: Record<string, string[]>;

    constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
        super(message);
        this.name = 'AuthApiError';
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

function parseLoginError(payload: unknown, status: number): AuthApiError {
    if (!payload || typeof payload !== 'object') {
        return new AuthApiError(
            status === 401
                ? 'Invalid email or password.'
                : 'Login failed. Please try again.',
            status
        );
    }

    const data = payload as Record<string, unknown>;

    // Django SimpleJWT: { "detail": "No active account..." }
    if (typeof data.detail === 'string' && data.detail.trim()) {
        return new AuthApiError(data.detail, status);
    }

    // { "non_field_errors": ["..."] }
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        return new AuthApiError(String(data.non_field_errors[0]), status);
    }

    // { "message": "..." } / { "error": "..." }
    if (typeof data.message === 'string' && data.message.trim()) {
        return new AuthApiError(data.message, status);
    }
    if (typeof data.error === 'string' && data.error.trim()) {
        return new AuthApiError(data.error, status);
    }

    // Field errors: { "email": ["..."], "password": ["..."] }
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
            fieldErrors[key] = value as string[];
        }
    }

    if (Object.keys(fieldErrors).length > 0) {
        const first = Object.values(fieldErrors)[0]?.[0];
        return new AuthApiError(first || 'Invalid credentials.', status, fieldErrors);
    }

    return new AuthApiError('Invalid email or password.', status);
}

/**
 * POST /api/v1/users/auth/login/
 * Body: { email, password }
 * Returns: { access, refresh, user }
 */
export async function loginApi(credentials: ApiLoginRequest): Promise<ApiLoginResponse> {
    const response = await fetch(`${AUTH_BASE}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    const contentType = response.headers.get('Content-Type') || '';
    let payload: unknown = null;

    if (contentType.includes('application/json')) {
        try {
            payload = await response.json();
        } catch {
            payload = null;
        }
    }

    if (!response.ok) {
        throw parseLoginError(payload, response.status);
    }

    const data = payload as ApiLoginResponse;

    if (!data?.access || !data?.user) {
        throw new AuthApiError('Unexpected login response from server.', response.status);
    }

    return data;
}

/**
 * POST /api/v1/users/auth/refresh/
 * Body: { refresh }
 * Returns: { access }
 */
export async function refreshTokenApi(refresh: string): Promise<string> {
    const response = await fetch(`${AUTH_BASE}/refresh/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
        throw new AuthApiError('Session expired. Please sign in again.', response.status);
    }

    const data = await response.json();
    if (!data?.access) {
        throw new AuthApiError('Unexpected refresh response from server.', response.status);
    }

    return data.access as string;
}
