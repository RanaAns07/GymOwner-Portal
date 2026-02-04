'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WeeklyCalendar } from '@/components/schedule/weekly-calendar';
import { CreateSessionModal } from '@/components/schedule/create-session-modal';
import { EditSessionModal } from '@/components/schedule/edit-session-modal';
import { useSessions } from '@/hooks/use-schedule';
import { sessionTypeLabels, sessionTypeColors } from '@/types/schedule';
import type { Session } from '@/types/schedule';
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { data: sessions, isLoading } = useSessions(currentWeek);

    // Modal state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
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
        prev.setDate(currentWeek.getDate() - 7);
        setCurrentWeek(prev);
    };

    const goToNextWeek = () => {
        const next = new Date(currentWeek);
        next.setDate(currentWeek.getDate() + 7);
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
        setSelectedSession(session);
        setEditModalOpen(true);
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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Schedule</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Manage classes, sessions, and trainer schedules.
                    </p>
                </div>
                <Button
                    onClick={handleNewSession}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    New Session
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                            <Calendar className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">This Week</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalSessions} sessions</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                            <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Enrolled</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalEnrolled}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Capacity</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalCapacity}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <Users className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Fill Rate</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
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
                    <h2 className="text-lg font-semibold text-zinc-900">{getWeekRange()}</h2>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2">
                    {(Object.entries(sessionTypeLabels) as [keyof typeof sessionTypeColors, string][]).map(
                        ([type, label]) => (
                            <div key={type} className="flex items-center gap-1.5">
                                <div className={cn("h-3 w-3 rounded", sessionTypeColors[type])} />
                                <span className="text-xs text-zinc-600">{label}</span>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Weekly Calendar */}
            <WeeklyCalendar
                sessions={sessions || []}
                isLoading={isLoading}
                onSlotClick={handleSlotClick}
                onSessionClick={handleSessionClick}
            />

            {/* Create Session Modal */}
            <CreateSessionModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                initialDate={slotDate}
                initialHour={slotHour}
            />

            {/* Edit Session Modal */}
            <EditSessionModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                session={selectedSession}
            />
        </div>
    );
}
