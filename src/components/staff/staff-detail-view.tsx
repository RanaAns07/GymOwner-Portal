'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toDisplayImageUrl } from '@/lib/media-url';
import { resolveStaffAvatar } from '@/lib/staff-avatar-cache';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/types/staff';
import { statusConfig } from '@/types/staff';
import { useLocations, useStaffLocations } from '@/hooks/use-locations';
import {
    useStaffDetailedScheduling,
    useToggleStaffDeactivate,
} from '@/hooks/use-staff';
import { PageReveal } from '@/components/dashboard/PageReveal';
import {
    ArrowLeft,
    Calendar,
    CalendarDays,
    Clock3,
    Loader2,
    Mail,
    MapPin,
    Pencil,
    Phone,
    User,
    Users,
    Dumbbell,
    Briefcase,
} from 'lucide-react';

function roleLabel(role: StaffMember['role']) {
    if (role === 'trainer') return 'Trainer';
    if (role === 'manager') return 'Gym Manager';
    return role;
}

function asCount(value: unknown): number | null {
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
}

function pickMetric(data: Record<string, unknown> | undefined, keys: string[]): number {
    if (!data) return 0;
    for (const key of keys) {
        if (key in data) {
            const count = asCount(data[key]);
            if (count !== null) return count;
        }
        const found = Object.entries(data).find(
            ([k]) =>
                k.toLowerCase().replace(/_/g, '') ===
                key.toLowerCase().replace(/_/g, '')
        );
        if (found) {
            const count = asCount(found[1]);
            if (count !== null) return count;
        }
    }
    return 0;
}

interface StaffDetailViewProps {
    staff: StaffMember;
    onEdit?: (staff: StaffMember) => void;
}

export function StaffDetailView({ staff, onEdit }: StaffDetailViewProps) {
    const router = useRouter();
    const { data: locations } = useLocations();
    const { data: staffLocations, isLoading: locationsLoading } = useStaffLocations(
        staff.id
    );
    const detailed = useStaffDetailedScheduling(staff.id, true);
    const deactivate = useToggleStaffDeactivate();

    const locationNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const loc of locations || []) {
            map.set(loc.id, loc.name);
        }
        return map;
    }, [locations]);

    const metrics = useMemo(() => {
        const data = detailed.data as Record<string, unknown> | undefined;
        return [
            {
                label: 'Assigned clients',
                value: pickMetric(data, ['assigned_clients', 'clients', 'Assigned Clients']),
                icon: Users,
            },
            {
                label: 'Availabilities',
                value: pickMetric(data, ['availabilities', 'Availabilities']),
                icon: Clock3,
            },
            {
                label: 'Recent classes',
                value: pickMetric(data, ['recent_classes', 'classes', 'Recent Classes']),
                icon: Dumbbell,
            },
            {
                label: 'Appointments',
                value: pickMetric(data, [
                    'recent_appointments',
                    'appointments',
                    'Recent Appointments',
                ]),
                icon: CalendarDays,
            },
            {
                label: 'Positions',
                value: pickMetric(data, ['positions', 'Positions']),
                icon: Briefcase,
            },
            {
                label: 'Locations',
                value: (staffLocations || []).length,
                icon: MapPin,
            },
        ];
    }, [detailed.data, staffLocations]);

    const initials = (
        `${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}` ||
        staff.email?.[0] ||
        '?'
    ).toUpperCase();
    const status = statusConfig[staff.status];
    const fullName = `${staff.firstName} ${staff.lastName}`.trim();

    return (
        <PageReveal className="-m-6 flex min-h-[calc(100dvh-4rem)] flex-col lg:-m-8">
            <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    className="gap-2 rounded-xl text-ink-muted hover:text-ink"
                    asChild
                >
                    <Link href="/dashboard/staff">
                        <ArrowLeft className="h-4 w-4" />
                        Back to staff
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="hidden rounded-xl sm:inline-flex"
                        disabled={deactivate.isPending}
                        onClick={async () => {
                            try {
                                await deactivate.mutateAsync(staff.id);
                            } catch {
                                // toast in hook
                            }
                        }}
                    >
                        {deactivate.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {staff.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
                    </Button>
                    {onEdit && (
                        <Button
                            className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => onEdit(staff)}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit profile
                        </Button>
                    )}
                </div>
            </div>

            <div className="relative flex-1 bg-canvas">
                <div className="relative overflow-hidden border-b border-border bg-[#0b1220] text-white">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-80"
                        style={{
                            background:
                                'radial-gradient(ellipse 70% 80% at 15% 20%, color-mix(in srgb, var(--primary) 28%, transparent), transparent 55%), radial-gradient(ellipse 50% 60% at 90% 80%, rgba(255,255,255,0.06), transparent 50%)',
                        }}
                    />
                    <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <Avatar className="h-24 w-24 ring-4 ring-primary/40 sm:h-28 sm:w-28">
                                <AvatarImage
                                    src={toDisplayImageUrl(
                                        resolveStaffAvatar(staff.id, staff.avatar)
                                    )}
                                    alt={fullName}
                                    referrerPolicy="no-referrer"
                                />
                                <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                                    Team member
                                </p>
                                <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                    {fullName}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-sm font-medium text-white/90">
                                        {roleLabel(staff.role)}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            'rounded-lg text-xs font-medium',
                                            status.color
                                        )}
                                    >
                                        {status.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-md">
                            {detailed.isLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <div
                                          key={i}
                                          className="rounded-2xl border border-white/10 bg-white/5 p-3"
                                      >
                                          <Skeleton className="h-3 w-16 bg-white/20" />
                                          <Skeleton className="mt-2 h-7 w-10 bg-white/20" />
                                      </div>
                                  ))
                                : metrics.slice(0, 3).map((item) => (
                                      <div
                                          key={item.label}
                                          className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                                      >
                                          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                              {item.label}
                                          </p>
                                          <p className="mt-1 text-2xl font-extrabold text-primary">
                                              {item.value}
                                          </p>
                                      </div>
                                  ))}
                        </div>
                    </div>
                </div>

                <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8 lg:py-8">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                Contact
                            </h2>
                            <Separator className="my-4" />
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                        <Mail className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-ink-muted">Email</p>
                                        <p className="truncate text-sm font-medium text-ink">
                                            {staff.email}
                                        </p>
                                    </div>
                                </li>
                                {staff.phone ? (
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                            <Phone className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-medium text-ink-muted">
                                                Phone
                                            </p>
                                            <p className="text-sm font-medium text-ink">
                                                {staff.phone}
                                            </p>
                                        </div>
                                    </li>
                                ) : null}
                                {staff.gender ? (
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                            <User className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-xs font-medium text-ink-muted">
                                                Gender
                                            </p>
                                            <p className="text-sm font-medium capitalize text-ink">
                                                {staff.gender.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    </li>
                                ) : null}
                                <li className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                        <Calendar className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-medium text-ink-muted">Joined</p>
                                        <p className="text-sm font-medium text-ink">
                                            {new Date(staff.hireDate).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                Locations
                            </h2>
                            <Separator className="my-4" />
                            {locationsLoading ? (
                                <div className="flex gap-2">
                                    <Skeleton className="h-9 w-28 rounded-xl" />
                                    <Skeleton className="h-9 w-32 rounded-xl" />
                                </div>
                            ) : (staffLocations || []).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {(staffLocations || []).map((assignment) => (
                                        <span
                                            key={assignment.id}
                                            className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-medium text-accent-foreground"
                                        >
                                            <MapPin className="h-3.5 w-3.5" />
                                            {assignment.location_name ||
                                                locationNameById.get(assignment.location) ||
                                                'Location'}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-border bg-canvas/60 px-4 py-8 text-center">
                                    <MapPin className="mx-auto h-6 w-6 text-border" />
                                    <p className="mt-2 text-sm text-ink-muted">
                                        No locations assigned yet
                                    </p>
                                    {onEdit && (
                                        <Button
                                            variant="link"
                                            className="mt-1 text-accent-foreground"
                                            onClick={() => onEdit(staff)}
                                        >
                                            Assign locations
                                        </Button>
                                    )}
                                </div>
                            )}
                        </section>

                        {staff.specializations?.length ? (
                            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                    Specializations
                                </h2>
                                <Separator className="my-4" />
                                <div className="flex flex-wrap gap-2">
                                    {staff.specializations.map((spec) => (
                                        <Badge
                                            key={spec}
                                            variant="secondary"
                                            className="rounded-lg font-normal"
                                        >
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        ) : null}
                    </div>

                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                    Scheduling overview
                                </h2>
                                <p className="mt-1 text-sm text-ink-muted">
                                    Live activity across classes, clients, and availability.
                                </p>
                            </div>
                            {detailed.isFetching && !detailed.isLoading && (
                                <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
                            )}
                        </div>
                        <Separator className="my-5" />

                        {detailed.isLoading ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-border bg-canvas/50 p-4"
                                    >
                                        <Skeleton className="h-9 w-9 rounded-xl" />
                                        <Skeleton className="mt-4 h-3 w-20" />
                                        <Skeleton className="mt-2 h-7 w-12" />
                                    </div>
                                ))}
                            </div>
                        ) : detailed.isError ? (
                            <div className="rounded-xl border border-dashed border-border bg-canvas/60 px-4 py-10 text-center text-sm text-ink-muted">
                                Unable to load scheduling details right now.
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {metrics.map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="rounded-2xl border border-border bg-canvas/40 p-4 transition-colors hover:border-primary/30 hover:bg-card"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground">
                                            <metric.icon className="h-5 w-5" />
                                        </div>
                                        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-muted">
                                            {metric.label}
                                        </p>
                                        <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
                                            {metric.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {detailed.data && (
                            <div className="mt-6">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                    Raw scheduling fields
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {Object.entries(detailed.data)
                                        .slice(0, 12)
                                        .map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="rounded-xl border border-border/80 bg-canvas/30 px-3 py-2.5"
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
                            </div>
                        )}
                    </section>
                </div>

                <div className="sticky bottom-0 flex gap-2 border-t border-border bg-card/95 p-4 backdrop-blur-xl sm:hidden">
                    <Button
                        variant="destructive"
                        className="flex-1 rounded-xl"
                        disabled={deactivate.isPending}
                        onClick={async () => {
                            try {
                                await deactivate.mutateAsync(staff.id);
                            } catch {
                                // toast in hook
                            }
                        }}
                    >
                        {staff.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
                    </Button>
                    {onEdit && (
                        <Button
                            className="flex-1 rounded-xl"
                            onClick={() => onEdit(staff)}
                        >
                            Edit
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => router.push('/dashboard/staff')}
                    >
                        Back
                    </Button>
                </div>
            </div>
        </PageReveal>
    );
}
