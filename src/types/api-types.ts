/**
 * Backend API Response Types
 *
 * Matches Gym Scheduling System API (snake_case).
 */

export interface ApiLoginRequest {
    email: string;
    password: string;
}

export interface ApiLoginResponse {
    access: string;
    refresh: string;
    user: ApiUser;
}

export interface ApiUser {
    id: string;
    email: string;
    role: 'platform_admin' | 'gym_owner' | 'gym_manager' | 'trainer' | 'client';
    tenant_id?: string;
    tenant_name?: string;
    tenant_subdomain?: string;
    nickname?: string;
    is_platform_admin?: boolean;
    profile?: {
        nickname?: string;
        bio?: string;
        phone_number?: string;
        profile_image?: string | null;
    };
}

export interface TenantBranding {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    font_family?: string;
}

export interface TenantDetails {
    id: string;
    name: string;
    subdomain?: string;
    branding?: TenantBranding;
}

export interface ApiPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
