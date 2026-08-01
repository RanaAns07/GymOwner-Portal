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
import { LocationFormModal } from '@/components/locations/location-form-modal';
import { useLocations } from '@/hooks/use-locations';
import { useRooms } from '@/hooks/use-rooms';
import {
    ArrowLeft,
    Clock,
    DoorOpen,
    MapPin,
    Pencil,
    Phone,
} from 'lucide-react';

export default function LocationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: locations, isLoading } = useLocations();
    const { data: rooms, isLoading: roomsLoading } = useRooms(id);
    const [editOpen, setEditOpen] = useState(false);

    const location = useMemo(
        () => locations?.find((l) => l.id === id),
        [locations, id]
    );

    if (isLoading) {
        return (
            <div className="-m-6 lg:-m-8">
                <div className="bg-[#0b1220] px-6 py-10">
                    <Skeleton className="h-10 w-64 bg-white/10" />
                </div>
            </div>
        );
    }

    if (!location) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-lg font-semibold text-ink">Location not found</p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/dashboard/locations">
                        <ArrowLeft className="h-4 w-4" />
                        Back to locations
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <DetailPageShell
                backHref="/dashboard/locations"
                backLabel="Back to locations"
                actions={
                    <>
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl"
                            asChild
                        >
                            <Link href="/dashboard/rooms">
                                <DoorOpen className="h-4 w-4" />
                                Rooms
                            </Link>
                        </Button>
                        <Button
                            className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => setEditOpen(true)}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Button>
                    </>
                }
                hero={
                    <DetailHero
                        eyebrow="Location"
                        title={location.name}
                        meta={
                            <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-sm text-white/90">
                                <MapPin className="h-3.5 w-3.5" />
                                {location.address || 'No address'}
                            </span>
                        }
                        stats={
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:min-w-[140px]">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                    Rooms
                                </p>
                                <p className="mt-1 text-2xl font-extrabold text-primary">
                                    {roomsLoading ? '—' : rooms?.length ?? 0}
                                </p>
                            </div>
                        }
                    />
                }
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Details
                        </h2>
                        <Separator className="my-4" />
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 text-accent-foreground" />
                                <div>
                                    <p className="text-xs text-ink-muted">Address</p>
                                    <p className="font-medium text-ink">
                                        {location.address || '—'}
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="mt-0.5 h-4 w-4 text-accent-foreground" />
                                <div>
                                    <p className="text-xs text-ink-muted">Timezone</p>
                                    <p className="font-medium text-ink">
                                        {location.timezone || '—'}
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 text-accent-foreground" />
                                <div>
                                    <p className="text-xs text-ink-muted">Phone</p>
                                    <p className="font-medium text-ink">
                                        {location.phone || '—'}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                                Rooms at this location
                            </h2>
                            <Button variant="link" className="text-accent-foreground" asChild>
                                <Link href="/dashboard/rooms">Manage rooms</Link>
                            </Button>
                        </div>
                        <Separator className="my-4" />
                        {roomsLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-14 rounded-xl" />
                                <Skeleton className="h-14 rounded-xl" />
                            </div>
                        ) : rooms && rooms.length > 0 ? (
                            <ul className="space-y-2">
                                {rooms.map((room) => (
                                    <li key={room.id}>
                                        <Link
                                            href={`/dashboard/rooms/${room.id}`}
                                            className="flex items-center justify-between rounded-xl border border-border bg-canvas/40 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-card"
                                        >
                                            <div className="flex items-center gap-3">
                                                <DoorOpen className="h-4 w-4 text-accent-foreground" />
                                                <span className="font-medium text-ink">
                                                    {room.name}
                                                </span>
                                            </div>
                                            <Badge variant="secondary" className="rounded-lg">
                                                Cap {room.capacity}
                                            </Badge>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-ink-muted">No rooms at this location yet.</p>
                        )}
                    </section>
                </div>
            </DetailPageShell>

            <LocationFormModal
                open={editOpen}
                onOpenChange={setEditOpen}
                location={location}
            />
        </>
    );
}
