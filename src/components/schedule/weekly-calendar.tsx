'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Session } from '@/types/schedule';
import { sessionTypeColors } from '@/types/schedule';
import { Users, MapPin } from 'lucide-react';

interface WeeklyCalendarProps {
    sessions: Session[];
    isLoading?: boolean;
    onSlotClick?: (day: Date, hour: number) => void;
    onSessionClick?: (session: Session) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(): Date[] {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return date;
    });
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function getSessionPosition(session: Session) {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    const startHour = start.getHours();
    const startMinutes = start.getMinutes();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();

    const top = ((startHour - 6) * 60 + startMinutes) / 60;
    const duration = ((endHour - startHour) * 60 + (endMinutes - startMinutes)) / 60;

    return { top, height: duration };
}

function SessionSlot({
    session,
    onClick
}: {
    session: Session;
    onClick?: (session: Session) => void;
}) {
    const { top, height } = getSessionPosition(session);
    const isFull = session.enrolledCount >= session.capacity;

    return (
        <div
            onClick={() => onClick?.(session)}
            className={cn(
                "absolute inset-x-1 rounded-lg border border-white/20 p-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg overflow-hidden",
                sessionTypeColors[session.type],
                "text-white"
            )}
            style={{
                top: `${top * 64}px`,
                height: `${Math.max(height * 64 - 4, 40)}px`,
            }}
        >
            <div className="flex flex-col h-full">
                <p className="font-semibold text-sm leading-tight truncate">
                    {session.title}
                </p>
                {height >= 1 && (
                    <>
                        <p className="text-xs opacity-90 mt-0.5">
                            {formatTime(new Date(session.startTime))} - {formatTime(new Date(session.endTime))}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-xs opacity-80">
                            <div className="flex items-center gap-0.5">
                                <Users className="h-3 w-3" />
                                <span>{session.enrolledCount}/{session.capacity}</span>
                            </div>
                            {height >= 1.5 && (
                                <div className="flex items-center gap-0.5 truncate">
                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{session.location}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
                {isFull && (
                    <Badge
                        className="absolute top-1 right-1 bg-white/20 text-white text-[10px] px-1.5 py-0"
                    >
                        Full
                    </Badge>
                )}
            </div>
        </div>
    );
}

export function WeeklyCalendar({
    sessions,
    isLoading,
    onSlotClick,
    onSessionClick
}: WeeklyCalendarProps) {
    const weekDates = useMemo(() => getWeekDates(), []);
    const today = new Date();

    // Group sessions by day
    const sessionsByDay = useMemo(() => {
        const grouped: Record<string, Session[]> = {};

        sessions.forEach((session) => {
            const date = new Date(session.startTime);
            const dateKey = date.toDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(session);
        });

        return grouped;
    }, [sessions]);

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden">
                <div className="grid grid-cols-8 border-b border-zinc-100">
                    <div className="p-3" />
                    {DAYS.map((day) => (
                        <div key={day} className="p-3 text-center border-l border-zinc-100">
                            <Skeleton className="h-4 w-8 mx-auto mb-1" />
                            <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-8">
                    <div className="col-span-1">
                        {HOURS.slice(0, 8).map((hour) => (
                            <div key={hour} className="h-16 border-b border-zinc-100 p-2">
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                    <div className="col-span-7 grid grid-cols-7">
                        {DAYS.map((day) => (
                            <div key={day} className="border-l border-zinc-100">
                                {HOURS.slice(0, 8).map((hour) => (
                                    <div key={hour} className="h-16 border-b border-zinc-100" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-zinc-100 bg-zinc-50/50">
                <div className="p-3 text-xs font-medium text-zinc-500 text-center">Time</div>
                {weekDates.map((date, index) => {
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                        <div
                            key={index}
                            className={cn(
                                "p-3 text-center border-l border-zinc-100",
                                isToday && "bg-violet-50"
                            )}
                        >
                            <p className="text-xs font-medium text-zinc-500 mb-1">{DAYS[index]}</p>
                            <div
                                className={cn(
                                    "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                                    isToday
                                        ? "bg-violet-600 text-white"
                                        : "text-zinc-900"
                                )}
                            >
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-8 overflow-auto max-h-[600px]">
                {/* Time Column */}
                <div className="col-span-1 bg-zinc-50/30">
                    {HOURS.map((hour) => (
                        <div
                            key={hour}
                            className="h-16 border-b border-zinc-100 px-2 py-1"
                        >
                            <span className="text-xs font-medium text-zinc-500">
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day Columns */}
                {weekDates.map((date, dayIndex) => {
                    const dateKey = date.toDateString();
                    const daySessions = sessionsByDay[dateKey] || [];
                    const isToday = date.toDateString() === today.toDateString();

                    return (
                        <div
                            key={dayIndex}
                            className={cn(
                                "col-span-1 border-l border-zinc-100 relative",
                                isToday && "bg-violet-50/30"
                            )}
                        >
                            {/* Hour slots */}
                            {HOURS.map((hour) => (
                                <div
                                    key={hour}
                                    className="h-16 border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                                    onClick={() => onSlotClick?.(date, hour)}
                                />
                            ))}

                            {/* Sessions */}
                            {daySessions.map((session) => (
                                <SessionSlot
                                    key={session.id}
                                    session={session}
                                    onClick={onSessionClick}
                                />
                            ))}

                            {/* Current time indicator */}
                            {isToday && (
                                <div
                                    className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
                                    style={{
                                        top: `${((today.getHours() - 6) * 60 + today.getMinutes()) / 60 * 64}px`,
                                    }}
                                >
                                    <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
