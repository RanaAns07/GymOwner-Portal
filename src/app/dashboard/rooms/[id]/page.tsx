'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    DetailHero,
    DetailPageShell,
} from '@/components/layout/detail-page-shell';
import { RoomFormModal } from '@/components/rooms/room-form-modal';
import { useRooms } from '@/hooks/use-rooms';
import { useLocations } from '@/hooks/use-locations';
import { ArrowLeft, DoorOpen, MapPin, Pencil, Users } from 'lucide-react';

export default function RoomDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: rooms, isLoading } = useRooms();
    const { data: locations = [] } = useLocations();
    const [editOpen, setEditOpen] = useState(false);

    const room = useMemo(() => rooms?.find((r) => r.id === id), [rooms, id]);
    const locationName = locations.find((l) => l.id === room?.location)?.name;

    if (isLoading) {
        return (
            <div className="-m-6 bg-[#0b1220] px-6 py-10 lg:-m-8">
                <Skeleton className="h-10 w-56 bg-white/10" />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-lg font-semibold text-ink">Room not found</p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/dashboard/rooms">
                        <ArrowLeft className="h-4 w-4" />
                        Back to rooms
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <DetailPageShell
                backHref="/dashboard/rooms"
                backLabel="Back to rooms"
                actions={
                    <Button
                        className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit room
                    </Button>
                }
                hero={
                    <DetailHero
                        eyebrow="Room"
                        title={room.name}
                        meta={
                            <>
                                <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-sm text-white/90">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {locationName || 'Location'}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-sm text-white/90">
                                    <Users className="h-3.5 w-3.5" />
                                    Capacity {room.capacity}
                                </span>
                            </>
                        }
                    />
                }
            >
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Overview
                        </h2>
                        <Separator className="my-4" />
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <DoorOpen className="h-4 w-4 text-accent-foreground" />
                                <span className="font-medium text-ink">{room.name}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-accent-foreground" />
                                <Link
                                    href={`/dashboard/locations/${room.location}`}
                                    className="font-medium text-accent-foreground hover:underline"
                                >
                                    {locationName || room.location}
                                </Link>
                            </li>
                            <li className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-accent-foreground" />
                                <span className="font-medium text-ink">
                                    {room.capacity} people
                                </span>
                            </li>
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Equipment
                        </h2>
                        <Separator className="my-4" />
                        {(room.equipment_tags || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {room.equipment_tags!.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="rounded-lg font-normal"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-ink-muted">No equipment tags.</p>
                        )}
                    </section>
                </div>
            </DetailPageShell>

            <RoomFormModal open={editOpen} onOpenChange={setEditOpen} room={room} />
        </>
    );
}
