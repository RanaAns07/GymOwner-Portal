'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    useBookings,
    useCreateBooking,
    useUpdateBooking,
    useDeleteBooking,
    useWaitlist,
    useCreateWaitlistEntry,
    useDeleteWaitlistEntry,
    useUpdateWaitlistEntry,
    useAppointments,
    useCreateAppointment,
    useDeleteAppointment,
    useSubstituteRequests,
    useCreateSubstituteRequest,
    useUpdateSubstituteRequest,
    useDeleteSubstituteRequest,
} from '@/hooks/use-operations';
import { useClients } from '@/hooks/use-clients';
import { useStaffMembers } from '@/hooks/use-staff';
import { useLocations } from '@/hooks/use-locations';
import { useRooms } from '@/hooks/use-rooms';
import { useSessions } from '@/hooks/use-schedule';
import { useLocationFilter } from '@/providers/location-context';
import {
    CalendarClock,
    ClipboardList,
    Loader2,
    Plus,
    Trash2,
    UserCheck,
    Users,
} from 'lucide-react';

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export default function OperationsPage() {
    const [tab, setTab] = useState('bookings');
    const { resolveLocationId, locations } = useLocationFilter();

    const { data: bookings, isLoading: bookingsLoading } = useBookings();
    const { data: waitlist, isLoading: waitlistLoading } = useWaitlist();
    const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
    const { data: substitutes, isLoading: substitutesLoading } = useSubstituteRequests();
    const { data: clients = [] } = useClients();
    const { data: staff = [] } = useStaffMembers();
    const { data: rooms = [] } = useRooms();
    const { data: sessions = [] } = useSessions();
    const { data: allLocations = [] } = useLocations();

    const createBooking = useCreateBooking();
    const updateBooking = useUpdateBooking();
    const deleteBooking = useDeleteBooking();
    const createWaitlist = useCreateWaitlistEntry();
    const updateWaitlist = useUpdateWaitlistEntry();
    const deleteWaitlist = useDeleteWaitlistEntry();
    const createAppointment = useCreateAppointment();
    const deleteAppointment = useDeleteAppointment();
    const createSub = useCreateSubstituteRequest();
    const updateSub = useUpdateSubstituteRequest();
    const deleteSub = useDeleteSubstituteRequest();

    const [bookingOpen, setBookingOpen] = useState(false);
    const [waitlistOpen, setWaitlistOpen] = useState(false);
    const [appointmentOpen, setAppointmentOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);

    const [bookingForm, setBookingForm] = useState({
        session: '',
        join_mode: 'physical',
        music_preference: '',
    });
    const [waitlistForm, setWaitlistForm] = useState({
        client: '',
        session: '',
        status: 'waiting',
    });
    const [appointmentForm, setAppointmentForm] = useState({
        provider: '',
        location: '',
        room: '',
        start_at: '',
        end_at: '',
        status: 'scheduled',
        credit_source: '',
    });
    const [subForm, setSubForm] = useState({
        session: '',
        requested_by_staff: '',
        status: 'open',
    });

    const locationOptions = allLocations.length ? allLocations : locations;

    const filteredAppointments = useMemo(() => {
        const loc = resolveLocationId();
        if (!loc || appointments === undefined) return appointments;
        // When a specific location is selected in context, prefer matching rows
        return appointments.filter((a) => !a.location || a.location === loc);
    }, [appointments, resolveLocationId]);

    return (
        <PageReveal className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">Operations</h1>
                <p className="mt-1 text-sm text-ink-muted">
                    Bookings, waitlists, private appointments, and substitute coverage.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Bookings', value: bookings?.length ?? 0, icon: ClipboardList },
                    { label: 'Waitlist', value: waitlist?.length ?? 0, icon: Users },
                    { label: 'Appointments', value: appointments?.length ?? 0, icon: CalendarClock },
                    { label: 'Substitutes', value: substitutes?.length ?? 0, icon: UserCheck },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                                <stat.icon className="h-5 w-5 text-accent-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-ink-muted">{stat.label}</p>
                                <p className="text-2xl font-bold text-ink">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Tabs value={tab} onValueChange={setTab} className="space-y-4">
                <TabsList className="h-auto flex-wrap rounded-xl bg-muted p-1">
                    <TabsTrigger value="bookings" className="rounded-lg">Bookings</TabsTrigger>
                    <TabsTrigger value="waitlist" className="rounded-lg">Waitlist</TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-lg">Appointments</TabsTrigger>
                    <TabsTrigger value="substitutes" className="rounded-lg">Substitutes</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings" className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            className="gap-2 shadow-lg shadow-primary/20"
                            onClick={() => setBookingOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            New booking
                        </Button>
                    </div>
                    <OpsTable
                        loading={bookingsLoading}
                        empty="No bookings yet"
                        headers={['Session', 'Mode', 'Music', 'Status', 'Checked in', '']}
                        rows={(bookings || []).map((b) => [
                            b.session_name || b.session,
                            b.join_mode || '—',
                            b.music_preference || '—',
                            <Badge key="s" variant="secondary" className="rounded-lg capitalize">
                                {b.status || 'booked'}
                            </Badge>,
                            formatDateTime(b.checked_in_at),
                            <div key="a" className="flex justify-end gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={updateBooking.isPending}
                                    onClick={() =>
                                        updateBooking.mutate({
                                            id: b.id,
                                            data: {
                                                status: 'checked_in',
                                                checked_in_at: new Date().toISOString(),
                                            },
                                        })
                                    }
                                >
                                    Check in
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => deleteBooking.mutate(b.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>,
                        ])}
                    />
                </TabsContent>

                <TabsContent value="waitlist" className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            className="gap-2 shadow-lg shadow-primary/20"
                            onClick={() => setWaitlistOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Add to waitlist
                        </Button>
                    </div>
                    <OpsTable
                        loading={waitlistLoading}
                        empty="Waitlist is empty"
                        headers={['Client', 'Session', 'Status', 'Offered', 'Expires', '']}
                        rows={(waitlist || []).map((w) => [
                            w.client_name || w.client,
                            w.session_name || w.session,
                            <Badge key="s" variant="secondary" className="rounded-lg capitalize">
                                {w.status || 'waiting'}
                            </Badge>,
                            formatDateTime(w.offered_at),
                            formatDateTime(w.expires_at),
                            <div key="a" className="flex justify-end gap-1">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        updateWaitlist.mutate({
                                            id: w.id,
                                            data: {
                                                status: 'offered',
                                                offered_at: new Date().toISOString(),
                                                expires_at: new Date(
                                                    Date.now() + 60 * 60 * 1000
                                                ).toISOString(),
                                            },
                                        })
                                    }
                                >
                                    Offer
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => deleteWaitlist.mutate(w.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>,
                        ])}
                    />
                </TabsContent>

                <TabsContent value="appointments" className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            className="gap-2 shadow-lg shadow-primary/20"
                            onClick={() => {
                                setAppointmentForm((f) => ({
                                    ...f,
                                    location: resolveLocationId() || locationOptions[0]?.id || '',
                                    provider: staff[0]?.id || '',
                                }));
                                setAppointmentOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            New appointment
                        </Button>
                    </div>
                    <OpsTable
                        loading={appointmentsLoading}
                        empty="No private appointments"
                        headers={['Provider', 'Location', 'Start', 'End', 'Status', '']}
                        rows={(filteredAppointments || []).map((a) => [
                            a.provider_name || a.provider,
                            a.location_name || a.location,
                            formatDateTime(a.start_at),
                            formatDateTime(a.end_at),
                            <Badge key="s" variant="secondary" className="rounded-lg capitalize">
                                {a.status || 'scheduled'}
                            </Badge>,
                            <Button
                                key="d"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600"
                                onClick={() => deleteAppointment.mutate(a.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>,
                        ])}
                    />
                </TabsContent>

                <TabsContent value="substitutes" className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            className="gap-2 shadow-lg shadow-primary/20"
                            onClick={() => setSubOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Request substitute
                        </Button>
                    </div>
                    <OpsTable
                        loading={substitutesLoading}
                        empty="No substitute requests"
                        headers={['Session', 'Requested by', 'Accepted by', 'Status', '']}
                        rows={(substitutes || []).map((s) => [
                            s.session_name || s.session,
                            s.requested_by_name || s.requested_by_staff,
                            s.accepted_by_name || s.accepted_by_staff || '—',
                            <Badge key="s" variant="secondary" className="rounded-lg capitalize">
                                {s.status || 'open'}
                            </Badge>,
                            <div key="a" className="flex justify-end gap-1">
                                {s.status !== 'filled' && (
                                    <Select
                                        onValueChange={(staffId) =>
                                            updateSub.mutate({
                                                id: s.id,
                                                data: {
                                                    accepted_by_staff: staffId,
                                                    status: 'filled',
                                                },
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-8 w-[140px] rounded-lg">
                                            <SelectValue placeholder="Fill with…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staff.map((st) => (
                                                <SelectItem key={st.id} value={st.id}>
                                                    {st.firstName} {st.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-600"
                                    onClick={() => deleteSub.mutate(s.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>,
                        ])}
                    />
                </TabsContent>
            </Tabs>

            {/* Booking dialog */}
            <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>New booking</DialogTitle>
                        <DialogDescription>Reserve a spot on a class session.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Field label="Session">
                            <Select
                                value={bookingForm.session}
                                onValueChange={(v) =>
                                    setBookingForm((f) => ({ ...f, session: v }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select session" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Join mode">
                            <Select
                                value={bookingForm.join_mode}
                                onValueChange={(v) =>
                                    setBookingForm((f) => ({ ...f, join_mode: v }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="physical">Physical</SelectItem>
                                    <SelectItem value="virtual">Virtual</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Music preference">
                            <Input
                                value={bookingForm.music_preference}
                                onChange={(e) =>
                                    setBookingForm((f) => ({
                                        ...f,
                                        music_preference: e.target.value,
                                    }))
                                }
                                placeholder="Upbeat Rock"
                            />
                        </Field>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setBookingOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!bookingForm.session || createBooking.isPending}
                                onClick={async () => {
                                    await createBooking.mutateAsync(bookingForm);
                                    setBookingOpen(false);
                                }}
                            >
                                {createBooking.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Waitlist dialog */}
            <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add to waitlist</DialogTitle>
                        <DialogDescription>Queue a client for a full session.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Field label="Client">
                            <Select
                                value={waitlistForm.client}
                                onValueChange={(v) =>
                                    setWaitlistForm((f) => ({ ...f, client: v }))
                                }
                            >
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
                        </Field>
                        <Field label="Session">
                            <Select
                                value={waitlistForm.session}
                                onValueChange={(v) =>
                                    setWaitlistForm((f) => ({ ...f, session: v }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select session" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setWaitlistOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={
                                    !waitlistForm.client ||
                                    !waitlistForm.session ||
                                    createWaitlist.isPending
                                }
                                onClick={async () => {
                                    await createWaitlist.mutateAsync(waitlistForm);
                                    setWaitlistOpen(false);
                                }}
                            >
                                {createWaitlist.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Add
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Appointment dialog */}
            <Dialog open={appointmentOpen} onOpenChange={setAppointmentOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>New appointment</DialogTitle>
                        <DialogDescription>Schedule a 1-on-1 private session.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Field label="Provider">
                            <Select
                                value={appointmentForm.provider}
                                onValueChange={(v) =>
                                    setAppointmentForm((f) => ({ ...f, provider: v }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staff.map((st) => (
                                        <SelectItem key={st.id} value={st.id}>
                                            {st.firstName} {st.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Location">
                            <Select
                                value={appointmentForm.location}
                                onValueChange={(v) =>
                                    setAppointmentForm((f) => ({ ...f, location: v, room: '' }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locationOptions.map((l) => (
                                        <SelectItem key={l.id} value={l.id}>
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Room (optional)">
                            <Select
                                value={appointmentForm.room || '__none__'}
                                onValueChange={(v) =>
                                    setAppointmentForm((f) => ({
                                        ...f,
                                        room: v === '__none__' ? '' : v,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select room" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">None</SelectItem>
                                    {rooms
                                        .filter(
                                            (r) =>
                                                !appointmentForm.location ||
                                                r.location === appointmentForm.location
                                        )
                                        .map((r) => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Start">
                            <Input
                                type="datetime-local"
                                value={appointmentForm.start_at}
                                onChange={(e) =>
                                    setAppointmentForm((f) => ({
                                        ...f,
                                        start_at: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field label="End">
                            <Input
                                type="datetime-local"
                                value={appointmentForm.end_at}
                                onChange={(e) =>
                                    setAppointmentForm((f) => ({
                                        ...f,
                                        end_at: e.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setAppointmentOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={
                                    !appointmentForm.provider ||
                                    !appointmentForm.location ||
                                    !appointmentForm.start_at ||
                                    !appointmentForm.end_at ||
                                    createAppointment.isPending
                                }
                                onClick={async () => {
                                    const toIso = (local: string) =>
                                        new Date(local).toISOString();
                                    await createAppointment.mutateAsync({
                                        provider: appointmentForm.provider,
                                        location: appointmentForm.location,
                                        room: appointmentForm.room || undefined,
                                        start_at: toIso(appointmentForm.start_at),
                                        end_at: toIso(appointmentForm.end_at),
                                        status: appointmentForm.status,
                                        credit_source:
                                            appointmentForm.credit_source || undefined,
                                    });
                                    setAppointmentOpen(false);
                                }}
                            >
                                {createAppointment.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Schedule
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Substitute dialog */}
            <Dialog open={subOpen} onOpenChange={setSubOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Request substitute</DialogTitle>
                        <DialogDescription>
                            Open a substitute request for a scheduled class.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Field label="Session">
                            <Select
                                value={subForm.session}
                                onValueChange={(v) => setSubForm((f) => ({ ...f, session: v }))}
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select session" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sessions.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Requested by">
                            <Select
                                value={subForm.requested_by_staff}
                                onValueChange={(v) =>
                                    setSubForm((f) => ({ ...f, requested_by_staff: v }))
                                }
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {staff.map((st) => (
                                        <SelectItem key={st.id} value={st.id}>
                                            {st.firstName} {st.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setSubOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={
                                    !subForm.session ||
                                    !subForm.requested_by_staff ||
                                    createSub.isPending
                                }
                                onClick={async () => {
                                    await createSub.mutateAsync({
                                        ...subForm,
                                        accepted_by_staff: null,
                                    });
                                    setSubOpen(false);
                                }}
                            >
                                {createSub.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </PageReveal>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

function OpsTable({
    loading,
    empty,
    headers,
    rows,
}: {
    loading: boolean;
    empty: string;
    headers: string[];
    rows: React.ReactNode[][];
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-canvas/50 hover:bg-canvas/50">
                        {headers.map((h) => (
                            <TableHead key={h || 'actions'}>{h}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                {headers.map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : rows.length > 0 ? (
                        rows.map((row, i) => (
                            <TableRow key={i}>
                                {row.map((cell, j) => (
                                    <TableCell key={j} className="text-sm text-ink">
                                        {cell}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={headers.length}
                                className="h-28 text-center text-sm text-ink-muted"
                            >
                                {empty}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
