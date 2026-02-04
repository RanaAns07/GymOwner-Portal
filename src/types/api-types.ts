/**
 * Backend API Response Types
 * 
 * These types match the Django backend's snake_case field naming convention.
 * Each API module has its own types, but these are shared for authentication.
 */

// Authentication Request
export interface ApiLoginRequest {
    email: string;
    password: string;
}

// Authentication Response (matches CustomTokenObtainPairSerializer)
export interface ApiLoginResponse {
    access: string;
    refresh: string;
    user: ApiUser;
}

// User object returned in login response
export interface ApiUser {
    id: string;
    email: string;
    role: 'platform_admin' | 'gym_owner' | 'gym_manager' | 'trainer' | 'client';
    nickname: string;
    is_platform_admin: boolean;
    tenant_id?: string;
    tenant_subdomain?: string;
}
