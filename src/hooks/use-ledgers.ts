import { useQuery } from '@tanstack/react-query';
import {
    fetchTenantLedgersFromApi,
    fetchPlatformLedgersFromApi,
} from '@/lib/api/ledgers-api';

export const ledgerKeys = {
    all: ['ledgers'] as const,
    tenant: () => [...ledgerKeys.all, 'tenant'] as const,
    platform: () => [...ledgerKeys.all, 'platform'] as const,
};

export function useTenantLedgers() {
    return useQuery({
        queryKey: ledgerKeys.tenant(),
        queryFn: fetchTenantLedgersFromApi,
    });
}

export function usePlatformLedgers() {
    return useQuery({
        queryKey: ledgerKeys.platform(),
        queryFn: fetchPlatformLedgersFromApi,
    });
}
