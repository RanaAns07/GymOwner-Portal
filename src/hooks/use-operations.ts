import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchBookingsFromApi,
    createBookingApi,
    updateBookingApi,
    deleteBookingApi,
} from '@/lib/api/bookings-api';
import {
    fetchWaitlistFromApi,
    createWaitlistEntryApi,
    updateWaitlistEntryApi,
    deleteWaitlistEntryApi,
    fetchAppointmentsFromApi,
    createAppointmentApi,
    updateAppointmentApi,
    deleteAppointmentApi,
    fetchSubstituteRequestsFromApi,
    createSubstituteRequestApi,
    updateSubstituteRequestApi,
    deleteSubstituteRequestApi,
} from '@/lib/api/operations-api';

export const operationsKeys = {
    all: ['operations'] as const,
    bookings: () => [...operationsKeys.all, 'bookings'] as const,
    waitlist: () => [...operationsKeys.all, 'waitlist'] as const,
    appointments: () => [...operationsKeys.all, 'appointments'] as const,
    substitutes: () => [...operationsKeys.all, 'substitutes'] as const,
};

export function useBookings() {
    return useQuery({
        queryKey: operationsKeys.bookings(),
        queryFn: fetchBookingsFromApi,
    });
}

export function useCreateBooking() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createBookingApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.bookings() });
            toast.success('Booking created.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to create booking'),
    });
}

export function useUpdateBooking() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Parameters<typeof updateBookingApi>[1];
        }) => updateBookingApi(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.bookings() });
            toast.success('Booking updated.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update booking'),
    });
}

export function useDeleteBooking() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteBookingApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.bookings() });
            toast.success('Booking removed.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove booking'),
    });
}

export function useWaitlist() {
    return useQuery({
        queryKey: operationsKeys.waitlist(),
        queryFn: fetchWaitlistFromApi,
    });
}

export function useCreateWaitlistEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createWaitlistEntryApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.waitlist() });
            toast.success('Added to waitlist.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to add to waitlist'),
    });
}

export function useUpdateWaitlistEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Parameters<typeof updateWaitlistEntryApi>[1];
        }) => updateWaitlistEntryApi(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.waitlist() });
            toast.success('Waitlist entry updated.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update waitlist'),
    });
}

export function useDeleteWaitlistEntry() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteWaitlistEntryApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.waitlist() });
            toast.success('Waitlist entry removed.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove waitlist entry'),
    });
}

export function useAppointments() {
    return useQuery({
        queryKey: operationsKeys.appointments(),
        queryFn: fetchAppointmentsFromApi,
    });
}

export function useCreateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createAppointmentApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.appointments() });
            toast.success('Appointment scheduled.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to create appointment'),
    });
}

export function useUpdateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Parameters<typeof updateAppointmentApi>[1];
        }) => updateAppointmentApi(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.appointments() });
            toast.success('Appointment updated.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update appointment'),
    });
}

export function useDeleteAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteAppointmentApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.appointments() });
            toast.success('Appointment removed.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove appointment'),
    });
}

export function useSubstituteRequests() {
    return useQuery({
        queryKey: operationsKeys.substitutes(),
        queryFn: fetchSubstituteRequestsFromApi,
    });
}

export function useCreateSubstituteRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createSubstituteRequestApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.substitutes() });
            toast.success('Substitute request created.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to create request'),
    });
}

export function useUpdateSubstituteRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Parameters<typeof updateSubstituteRequestApi>[1];
        }) => updateSubstituteRequestApi(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.substitutes() });
            toast.success('Substitute request updated.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update request'),
    });
}

export function useDeleteSubstituteRequest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteSubstituteRequestApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: operationsKeys.substitutes() });
            toast.success('Substitute request removed.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove request'),
    });
}
