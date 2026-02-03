"use client";

const API_BASE_URL = "/api/proxy/v1";

export const setTokens = (access: string, refresh: string) => {
    if (typeof window !== "undefined") {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
    }
};

export const getAccessToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("access_token");
    }
    return null;
};

export const getRefreshToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("refresh_token");
    }
    return null;
};

export const clearTokens = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }
};

export const refreshAccessToken = async () => {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/users/auth/refresh/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh }),
        });

        if (response.ok) {
            const data = await response.json();
            setTokens(data.access, refresh); // Refresh API usually only returns new access token
            return data.access;
        } else {
            clearTokens();
            return null;
        }
    } catch (error) {
        console.error("Token refresh failed:", error);
        clearTokens();
        return null;
    }
};
