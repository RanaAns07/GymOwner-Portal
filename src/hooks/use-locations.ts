import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchLocationsFromApi,
    createLocationApi,
    updateLocationApi,
    deleteLocationApi,
    type BackendLocation,
} from '@/lib/api/schedule-api';
import {
    fetchStaffLocationsFromApi,
    assignStaffLocationApi,
    removeStaffLocationApi,
} from '@/lib/api/staff-api';
import { scheduleKeys } from '@/hooks/use-schedule';

export const locationKeys = {
    all: ['locations'] as const,
    lists: () => [...locationKeys.all, 'list'] as const,
    staffAssignments: () => [...locationKeys.all, 'staff-assignments'] as const,
    staffAssignmentsByStaff: (staffId: string) =>
        [...locationKeys.staffAssignments(), staffId] as const,
};

export function useLocations() {
    return useQuery({
        queryKey: locationKeys.lists(),
        queryFn: fetchLocationsFromApi,
    });
}

export function useCreateLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: {
            name: string;
            address: string;
            timezone: string;
            phone?: string;
        }) => createLocationApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: scheduleKeys.locations() });
            toast.success('Location created.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to create location';
            toast.error(message);
        },
    });
}

export function useUpdateLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Partial<{
                name: string;
                address: string;
                timezone: string;
                phone: string;
            }>;
        }) => updateLocationApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: scheduleKeys.locations() });
            toast.success('Location updated.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to update location';
            toast.error(message);
        },
    });
}

export function useDeleteLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteLocationApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: scheduleKeys.locations() });
            toast.success('Location removed.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to remove location';
            toast.error(message);
        },
    });
}

export function useStaffLocations(staffId?: string) {
    return useQuery({
        queryKey: staffId
            ? locationKeys.staffAssignmentsByStaff(staffId)
            : locationKeys.staffAssignments(),
        queryFn: () => fetchStaffLocationsFromApi(staffId),
        enabled: !!staffId,
    });
}

async function refreshStaffLocationQueries(
    queryClient: ReturnType<typeof useQueryClient>,
    staffId: string
) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: locationKeys.staffAssignments() }),
        queryClient.invalidateQueries({
            queryKey: locationKeys.staffAssignmentsByStaff(staffId),
        }),
        queryClient.refetchQueries({
            queryKey: locationKeys.staffAssignmentsByStaff(staffId),
        }),
    ]);
}

export function useAssignStaffLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ staffId, locationId }: { staffId: string; locationId: string }) =>
            assignStaffLocationApi(staffId, locationId),
        onSuccess: async (assignment, { staffId }) => {
            queryClient.setQueryData(
                locationKeys.staffAssignmentsByStaff(staffId),
                (current: unknown) => {
                    const list = Array.isArray(current) ? current : [];
                    if (list.some((item) => item?.id === assignment.id)) return list;
                    return [...list, assignment];
                }
            );
            await refreshStaffLocationQueries(queryClient, staffId);
            toast.success('Location assigned.');
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : 'Failed to assign location';
            toast.error(message);
        },
    });
}

export function useRemoveStaffLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assignmentId }: { assignmentId: string; staffId: string }) =>
            removeStaffLocationApi(assignmentId),
        onSuccess: async (_, { staffId, assignmentId }) => {
            queryClient.setQueryData(
                locationKeys.staffAssignmentsByStaff(staffId),
                (current: unknown) => {
                    const list = Array.isArray(current) ? current : [];
                    return list.filter((item) => item?.id !== assignmentId);
                }
            );
            await refreshStaffLocationQueries(queryClient, staffId);
            toast.success('Location removed from staff.');
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : 'Failed to remove location assignment';
            toast.error(message);
        },
    });
}

export type { BackendLocation };
