'use client';

import { useAuth } from '@/providers/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Shield, User } from 'lucide-react';
import { PageReveal } from '@/components/dashboard/PageReveal';
import { ThemeToggle } from '@/components/layout/theme-toggle';

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
        <PageReveal className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">Settings</h1>
                <p className="text-sm text-ink-muted mt-1">
                    Manage your account and gym preferences.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="h-4 w-4 text-accent-foreground" />
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
                                className="bg-canvas"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                                <Input
                                    id="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className="bg-canvas pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <Shield className="h-4 w-4 text-ink-muted" />
                            <span className="text-sm text-ink-muted">Role</span>
                            <Badge variant="secondary" className="bg-primary/10 text-accent-foreground hover:bg-primary/10">
                                {roleLabel}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Building2 className="h-4 w-4 text-accent-foreground" />
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
                                className="bg-canvas"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tenant-id">Tenant ID</Label>
                            <Input
                                id="tenant-id"
                                value={user?.tenant_id || '—'}
                                readOnly
                                className="bg-canvas font-mono text-xs"
                            />
                        </div>
                        {branding?.primary_color && (
                            <div className="space-y-2 pt-1">
                                <span className="text-sm text-ink-muted">Brand colors</span>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-6 w-6 rounded-full border border-border"
                                            style={{ backgroundColor: branding.primary_color }}
                                        />
                                        <span className="text-xs text-ink-muted font-mono">
                                            Primary {branding.primary_color}
                                        </span>
                                    </div>
                                    {branding.secondary_color && (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="h-6 w-6 rounded-full border border-border"
                                                style={{
                                                    backgroundColor: branding.secondary_color,
                                                }}
                                            />
                                            <span className="text-xs text-ink-muted font-mono">
                                                Secondary {branding.secondary_color}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/80 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Preferences</CardTitle>
                    <CardDescription>
                        Appearance and notification preferences for this portal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-ink">Appearance</p>
                            <p className="text-sm text-ink-muted">
                                Switch between light, dark, or system theme.
                            </p>
                        </div>
                        <ThemeToggle compact={false} />
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-ink">Notifications</p>
                            <p className="text-sm text-ink-muted">
                                Email alerts for schedule and membership changes.
                            </p>
                        </div>
                        <Button variant="outline" disabled>
                            Coming soon
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </PageReveal>
    );
}
