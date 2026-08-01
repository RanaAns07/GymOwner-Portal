/**
 * Facility Access Logs — client gym check-in/out history
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';

export interface BackendFacilityAccess {
    id: string;
    client: string;
    client_name?: string;
    location: string;
    location_name?: string;
    checked_in_at?: string;
    checked_out_at?: string | null;
    created_at?: string;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

export async function fetchFacilityAccessFromApi(): Promise<BackendFacilityAccess[]> {
    const response = await apiClient.get<
        BackendFacilityAccess[] | ApiPaginatedResponse<BackendFacilityAccess>
    >('/scheduling/facility-access/');
    return unwrapList(response);
}

export async function createFacilityAccessApi(payload: {
    client: string;
    location: string;
}): Promise<BackendFacilityAccess> {
    return apiClient.post<BackendFacilityAccess>('/scheduling/facility-access/', payload);
}

export async function checkOutFacilityAccessApi(id: string): Promise<BackendFacilityAccess> {
    return apiClient.post<BackendFacilityAccess>(
        `/scheduling/facility-access/${id}/check_out/`,
        {}
    );
}

export async function updateFacilityAccessApi(
    id: string,
    payload: Partial<{ client: string; location: string }>
): Promise<BackendFacilityAccess> {
    return apiClient.patch<BackendFacilityAccess>(
        `/scheduling/facility-access/${id}/`,
        payload
    );
}

export async function deleteFacilityAccessApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/facility-access/${id}/`);
}
