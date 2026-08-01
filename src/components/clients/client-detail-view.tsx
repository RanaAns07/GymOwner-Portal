'use client';

import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DetailHero,
    DetailPageShell,
} from '@/components/layout/detail-page-shell';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/clients';
import { clientStatusConfig } from '@/types/clients';
import { planTypeLabels } from '@/types/pricing';
import {
    useAssignPass,
    useClientPasses,
    useClientDetailedScheduling,
    useClientDetailedNutrition,
    useClientDetailedReflection,
    useToggleUserDeactivate,
} from '@/hooks/use-clients';
import { usePricingPlans } from '@/hooks/use-pricing';
import {
    Calendar,
    Loader2,
    Mail,
    Phone,
    UserCircle,
} from 'lucide-react';

function expiresAtFromValidityDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + Math.max(days, 1));
    return date.toISOString();
}

function DetailJsonPanel({
    loading,
    error,
    data,
    empty,
}: {
    loading: boolean;
    error: boolean;
    data: unknown;
    empty: string;
}) {
    if (loading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
            </div>
        );
    }
    if (error) {
        return (
            <p className="rounded-xl border border-dashed border-border bg-canvas/60 px-4 py-10 text-center text-sm text-ink-muted">
                Unable to load details.
            </p>
        );
    }
    if (!data) {
        return (
            <p className="rounded-xl border border-dashed border-border bg-canvas/60 px-4 py-10 text-center text-sm text-ink-muted">
                {empty}
            </p>
        );
    }

    const entries =
        data && typeof data === 'object'
            ? Object.entries(data as Record<string, unknown>).slice(0, 24)
            : [];

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {entries.map(([key, value]) => (
                <div
                    key={key}
                    className="rounded-xl border border-border bg-canvas/40 px-3 py-2.5"
                >
                    <p className="truncate text-[11px] font-medium capitalize text-ink-muted">
                        {key.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">
                        {value === null || value === undefined
                            ? '—'
                            : typeof value === 'object'
                              ? Array.isArray(value)
                                  ? `${value.length} items`
                                  : 'Object'
                              : String(value)}
                    </p>
                </div>
            ))}
        </div>
    );
}

export function ClientDetailView({ client }: { client: Client }) {
    const [planId, setPlanId] = useState('');
    const [tab, setTab] = useState('overview');
    const { data: plans, isLoading: plansLoading } = usePricingPlans();
    const { data: passes, isLoading: passesLoading } = useClientPasses(client.id);
    const assignPass = useAssignPass();
    const deactivate = useToggleUserDeactivate();
    const scheduling = useClientDetailedScheduling(client.id, tab === 'scheduling');
    const nutrition = useClientDetailedNutrition(client.id, tab === 'nutrition');
    const reflection = useClientDetailedReflection(client.id, tab === 'reflection');

    const selectedPlan = useMemo(
        () => plans?.find((p) => p.id === planId),
        [plans, planId]
    );

    const initials = (
        `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}` ||
        client.email?.[0] ||
        '?'
    ).toUpperCase();
    const status = clientStatusConfig[client.status];
    const fullName = `${client.firstName} ${client.lastName}`.trim();
    const activePasses = (passes || []).filter((p) => p.isActive);

    const handleAssign = async () => {
        if (!selectedPlan) return;
        const creditsRemaining =
            selectedPlan.type === 'membership'
                ? 0
                : selectedPlan.maxClasses && selectedPlan.maxClasses > 0
                  ? selectedPlan.maxClasses
                  : 1;
        try {
            await assignPass.mutateAsync({
                clientId: client.id,
                packageTypeId: selectedPlan.id,
                creditsRemaining,
                expiresAt: expiresAtFromValidityDays(selectedPlan.validityDays || 30),
            });
            setPlanId('');
        } catch {
            // toast in hook
        }
    };

    return (
        <DetailPageShell
            backHref="/dashboard/clients"
            backLabel="Back to clients"
            actions={
                <Button
                    variant="outline"
                    className="rounded-xl"
                    disabled={deactivate.isPending}
                    onClick={async () => {
                        try {
                            await deactivate.mutateAsync(client.id);
                        } catch {
                            // toast in hook
                        }
                    }}
                >
                    {deactivate.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {client.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
                </Button>
            }
            hero={
                <DetailHero
                    eyebrow="Client"
                    title={fullName || client.email}
                    meta={
                        <>
                            <Avatar className="h-8 w-8 ring-2 ring-primary/40">
                                <AvatarImage src={client.avatar} alt={fullName} />
                                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <Badge
                                variant="secondary"
                                className={cn('rounded-lg text-xs font-medium', status.color)}
                            >
                                {status.label}
                            </Badge>
                            {client.membershipName &&
                            client.membershipName !== 'No Active Plan' ? (
                                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-sm text-white/90">
                                    {client.membershipName}
                                </span>
                            ) : null}
                        </>
                    }
                    stats={
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-md">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                    Packages
                                </p>
                                <p className="mt-1 text-2xl font-extrabold text-primary">
                                    {passesLoading ? '—' : activePasses.length}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                    Trainer
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-primary">
                                    {client.assignedStaffName || 'Unassigned'}
                                </p>
                            </div>
                        </div>
                    }
                />
            }
        >
            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
                <TabsList className="h-auto flex-wrap rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="scheduling" className="rounded-lg">
                        Scheduling
                    </TabsTrigger>
                    <TabsTrigger value="nutrition" className="rounded-lg">
                        Nutrition
                    </TabsTrigger>
                    <TabsTrigger value="reflection" className="rounded-lg">
                        Reflection
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Contact
                        </h2>
                        <Separator className="my-4" />
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                    <Mail className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs text-ink-muted">Email</p>
                                    <p className="truncate text-sm font-medium text-ink">
                                        {client.email}
                                    </p>
                                </div>
                            </li>
                            {client.phone ? (
                                <li className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                        <Phone className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-xs text-ink-muted">Phone</p>
                                        <p className="text-sm font-medium text-ink">
                                            {client.phone}
                                        </p>
                                    </div>
                                </li>
                            ) : null}
                            <li className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                    <Calendar className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs text-ink-muted">Joined</p>
                                    <p className="text-sm font-medium text-ink">
                                        {new Date(client.joinDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                    <UserCircle className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs text-ink-muted">Assigned trainer</p>
                                    <p className="text-sm font-medium text-ink">
                                        {client.assignedStaffName || 'Unassigned'}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Packages
                        </h2>
                        <Separator className="my-4" />
                        {passesLoading ? (
                            <Skeleton className="h-20 rounded-xl" />
                        ) : activePasses.length > 0 ? (
                            <ul className="space-y-2">
                                {activePasses.map((pass) => (
                                    <li
                                        key={pass.id}
                                        className="rounded-xl border border-border bg-canvas/40 px-3 py-2.5"
                                    >
                                        <p className="font-medium text-ink">
                                            {plans?.find((p) => p.id === pass.pricingOptionId)
                                                ?.name || pass.pricingOptionName}
                                        </p>
                                        <p className="mt-0.5 text-xs text-ink-muted">
                                            {pass.sessionsRemaining > 0
                                                ? `${pass.sessionsRemaining} credits left`
                                                : 'Membership'}
                                            {pass.expiresAt
                                                ? ` · expires ${new Date(
                                                      pass.expiresAt
                                                  ).toLocaleDateString()}`
                                                : ''}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-ink-muted">No active package assigned.</p>
                        )}

                        <div className="mt-5 space-y-2">
                            <Label>Assign pricing plan</Label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Select
                                    value={planId}
                                    onValueChange={setPlanId}
                                    disabled={plansLoading || !plans?.length}
                                >
                                    <SelectTrigger className="flex-1 rounded-xl">
                                        <SelectValue
                                            placeholder={
                                                plansLoading ? 'Loading…' : 'Select a plan'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(plans || []).map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.name}
                                                {plan.locationName
                                                    ? ` · ${plan.locationName}`
                                                    : ''}{' '}
                                                ({planTypeLabels[plan.type]})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleAssign}
                                    disabled={!planId || assignPass.isPending}
                                    className="rounded-xl"
                                >
                                    {assignPass.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Assign'
                                    )}
                                </Button>
                            </div>
                            {selectedPlan && (
                                <p className="text-xs text-ink-muted">
                                    {selectedPlan.type === 'class-pack'
                                        ? `${selectedPlan.maxClasses || 0} credits`
                                        : 'Membership'}
                                    {' · '}
                                    valid {selectedPlan.validityDays || 30} days
                                </p>
                            )}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="scheduling">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Scheduling detail
                        </h2>
                        <DetailJsonPanel
                            loading={scheduling.isLoading}
                            error={scheduling.isError}
                            data={scheduling.data}
                            empty="No scheduling details available."
                        />
                    </section>
                </TabsContent>
                <TabsContent value="nutrition">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Nutrition detail
                        </h2>
                        <DetailJsonPanel
                            loading={nutrition.isLoading}
                            error={nutrition.isError}
                            data={nutrition.data}
                            empty="No nutrition details available."
                        />
                    </section>
                </TabsContent>
                <TabsContent value="reflection">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Reflection detail
                        </h2>
                        <DetailJsonPanel
                            loading={reflection.isLoading}
                            error={reflection.isError}
                            data={reflection.data}
                            empty="No reflection details available."
                        />
                    </section>
                </TabsContent>
            </Tabs>
        </DetailPageShell>
    );
}
