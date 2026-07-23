'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { loginApi, AuthApiError } from '@/lib/api/auth-api';
import {
    setTokens,
    clearAuthStorage,
    AUTH_STORAGE_KEYS,
} from '@/lib/auth';
import type { ApiUser, TenantBranding, TenantDetails } from '@/types/api-types';

const OWNER_PORTAL_ROLES = new Set(['gym_owner', 'gym_manager', 'platform_admin']);

interface AuthContextType {
    user: ApiUser | null;
    branding: TenantBranding | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ApiUser | null>(null);
    const [branding, setBranding] = useState<TenantBranding | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_KEY);
        const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER_KEY);
        const storedBranding = localStorage.getItem(AUTH_STORAGE_KEYS.BRANDING_KEY);

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                if (storedBranding) {
                    setBranding(JSON.parse(storedBranding));
                }
            } catch {
                clearAuthStorage();
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(
        async (email: string, password: string) => {
            // POST /api/v1/users/auth/login/  { email, password }
            const data = await loginApi({ email: email.trim(), password });

            if (!OWNER_PORTAL_ROLES.has(data.user.role)) {
                throw new AuthApiError(
                    'This account does not have access to the owner portal.',
                    403
                );
            }

            setTokens(data.access, data.refresh);
            localStorage.setItem(AUTH_STORAGE_KEYS.USER_KEY, JSON.stringify(data.user));

            setToken(data.access);
            setUser(data.user);

            // Optional: load tenant branding when tenant_id is present
            if (data.user.tenant_id) {
                try {
                    const tenantResponse = await fetch(
                        `/api/proxy/v1/platform/tenants/${data.user.tenant_id}/`,
                        {
                            headers: {
                                Authorization: `Bearer ${data.access}`,
                                Accept: 'application/json',
                            },
                        }
                    );

                    if (tenantResponse.ok) {
                        const tenantData: TenantDetails = await tenantResponse.json();
                        if (tenantData.branding) {
                            setBranding(tenantData.branding);
                            localStorage.setItem(
                                AUTH_STORAGE_KEYS.BRANDING_KEY,
                                JSON.stringify(tenantData.branding)
                            );
                        }
                    }
                } catch (err) {
                    console.error('Error fetching tenant branding:', err);
                }
            }

            router.push('/dashboard');
        },
        [router]
    );

    const logout = useCallback(() => {
        clearAuthStorage();
        setToken(null);
        setUser(null);
        setBranding(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                branding,
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
