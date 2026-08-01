import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchFacilityAccessFromApi,
    createFacilityAccessApi,
    checkOutFacilityAccessApi,
    deleteFacilityAccessApi,
} from '@/lib/api/facility-access-api';

export const facilityAccessKeys = {
    all: ['facility-access'] as const,
    lists: () => [...facilityAccessKeys.all, 'list'] as const,
};

export function useFacilityAccess() {
    return useQuery({
        queryKey: facilityAccessKeys.lists(),
        queryFn: fetchFacilityAccessFromApi,
    });
}

export function useCheckInFacilityAccess() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createFacilityAccessApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: facilityAccessKeys.lists() });
            toast.success('Client checked in.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Check-in failed'),
    });
}

export function useCheckOutFacilityAccess() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: checkOutFacilityAccessApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: facilityAccessKeys.lists() });
            toast.success('Client checked out.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Check-out failed'),
    });
}

export function useDeleteFacilityAccess() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteFacilityAccessApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: facilityAccessKeys.lists() });
            toast.success('Access log removed.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove log'),
    });
}
