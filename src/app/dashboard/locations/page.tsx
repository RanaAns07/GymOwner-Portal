'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { LocationFormModal } from '@/components/locations/location-form-modal';
import {
    useLocations,
    useDeleteLocation,
    type BackendLocation,
} from '@/hooks/use-locations';
import {
    MapPin,
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Phone,
    Clock,
    Loader2,
} from 'lucide-react';
import { PageReveal } from '@/components/dashboard/PageReveal';

export default function LocationsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<BackendLocation | null>(null);
    const [removeTarget, setRemoveTarget] = useState<BackendLocation | null>(null);

    const { data: locations, isLoading } = useLocations();
    const deleteLocation = useDeleteLocation();

    const filtered = locations?.filter((location) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            location.name.toLowerCase().includes(q) ||
            (location.address || '').toLowerCase().includes(q) ||
            (location.timezone || '').toLowerCase().includes(q)
        );
    });

    const openCreate = () => {
        setEditingLocation(null);
        setFormOpen(true);
    };

    const openEdit = (location: BackendLocation) => {
        setEditingLocation(location);
        setFormOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!removeTarget) return;
        try {
            await deleteLocation.mutateAsync(removeTarget.id);
            setRemoveTarget(null);
        } catch {
            // Toast handled in hook
        }
    };

    return (
        <PageReveal className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                        Locations
                    </h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Manage gym locations used for scheduling and staff assignment.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                    Add Location
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <MapPin className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Total locations</p>
                            <p className="text-2xl font-bold text-ink">
                                {locations?.length ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <Input
                        type="search"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-canvas/50 hover:bg-canvas/50">
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Timezone</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                                </TableRow>
                            ))
                        ) : filtered && filtered.length > 0 ? (
                            filtered.map((location) => (
                                <TableRow key={location.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium text-ink">
                                            <MapPin className="h-4 w-4 text-accent-foreground" />
                                            {location.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-ink-muted">
                                        {location.address || '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-ink-muted">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-ink-muted" />
                                            {location.timezone || '—'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-ink-muted">
                                        {location.phone ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5 text-ink-muted" />
                                                {location.phone}
                                            </span>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>
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
                                                <DropdownMenuItem onClick={() => openEdit(location)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setRemoveTarget(location)}
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
                                        <MapPin className="h-8 w-8 text-border" />
                                        <p className="mt-2 text-sm text-ink-muted">
                                            No locations yet
                                        </p>
                                        <Button
                                            variant="link"
                                            className="mt-1 text-accent-foreground"
                                            onClick={openCreate}
                                        >
                                            Add your first location
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <LocationFormModal
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingLocation(null);
                }}
                location={editingLocation}
            />

            <Dialog
                open={!!removeTarget}
                onOpenChange={(open) => {
                    if (!open) setRemoveTarget(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove location?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove{' '}
                            <span className="font-medium text-zinc-800">
                                {removeTarget?.name}
                            </span>
                            . Sessions and staff assignments linked to it may be affected.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setRemoveTarget(null)}
                            disabled={deleteLocation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmRemove}
                            disabled={deleteLocation.isPending}
                        >
                            {deleteLocation.isPending ? (
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
