import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchClientsFromApi,
    fetchClientPassesFromApi,
    fetchClientWithPassesFromApi,
    assignPassToClientApi,
    bulkAssignClientsToStaffApi,
    fetchClientsDetailedSchedulingFromApi,
    fetchUserDetailedSchedulingFromApi,
    fetchClientDetailedNutritionFromApi,
    fetchClientDetailedReflectionFromApi,
    toggleUserDeactivateApi,
    type ClientPass,
} from '@/lib/api/clients-api';

export const clientKeys = {
    all: ['clients'] as const,
    lists: () => [...clientKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...clientKeys.lists(), filters] as const,
    details: () => [...clientKeys.all, 'detail'] as const,
    detail: (id: string) => [...clientKeys.details(), id] as const,
    passes: (clientId: string) => [...clientKeys.detail(clientId), 'passes'] as const,
    detailedScheduling: (id: string) =>
        [...clientKeys.detail(id), 'detailed-scheduling'] as const,
    detailedNutrition: (id: string) =>
        [...clientKeys.detail(id), 'detailed-nutrition'] as const,
    detailedReflection: (id: string) =>
        [...clientKeys.detail(id), 'detailed-reflection'] as const,
    detailedList: (params: Record<string, unknown>) =>
        [...clientKeys.all, 'detailed-list', params] as const,
};

export function useClients(filters?: { status?: string }) {
    return useQuery({
        queryKey: clientKeys.list(filters || {}),
        queryFn: async () => {
            let data = await fetchClientsFromApi();

            if (filters?.status) {
                data = data.filter((client) => client.status === filters.status);
            }

            return data;
        },
    });
}

export function useClient(id: string) {
    return useQuery({
        queryKey: clientKeys.detail(id),
        queryFn: async () => {
            const result = await fetchClientWithPassesFromApi(id);
            return result?.client ?? null;
        },
        enabled: !!id,
    });
}

export function useClientPasses(clientId: string) {
    return useQuery({
        queryKey: clientKeys.passes(clientId),
        queryFn: () => fetchClientPassesFromApi(clientId),
        enabled: !!clientId,
    });
}

export function useAssignPass() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: {
            clientId: string;
            packageTypeId: string;
            creditsRemaining: number;
            expiresAt: string;
        }) => assignPassToClientApi(input),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientKeys.passes(clientId) });
            queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
            toast.success('Pricing plan assigned.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to assign pricing plan';
            toast.error(message);
            console.error('Assign pass error:', error);
        },
    });
}

/** POST /api/v1/scheduling/staff-assignments/bulk-assign/ */
export function useBulkAssignClients() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ staffId, clientIds }: { staffId: string; clientIds: string[] }) =>
            bulkAssignClientsToStaffApi(staffId, clientIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
            toast.success('Trainer assigned successfully.');
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : 'Failed to assign clients to trainer';
            toast.error(message);
            console.error('Bulk assign error:', error);
        },
    });
}

export function useClientsDetailedScheduling(params?: {
    page?: number;
    page_size?: number;
    search?: string;
}) {
    return useQuery({
        queryKey: clientKeys.detailedList(params || {}),
        queryFn: () => fetchClientsDetailedSchedulingFromApi(params),
    });
}

export function useClientDetailedScheduling(id: string, enabled = true) {
    return useQuery({
        queryKey: clientKeys.detailedScheduling(id),
        queryFn: () => fetchUserDetailedSchedulingFromApi(id),
        enabled: enabled && !!id,
    });
}

export function useClientDetailedNutrition(id: string, enabled = true) {
    return useQuery({
        queryKey: clientKeys.detailedNutrition(id),
        queryFn: () => fetchClientDetailedNutritionFromApi(id),
        enabled: enabled && !!id,
    });
}

export function useClientDetailedReflection(id: string, enabled = true) {
    return useQuery({
        queryKey: clientKeys.detailedReflection(id),
        queryFn: () => fetchClientDetailedReflectionFromApi(id),
        enabled: enabled && !!id,
    });
}

export function useToggleUserDeactivate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => toggleUserDeactivateApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ['staff'] });
            toast.success('Account status updated.');
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : 'Failed to update account status'
            );
        },
    });
}

export { type ClientPass };
