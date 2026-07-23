"use client";

import { refreshTokenApi } from '@/lib/api/auth-api';

const ACCESS_KEY = 'auth_token';
const REFRESH_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';
const BRANDING_KEY = 'auth_branding';

export const setTokens = (access: string, refresh?: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) {
        localStorage.setItem(REFRESH_KEY, refresh);
    }
};

export const getAccessToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY);
};

export const getRefreshToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
};

export const clearTokens = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
};

export const clearAuthStorage = () => {
    if (typeof window === 'undefined') return;
    clearTokens();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(BRANDING_KEY);
};

export const refreshAccessToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    try {
        const access = await refreshTokenApi(refresh);
        setTokens(access, refresh);
        return access;
    } catch (error) {
        console.error('Token refresh failed:', error);
        clearAuthStorage();
        return null;
    }
};

export const AUTH_STORAGE_KEYS = {
    ACCESS_KEY,
    REFRESH_KEY,
    USER_KEY,
    BRANDING_KEY,
} as const;
