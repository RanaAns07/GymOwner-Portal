'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PageReveal } from '@/components/dashboard/PageReveal';
import {
    useFacilityAccess,
    useCheckInFacilityAccess,
    useCheckOutFacilityAccess,
    useDeleteFacilityAccess,
} from '@/hooks/use-facility-access';
import { useClients } from '@/hooks/use-clients';
import { useLocations } from '@/hooks/use-locations';
import { useLocationFilter } from '@/providers/location-context';
import {
    LogIn,
    LogOut,
    Plus,
    Search,
    Trash2,
    Loader2,
    Activity,
    MapPin,
} from 'lucide-react';

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export default function FacilityAccessPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [checkInOpen, setCheckInOpen] = useState(false);
    const [clientId, setClientId] = useState('');
    const [locationId, setLocationId] = useState('');

    const { data: logs, isLoading } = useFacilityAccess();
    const { data: clients = [] } = useClients();
    const { data: locations = [] } = useLocations();
    const { locationId: filterId, isAllLocations, resolveLocationId } = useLocationFilter();
    const checkIn = useCheckInFacilityAccess();
    const checkOut = useCheckOutFacilityAccess();
    const deleteLog = useDeleteFacilityAccess();

    const filtered = useMemo(() => {
        return (logs || []).filter((log) => {
            if (!isAllLocations && log.location && log.location !== filterId) {
                return false;
            }
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                (log.client_name || log.client || '').toLowerCase().includes(q) ||
                (log.location_name || log.location || '').toLowerCase().includes(q)
            );
        });
    }, [logs, isAllLocations, filterId, searchQuery]);

    const currentlyIn = filtered.filter((l) => !l.checked_out_at).length;

    return (
        <PageReveal className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                        Facility Access
                    </h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Monitor check-ins and check-outs across locations.
                    </p>
                </div>
                <Button
                    className="gap-2 shadow-lg shadow-primary/20"
                    onClick={() => {
                        setLocationId(resolveLocationId() || locations[0]?.id || '');
                        setClientId('');
                        setCheckInOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Check in
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <Activity className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">On site now</p>
                            <p className="text-2xl font-bold text-ink">{currentlyIn}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <LogIn className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Total logs</p>
                            <p className="text-2xl font-bold text-ink">{filtered.length}</p>
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
                        placeholder="Search access logs..."
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
                            <TableHead>Client</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Checked in</TableHead>
                            <TableHead>Checked out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-28" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((log) => {
                                const onSite = !log.checked_out_at;
                                return (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium text-ink">
                                            {log.client_name || log.client}
                                        </TableCell>
                                        <TableCell className="text-sm text-ink-muted">
                                            {log.location_name || log.location}
                                        </TableCell>
                                        <TableCell className="text-sm text-ink-muted">
                                            {formatDateTime(log.checked_in_at || log.created_at)}
                                        </TableCell>
                                        <TableCell className="text-sm text-ink-muted">
                                            {formatDateTime(log.checked_out_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    onSite
                                                        ? 'rounded-lg bg-primary/15 text-accent-foreground'
                                                        : 'rounded-lg'
                                                }
                                            >
                                                {onSite ? 'On site' : 'Checked out'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                {onSite && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        disabled={checkOut.isPending}
                                                        onClick={() => checkOut.mutate(log.id)}
                                                    >
                                                        <LogOut className="h-3.5 w-3.5" />
                                                        Out
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-600"
                                                    onClick={() => deleteLog.mutate(log.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <p className="text-sm text-ink-muted">No access logs yet</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Check in client</DialogTitle>
                        <DialogDescription>
                            Record a facility access entry for a client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Client</Label>
                            <Select value={clientId} onValueChange={setClientId}>
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.firstName} {c.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Select value={locationId} onValueChange={setLocationId}>
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((l) => (
                                        <SelectItem key={l.id} value={l.id}>
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setCheckInOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!clientId || !locationId || checkIn.isPending}
                                onClick={async () => {
                                    await checkIn.mutateAsync({
                                        client: clientId,
                                        location: locationId,
                                    });
                                    setCheckInOpen(false);
                                }}
                            >
                                {checkIn.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LogIn className="mr-2 h-4 w-4" />
                                )}
                                Check in
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageReveal>
    );
}
