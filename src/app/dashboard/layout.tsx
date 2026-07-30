"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AmbientAurora } from '@/components/dashboard/AmbientAurora';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="relative flex min-h-screen bg-canvas">
                <AmbientAurora />
                <Sidebar />
                <div className="relative z-10 flex flex-1 flex-col">
                    <Header />
                    <main className="relative flex-1 p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
