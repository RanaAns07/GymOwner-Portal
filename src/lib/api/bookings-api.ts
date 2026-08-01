/**
 * Bookings API — client reservations for class sessions
 * GET/POST /scheduling/bookings/
 * PATCH/DELETE /scheduling/bookings/{id}/
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';

export interface BackendBooking {
    id: string;
    session: string;
    session_name?: string;
    client?: string;
    client_name?: string;
    join_mode?: string;
    music_preference?: string;
    status?: string;
    checked_in_at?: string | null;
    created_at?: string;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

export async function fetchBookingsFromApi(): Promise<BackendBooking[]> {
    const response = await apiClient.get<
        BackendBooking[] | ApiPaginatedResponse<BackendBooking>
    >('/scheduling/bookings/');
    return unwrapList(response);
}

export async function createBookingApi(payload: {
    session: string;
    join_mode?: string;
    music_preference?: string;
}): Promise<BackendBooking> {
    return apiClient.post<BackendBooking>('/scheduling/bookings/', payload);
}

export async function updateBookingApi(
    id: string,
    payload: Partial<{
        join_mode: string;
        music_preference: string;
        status: string;
        checked_in_at: string;
    }>
): Promise<BackendBooking> {
    return apiClient.patch<BackendBooking>(`/scheduling/bookings/${id}/`, payload);
}

export async function deleteBookingApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/bookings/${id}/`);
}
