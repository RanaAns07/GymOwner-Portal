'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { WeeklyCalendar } from '@/components/schedule/weekly-calendar';
import { CreateSessionModal } from '@/components/schedule/create-session-modal';
import { useSessions } from '@/hooks/use-schedule';
import { sessionTypeLabels, sessionTypeColors } from '@/types/schedule';
import type { Session } from '@/types/schedule';
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react';
import { PageReveal } from '@/components/dashboard/PageReveal';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
    const router = useRouter();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { data: sessions, isLoading } = useSessions(currentWeek);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [slotDate, setSlotDate] = useState<Date | undefined>();
    const [slotHour, setSlotHour] = useState<number | undefined>();

    // Format week range
    const getWeekRange = () => {
        const dayOfWeek = currentWeek.getDay();
        const monday = new Date(currentWeek);
        monday.setDate(currentWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const goToPreviousWeek = () => {
        const prev = new Date(currentWeek);
        prev.setDate(prev.getDate() - 7);
        setCurrentWeek(prev);
    };

    const goToNextWeek = () => {
        const next = new Date(currentWeek);
        next.setDate(next.getDate() + 7);
        setCurrentWeek(next);
    };

    const goToToday = () => {
        setCurrentWeek(new Date());
    };

    const handleSlotClick = (day: Date, hour: number) => {
        setSlotDate(day);
        setSlotHour(hour);
        setCreateModalOpen(true);
    };

    const handleSessionClick = (session: Session) => {
        router.push(`/dashboard/schedule/${session.id}`);
    };

    const handleNewSession = () => {
        setSlotDate(undefined);
        setSlotHour(undefined);
        setCreateModalOpen(true);
    };

    // Stats
    const totalSessions = sessions?.length || 0;
    const totalCapacity = sessions?.reduce((acc, s) => acc + s.capacity, 0) || 0;
    const totalEnrolled = sessions?.reduce((acc, s) => acc + s.enrolledCount, 0) || 0;

    return (
        <PageReveal className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-ink">Schedule</h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Manage classes and sessions between 6:00 AM and 8:00 PM.
                    </p>
                </div>
                <Button
                    onClick={handleNewSession}
                    className="gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    New Session
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <Calendar className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">This Week</p>
                            <p className="text-2xl font-bold text-ink">{totalSessions} sessions</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                            <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Total Enrolled</p>
                            <p className="text-2xl font-bold text-ink">{totalEnrolled}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Total Capacity</p>
                            <p className="text-2xl font-bold text-ink">{totalCapacity}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <Users className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Fill Rate</p>
                            <p className="text-2xl font-bold text-ink">
                                {totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                    </Button>
                    <h2 className="text-lg font-semibold text-ink">{getWeekRange()}</h2>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2">
                    {(Object.entries(sessionTypeLabels) as [keyof typeof sessionTypeColors, string][]).map(
                        ([type, label]) => (
                            <div key={type} className="flex items-center gap-1.5">
                                <div className={cn("h-3 w-3 rounded", sessionTypeColors[type])} />
                                <span className="text-xs text-ink-muted">{label}</span>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Weekly Calendar */}
            <WeeklyCalendar
                weekStart={currentWeek}
                sessions={sessions || []}
                isLoading={isLoading}
                onSlotClick={handleSlotClick}
                onSessionClick={handleSessionClick}
            />

            <CreateSessionModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                initialDate={slotDate}
                initialHour={slotHour}
            />
        </PageReveal>
    );
}
