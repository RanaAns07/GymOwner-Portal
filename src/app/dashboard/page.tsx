'use client';

import Link from 'next/link';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { useAuth } from '@/providers/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Users,
    UserCircle,
    Calendar,
    Percent,
    Activity,
    UserX,
    ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const { data, isLoading, isError, error, refetch, isFetching } = useDashboardSummary();

    const greetingName =
        user?.nickname ||
        user?.tenant_name ||
        user?.email?.split('@')[0] ||
        'Owner';

    const cards = [
        {
            label: 'Staff',
            value: data?.totalStaff ?? 0,
            icon: Users,
            tone: 'bg-violet-100 text-violet-600',
            href: '/dashboard/staff',
        },
        {
            label: 'Clients',
            value: data?.totalClients ?? 0,
            icon: UserCircle,
            tone: 'bg-emerald-100 text-emerald-600',
            href: '/dashboard/clients',
        },
        {
            label: 'Sessions (week)',
            value: data?.weekSessions ?? 0,
            icon: Calendar,
            tone: 'bg-blue-100 text-blue-600',
            href: '/dashboard/schedule',
        },
        {
            label: 'Fill rate',
            value: `${data?.fillRatePercent ?? 0}%`,
            icon: Percent,
            tone: 'bg-amber-100 text-amber-600',
            href: '/dashboard/schedule',
        },
        {
            label: 'Staff utilization',
            value: `${data?.staffUtilizationPercent ?? 0}%`,
            icon: Activity,
            tone: 'bg-indigo-100 text-indigo-600',
            href: '/dashboard/staff',
        },
        {
            label: 'No-show rate',
            value: `${data?.noShowRatePercent ?? 0}%`,
            icon: UserX,
            tone: 'bg-rose-100 text-rose-600',
            href: '/dashboard/clients',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Welcome back, {greetingName}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Overview of your gym operations and scheduling health.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                >
                    {isFetching ? 'Refreshing…' : 'Refresh'}
                </Button>
            </div>

            {isError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error instanceof Error
                        ? error.message
                        : 'Failed to load dashboard metrics.'}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <div
                              key={i}
                              className="rounded-2xl border border-zinc-200/60 bg-white p-5"
                          >
                              <Skeleton className="h-12 w-12 rounded-xl" />
                              <Skeleton className="mt-4 h-4 w-24" />
                              <Skeleton className="mt-2 h-8 w-16" />
                          </div>
                      ))
                    : cards.map((card) => (
                          <Link
                              key={card.label}
                              href={card.href}
                              className="group rounded-2xl border border-zinc-200/60 bg-white p-5 transition-shadow hover:shadow-md"
                          >
                              <div className="flex items-start justify-between">
                                  <div
                                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.tone}`}
                                  >
                                      <card.icon className="h-6 w-6" />
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:text-zinc-500" />
                              </div>
                              <p className="mt-4 text-sm font-medium text-zinc-500">
                                  {card.label}
                              </p>
                              <p className="mt-1 text-2xl font-bold text-zinc-900">
                                  {card.value}
                              </p>
                          </Link>
                      ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Link
                    href="/dashboard/schedule"
                    className="rounded-2xl border border-zinc-200/60 bg-white p-5 hover:shadow-md transition-shadow"
                >
                    <h2 className="font-semibold text-zinc-900">Schedule sessions</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Create class templates and recurrence rules to expand calendar sessions.
                    </p>
                </Link>
                <Link
                    href="/dashboard/staff"
                    className="rounded-2xl border border-zinc-200/60 bg-white p-5 hover:shadow-md transition-shadow"
                >
                    <h2 className="font-semibold text-zinc-900">Manage staff</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Provision trainers and managers with create_staff.
                    </p>
                </Link>
                <Link
                    href="/dashboard/clients"
                    className="rounded-2xl border border-zinc-200/60 bg-white p-5 hover:shadow-md transition-shadow"
                >
                    <h2 className="font-semibold text-zinc-900">Client list</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        View and manage your clients.
                    </p>
                </Link>
            </div>
        </div>
    );
}
