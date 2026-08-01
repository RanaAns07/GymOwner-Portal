import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchRoomsFromApi,
    createRoomApi,
    updateRoomApi,
    deleteRoomApi,
    type BackendRoom,
} from '@/lib/api/schedule-api';
import { useLocationFilter } from '@/providers/location-context';

export const roomKeys = {
    all: ['rooms'] as const,
    lists: () => [...roomKeys.all, 'list'] as const,
    list: (locationId?: string) => [...roomKeys.lists(), locationId ?? 'all'] as const,
};

export function useRooms(locationOverride?: string) {
    const { locationId, isAllLocations } = useLocationFilter();
    const filter =
        locationOverride ??
        (isAllLocations ? undefined : locationId === 'all' ? undefined : locationId);

    return useQuery({
        queryKey: roomKeys.list(filter ?? 'all'),
        queryFn: () => fetchRoomsFromApi(filter),
    });
}

export function useCreateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: {
            location: string;
            name: string;
            capacity: number;
            equipment_tags?: string[];
        }) => createRoomApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
            toast.success('Room created.');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to create room');
        },
    });
}

export function useUpdateRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Partial<{
                location: string;
                name: string;
                capacity: number;
                equipment_tags: string[];
            }>;
        }) => updateRoomApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
            toast.success('Room updated.');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to update room');
        },
    });
}

export function useDeleteRoom() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRoomApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
            toast.success('Room removed.');
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to remove room');
        },
    });
}

export type { BackendRoom };
