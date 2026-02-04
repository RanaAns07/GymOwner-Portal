"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/providers/auth-context';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { branding } = useAuth();

    // Create dynamic styles if branding is available
    const themeStyles = branding?.primary_color && branding?.secondary_color ? {
        background: `linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.secondary_color} 100%)`,
        '--primary-color': branding.primary_color,
        '--secondary-color': branding.secondary_color,
    } as React.CSSProperties : {};

    return (
        <ProtectedRoute>
            <div
                className={`flex min-h-screen ${branding ? '' : 'bg-zinc-50'}`}
                style={themeStyles}
            >
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    <Header />
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
