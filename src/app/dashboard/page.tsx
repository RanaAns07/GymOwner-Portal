'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { useAuth } from '@/providers/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DashboardHeroVisual } from '@/components/dashboard/DashboardHeroVisual';
import {
    PageReveal,
    staggerContainer,
    staggerItem,
} from '@/components/dashboard/PageReveal';
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
    const reduce = useReducedMotion();
    const { data, isLoading, isPending, isError, error, refetch, isFetching } =
        useDashboardSummary();
    const showSkeletons = isLoading || isPending;

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
            href: '/dashboard/staff',
        },
        {
            label: 'Clients',
            value: data?.totalClients ?? 0,
            icon: UserCircle,
            href: '/dashboard/clients',
        },
        {
            label: 'Sessions (week)',
            value: data?.weekSessions ?? 0,
            icon: Calendar,
            href: '/dashboard/schedule',
        },
        {
            label: 'Fill rate',
            value: `${data?.fillRatePercent ?? 0}%`,
            icon: Percent,
            href: '/dashboard/schedule',
        },
        {
            label: 'Staff utilization',
            value: `${data?.staffUtilizationPercent ?? 0}%`,
            icon: Activity,
            href: '/dashboard/staff',
        },
        {
            label: 'No-show rate',
            value: `${data?.noShowRatePercent ?? 0}%`,
            icon: UserX,
            href: '/dashboard/clients',
        },
    ];

    return (
        <PageReveal className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
                <div className="flex flex-col justify-center gap-4">
                    <div>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                            Operations overview
                        </p>
                        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                            Welcome back, {greetingName}
                        </h1>
                        <p className="mt-1.5 max-w-lg text-sm text-ink-muted">
                            Scheduling health and team capacity across your
                            locations — calm, clear, in control.
                        </p>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="rounded-full bg-card/70 backdrop-blur-sm"
                        >
                            {isFetching ? 'Refreshing…' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                <DashboardHeroVisual
                  className="min-h-[220px]"
                  fillRate={data?.fillRatePercent ?? 0}
                  weekSessions={data?.weekSessions ?? 0}
                  staffUtilization={data?.staffUtilizationPercent ?? 0}
                />
            </div>

            {isError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error instanceof Error
                        ? error.message
                        : 'Failed to load dashboard metrics.'}
                </div>
            )}

            <motion.div
                key={showSkeletons ? 'dashboard-metrics-loading' : 'dashboard-metrics-ready'}
                variants={reduce ? undefined : staggerContainer}
                initial={reduce ? false : 'hidden'}
                animate={reduce ? undefined : 'show'}
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
                {showSkeletons
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <div
                              key={i}
                              className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm"
                          >
                              <Skeleton className="h-11 w-11 rounded-xl" />
                              <Skeleton className="mt-4 h-4 w-24" />
                              <Skeleton className="mt-2 h-8 w-16" />
                          </div>
                      ))
                    : cards.map((card) => (
                          <motion.div
                              key={card.label}
                              variants={reduce ? undefined : staggerItem}
                              whileHover={
                                  reduce
                                      ? undefined
                                      : { y: -3, transition: { duration: 0.2 } }
                              }
                          >
                              <Link
                                  href={card.href}
                                  className="group flex h-full flex-col rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-primary/35 hover:bg-card hover:shadow-[0_20px_40px_-28px_rgba(11,18,32,0.35)]"
                              >
                                  <div className="flex items-start justify-between">
                                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-accent-foreground transition-transform duration-300 group-hover:scale-105">
                                          <card.icon className="h-5 w-5" />
                                      </div>
                                      <ArrowRight className="h-4 w-4 text-border transition group-hover:translate-x-0.5 group-hover:text-accent-foreground" />
                                  </div>
                                  <p className="mt-5 text-sm font-medium text-ink-muted">
                                      {card.label}
                                  </p>
                                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
                                      {card.value}
                                  </p>
                              </Link>
                          </motion.div>
                      ))}
            </motion.div>

            <motion.div
                variants={reduce ? undefined : staggerContainer}
                initial={reduce ? false : 'hidden'}
                animate={reduce ? undefined : 'show'}
                className="grid gap-4 lg:grid-cols-3"
            >
                {[
                    {
                        href: '/dashboard/schedule',
                        title: 'Schedule sessions',
                        body: 'Create class templates and recurrence rules to expand calendar sessions.',
                    },
                    {
                        href: '/dashboard/staff',
                        title: 'Manage staff',
                        body: 'Provision trainers and managers across your locations.',
                    },
                    {
                        href: '/dashboard/clients',
                        title: 'Client list',
                        body: 'View and manage your clients in one place.',
                    },
                ].map((action) => (
                    <motion.div
                        key={action.href}
                        variants={reduce ? undefined : staggerItem}
                        whileHover={
                            reduce
                                ? undefined
                                : { y: -2, transition: { duration: 0.2 } }
                        }
                    >
                        <Link
                            href={action.href}
                            className="group relative block overflow-hidden rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30 hover:bg-card hover:shadow-[0_16px_32px_-24px_rgba(11,18,32,0.3)]"
                        >
                            <span className="absolute left-0 top-0 h-full w-1 bg-primary/70" />
                            <h2 className="font-semibold text-ink transition-colors group-hover:text-accent-foreground">
                                {action.title}
                            </h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                                {action.body}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </PageReveal>
    );
}
