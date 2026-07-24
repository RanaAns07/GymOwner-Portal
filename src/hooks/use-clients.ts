import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchClientsFromApi,
    fetchClientPassesFromApi,
    assignPassToClientApi,
    bulkAssignClientsToStaffApi,
    type ClientPass,
} from '@/lib/api/clients-api';

export const clientKeys = {
    all: ['clients'] as const,
    lists: () => [...clientKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...clientKeys.lists(), filters] as const,
    details: () => [...clientKeys.all, 'detail'] as const,
    detail: (id: string) => [...clientKeys.details(), id] as const,
    passes: (clientId: string) => [...clientKeys.detail(clientId), 'passes'] as const,
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

export { type ClientPass };
