'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode
} from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { ApiLoginRequest, ApiLoginResponse, ApiUser } from '@/types/api-types';

interface AuthContextType {
    user: ApiUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ApiUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                // Invalid stored data, clear it
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await fetch('/api/proxy/v1/users/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password } as ApiLoginRequest),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || error.detail || 'Login failed');
        }

        const data: ApiLoginResponse = await response.json();

        // Store token and user
        localStorage.setItem('auth_token', data.access);
        localStorage.setItem('auth_user', JSON.stringify(data.user));

        if (data.refresh) {
            localStorage.setItem('auth_refresh_token', data.refresh);
        }

        setToken(data.access);
        setUser(data.user);

        router.push('/dashboard');
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_refresh_token');
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!token,
                isLoading,
                login,
                logout,
                token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
