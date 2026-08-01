/**
 * Ledger APIs — tenant and platform ledgers (read-only)
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';

export interface BackendLedgerEntry {
    id: string;
    description?: string;
    amount?: string | number;
    currency?: string;
    entry_type?: string;
    type?: string;
    status?: string;
    reference?: string;
    created_at?: string;
    timestamp?: string;
    location?: string;
    location_name?: string;
    [key: string]: unknown;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

export async function fetchTenantLedgersFromApi(): Promise<BackendLedgerEntry[]> {
    const response = await apiClient.get<
        BackendLedgerEntry[] | ApiPaginatedResponse<BackendLedgerEntry>
    >('/scheduling/tenant-ledgers/');
    return unwrapList(response);
}

export async function fetchPlatformLedgersFromApi(): Promise<BackendLedgerEntry[]> {
    const response = await apiClient.get<
        BackendLedgerEntry[] | ApiPaginatedResponse<BackendLedgerEntry>
    >('/scheduling/platform-ledgers/');
    return unwrapList(response);
}
