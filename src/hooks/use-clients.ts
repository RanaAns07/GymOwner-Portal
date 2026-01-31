import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '@/lib/mock-data/clients';

export const clientKeys = {
    all: ['clients'] as const,
    lists: () => [...clientKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...clientKeys.lists(), filters] as const,
};

export function useClients(filters?: { status?: string }) {
    return useQuery({
        queryKey: clientKeys.list(filters || {}),
        queryFn: async () => {
            let data = await fetchClients();

            if (filters?.status) {
                data = data.filter((client) => client.status === filters.status);
            }

            return data;
        },
    });
}
