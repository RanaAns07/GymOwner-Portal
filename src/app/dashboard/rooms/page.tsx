'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { RoomFormModal } from '@/components/rooms/room-form-modal';
import {
    useRooms,
    useDeleteRoom,
    type BackendRoom,
} from '@/hooks/use-rooms';
import { useLocations } from '@/hooks/use-locations';
import { PageReveal } from '@/components/dashboard/PageReveal';
import {
    DoorOpen,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Users,
    Loader2,
    MapPin,
    Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<BackendRoom | null>(null);
    const [removeTarget, setRemoveTarget] = useState<BackendRoom | null>(null);

    const { data: rooms, isLoading } = useRooms();
    const { data: locations = [] } = useLocations();
    const deleteRoom = useDeleteRoom();

    const locationNameById = useMemo(
        () => new Map(locations.map((l) => [l.id, l.name])),
        [locations]
    );

    const filtered = rooms?.filter((room) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const locName = locationNameById.get(room.location) || '';
        return (
            room.name.toLowerCase().includes(q) ||
            locName.toLowerCase().includes(q) ||
            (room.equipment_tags || []).some((t) => t.toLowerCase().includes(q))
        );
    });

    const totalCapacity = rooms?.reduce((sum, r) => sum + (r.capacity || 0), 0) ?? 0;

    return (
        <PageReveal className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-ink">Rooms</h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Manage studios and spaces across every location.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingRoom(null);
                        setFormOpen(true);
                    }}
                    className="gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    Add Room
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <DoorOpen className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Total rooms</p>
                            <p className="text-2xl font-bold text-ink">{rooms?.length ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <Users className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Combined capacity</p>
                            <p className="text-2xl font-bold text-ink">{totalCapacity}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <MapPin className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Locations</p>
                            <p className="text-2xl font-bold text-ink">{locations.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <Input
                        type="search"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-canvas/50 hover:bg-canvas/50">
                            <TableHead>Room</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Equipment</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                </TableRow>
                            ))
                        ) : filtered && filtered.length > 0 ? (
                            filtered.map((room) => (
                                <TableRow
                                    key={room.id}
                                    className="cursor-pointer"
                                    onClick={() => router.push(`/dashboard/rooms/${room.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium text-ink">
                                            <DoorOpen className="h-4 w-4 text-accent-foreground" />
                                            {room.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-ink-muted">
                                        {locationNameById.get(room.location) || '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-ink">
                                        {room.capacity}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(room.equipment_tags || []).length > 0 ? (
                                                room.equipment_tags!.slice(0, 4).map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="rounded-lg font-normal"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-ink-muted">—</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-ink-muted"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        router.push(`/dashboard/rooms/${room.id}`)
                                                    }
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingRoom(room);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setRemoveTarget(room)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <DoorOpen className="h-8 w-8 text-border" />
                                        <p className="mt-2 text-sm text-ink-muted">No rooms yet</p>
                                        <Button
                                            variant="link"
                                            className="mt-1 text-accent-foreground"
                                            onClick={() => {
                                                setEditingRoom(null);
                                                setFormOpen(true);
                                            }}
                                        >
                                            Add your first room
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <RoomFormModal
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingRoom(null);
                }}
                room={editingRoom}
            />

            <Dialog
                open={!!removeTarget}
                onOpenChange={(open) => {
                    if (!open) setRemoveTarget(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove room?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove{' '}
                            <span className="font-medium text-ink">{removeTarget?.name}</span>.
                            Sessions linked to it may be affected.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setRemoveTarget(null)}
                            disabled={deleteRoom.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteRoom.isPending}
                            onClick={async () => {
                                if (!removeTarget) return;
                                try {
                                    await deleteRoom.mutateAsync(removeTarget.id);
                                    setRemoveTarget(null);
                                } catch {
                                    // toast in hook
                                }
                            }}
                        >
                            {deleteRoom.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing…
                                </>
                            ) : (
                                'Remove'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </PageReveal>
    );
}
