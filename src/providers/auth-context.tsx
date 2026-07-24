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
import { fetchMyProfileApi } from '@/lib/api/profile-api';
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
    updateUser: (user: ApiUser) => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Merge GET /users/profiles/me/ into the auth user (nickname + profile image, etc.). */
function mergeProfileIntoUser(
    base: ApiUser,
    me: Awaited<ReturnType<typeof fetchMyProfileApi>>
): ApiUser {
    const nickname = me.profile?.nickname || me.nickname || base.nickname;
    const remoteImage = me.profile?.profile_image ?? null;
    const localImage = base.profile?.profile_image ?? null;
    // Keep a working data:/blob: preview — remote media URLs often 404 (nginx not serving files)
    const profileImage =
        localImage && (localImage.startsWith('data:') || localImage.startsWith('blob:'))
            ? localImage
            : remoteImage || localImage;

    return {
        ...base,
        id: me.id || base.id,
        email: me.email || base.email,
        role: (me.role as ApiUser['role']) || base.role,
        nickname,
        tenant_id: me.tenant_id || base.tenant_id,
        tenant_name: me.tenant_name || base.tenant_name,
        tenant_subdomain: me.tenant_subdomain || base.tenant_subdomain,
        profile: {
            ...base.profile,
            ...me.profile,
            nickname: me.profile?.nickname || nickname,
            profile_image: profileImage,
        },
    };
}

async function loadProfileForUser(base: ApiUser): Promise<ApiUser> {
    try {
        const me = await fetchMyProfileApi();
        return mergeProfileIntoUser(base, me);
    } catch (err) {
        console.warn('Profile load failed:', err);
        return base;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ApiUser | null>(null);
    const [branding, setBranding] = useState<TenantBranding | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const persistUser = useCallback((next: ApiUser) => {
        setUser(next);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_KEY, JSON.stringify(next));
    }, []);

    // Restore session from localStorage, then refresh from GET /profiles/me/
    useEffect(() => {
        let cancelled = false;

        const restore = async () => {
            const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_KEY);
            const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER_KEY);
            const storedBranding = localStorage.getItem(AUTH_STORAGE_KEYS.BRANDING_KEY);

            if (storedToken && storedUser) {
                try {
                    const parsed = JSON.parse(storedUser) as ApiUser;
                    setToken(storedToken);
                    setUser(parsed);
                    if (storedBranding) {
                        setBranding(JSON.parse(storedBranding));
                    }

                    const refreshed = await loadProfileForUser(parsed);
                    if (!cancelled) {
                        persistUser(refreshed);
                    }
                } catch {
                    clearAuthStorage();
                }
            }
            if (!cancelled) setIsLoading(false);
        };

        restore();
        return () => {
            cancelled = true;
        };
    }, [persistUser]);

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
            setToken(data.access);
            persistUser(data.user);

            // GET /users/profiles/me/ — load full profile (image, nickname, etc.)
            const withProfile = await loadProfileForUser(data.user);
            persistUser(withProfile);

            // Optional: load tenant branding when tenant_id is present
            const tenantId = withProfile.tenant_id || data.user.tenant_id;
            if (tenantId) {
                try {
                    const tenantResponse = await fetch(
                        `/api/proxy/v1/platform/tenants/${tenantId}/`,
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
                    console.warn('Tenant branding unavailable:', err);
                }
            }

            router.push('/dashboard');
        },
        [router, persistUser]
    );

    const logout = useCallback(() => {
        clearAuthStorage();
        setToken(null);
        setUser(null);
        setBranding(null);
        router.push('/login');
    }, [router]);

    const updateUser = useCallback(
        (next: ApiUser) => {
            persistUser(next);
        },
        [persistUser]
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                branding,
                isAuthenticated: !!token,
                isLoading,
                login,
                logout,
                updateUser,
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
