'use client';

import { useAuth } from '@/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Shield, User } from 'lucide-react';

export default function SettingsPage() {
    const { user, branding } = useAuth();

    const roleLabel =
        user?.role === 'gym_owner'
            ? 'Gym Owner'
            : user?.role === 'gym_manager'
              ? 'Manager'
              : user?.role === 'platform_admin'
                ? 'Platform Admin'
                : user?.role || 'User';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Manage your account and gym preferences.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-zinc-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4 text-violet-600" />
                            Account
                        </CardTitle>
                        <CardDescription>
                            Your profile details from the owner portal login.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nickname">Display name</Label>
                            <Input
                                id="nickname"
                                value={user?.nickname || ''}
                                readOnly
                                className="bg-zinc-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    id="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className="bg-zinc-50 pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <Shield className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm text-zinc-600">Role</span>
                            <Badge variant="secondary" className="bg-violet-50 text-violet-700 hover:bg-violet-50">
                                {roleLabel}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Building2 className="h-4 w-4 text-violet-600" />
                            Gym / Tenant
                        </CardTitle>
                        <CardDescription>
                            Workspace linked to this owner account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tenant">Subdomain</Label>
                            <Input
                                id="tenant"
                                value={user?.tenant_subdomain || '—'}
                                readOnly
                                className="bg-zinc-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tenant-id">Tenant ID</Label>
                            <Input
                                id="tenant-id"
                                value={user?.tenant_id || '—'}
                                readOnly
                                className="bg-zinc-50 font-mono text-xs"
                            />
                        </div>
                        {branding?.primary_color && (
                            <div className="flex items-center gap-3 pt-1">
                                <span className="text-sm text-zinc-600">Brand color</span>
                                <span
                                    className="h-6 w-6 rounded-full border border-zinc-200"
                                    style={{ backgroundColor: branding.primary_color }}
                                />
                                <span className="text-xs text-zinc-500 font-mono">
                                    {branding.primary_color}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-zinc-200/80 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Preferences</CardTitle>
                    <CardDescription>
                        More settings will be available here soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Separator className="mb-4" />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-900">Notifications</p>
                            <p className="text-sm text-zinc-500">
                                Email alerts for schedule and membership changes.
                            </p>
                        </div>
                        <Button variant="outline" disabled>
                            Coming soon
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
