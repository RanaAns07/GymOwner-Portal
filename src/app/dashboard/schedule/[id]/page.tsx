'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    DetailHero,
    DetailPageShell,
} from '@/components/layout/detail-page-shell';
import { EditSessionModal } from '@/components/schedule/edit-session-modal';
import { useQuery } from '@tanstack/react-query';
import { fetchSessionFromApi } from '@/lib/api/schedule-api';
import { scheduleKeys, useDeleteSession } from '@/hooks/use-schedule';
import {
    sessionTypeLabels,
    sessionTypeColors,
} from '@/types/schedule';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Loader2,
    MapPin,
    Pencil,
    Trash2,
    Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SessionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const deleteSession = useDeleteSession();

    const { data: session, isLoading, isError } = useQuery({
        queryKey: scheduleKeys.detail(id),
        queryFn: () => fetchSessionFromApi(id),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="-m-6 bg-[#0b1220] px-6 py-10 lg:-m-8">
                <Skeleton className="h-10 w-64 bg-white/10" />
            </div>
        );
    }

    if (isError || !session) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-lg font-semibold text-ink">Session not found</p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/dashboard/schedule">
                        <ArrowLeft className="h-4 w-4" />
                        Back to schedule
                    </Link>
                </Button>
            </div>
        );
    }

    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    return (
        <>
            <DetailPageShell
                backHref="/dashboard/schedule"
                backLabel="Back to schedule"
                actions={
                    <>
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl text-red-600 hover:text-red-600"
                            disabled={deleteSession.isPending}
                            onClick={async () => {
                                try {
                                    await deleteSession.mutateAsync(session.id);
                                    router.push('/dashboard/schedule');
                                } catch {
                                    // toast in hook
                                }
                            }}
                        >
                            {deleteSession.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Cancel
                        </Button>
                        <Button
                            className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => setEditOpen(true)}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit session
                        </Button>
                    </>
                }
                hero={
                    <DetailHero
                        eyebrow="Class session"
                        title={session.title}
                        meta={
                            <>
                                <Badge
                                    className={cn(
                                        'rounded-lg text-white hover:opacity-90',
                                        sessionTypeColors[session.type]
                                    )}
                                >
                                    {sessionTypeLabels[session.type]}
                                </Badge>
                                <Badge variant="secondary" className="rounded-lg capitalize">
                                    {session.status}
                                </Badge>
                            </>
                        }
                        stats={
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:min-w-[140px]">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                    Enrolled
                                </p>
                                <p className="mt-1 text-2xl font-extrabold text-primary">
                                    {session.enrolledCount}/{session.capacity}
                                </p>
                            </div>
                        }
                    />
                }
            >
                <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                        Session details
                    </h2>
                    <Separator className="my-4" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/40 p-4">
                            <Calendar className="mt-0.5 h-4 w-4 text-accent-foreground" />
                            <div>
                                <p className="text-xs text-ink-muted">Date</p>
                                <p className="font-medium text-ink">
                                    {start.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/40 p-4">
                            <Clock className="mt-0.5 h-4 w-4 text-accent-foreground" />
                            <div>
                                <p className="text-xs text-ink-muted">Time</p>
                                <p className="font-medium text-ink">
                                    {start.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}{' '}
                                    –{' '}
                                    {end.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/40 p-4">
                            <Users className="mt-0.5 h-4 w-4 text-accent-foreground" />
                            <div>
                                <p className="text-xs text-ink-muted">Trainer</p>
                                <p className="font-medium text-ink">
                                    {session.trainerName || 'TBD'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/40 p-4">
                            <MapPin className="mt-0.5 h-4 w-4 text-accent-foreground" />
                            <div>
                                <p className="text-xs text-ink-muted">Location</p>
                                <p className="font-medium text-ink">{session.location}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </DetailPageShell>

            <EditSessionModal
                open={editOpen}
                onOpenChange={setEditOpen}
                session={session}
            />
        </>
    );
}
