/**
 * Operations APIs — waitlists, appointments, substitute requests
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

export interface BackendWaitlistEntry {
    id: string;
    client: string;
    client_name?: string;
    session: string;
    session_name?: string;
    status?: string;
    offered_at?: string | null;
    expires_at?: string | null;
}

export async function fetchWaitlistFromApi(): Promise<BackendWaitlistEntry[]> {
    const response = await apiClient.get<
        BackendWaitlistEntry[] | ApiPaginatedResponse<BackendWaitlistEntry>
    >('/scheduling/waitlist/');
    return unwrapList(response);
}

export async function createWaitlistEntryApi(payload: {
    client: string;
    session: string;
    status?: string;
    offered_at?: string;
    expires_at?: string;
}): Promise<BackendWaitlistEntry> {
    return apiClient.post<BackendWaitlistEntry>('/scheduling/waitlist/', payload);
}

export async function updateWaitlistEntryApi(
    id: string,
    payload: Partial<{
        client: string;
        session: string;
        status: string;
        offered_at: string;
        expires_at: string;
    }>
): Promise<BackendWaitlistEntry> {
    return apiClient.patch<BackendWaitlistEntry>(`/scheduling/waitlist/${id}/`, payload);
}

export async function deleteWaitlistEntryApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/waitlist/${id}/`);
}

// ─── Appointments ────────────────────────────────────────────────────────────

export interface BackendAppointment {
    id: string;
    provider: string;
    provider_name?: string;
    location: string;
    location_name?: string;
    room?: string | null;
    room_name?: string;
    start_at: string;
    end_at: string;
    status?: string;
    credit_source?: string | null;
}

export async function fetchAppointmentsFromApi(): Promise<BackendAppointment[]> {
    const response = await apiClient.get<
        BackendAppointment[] | ApiPaginatedResponse<BackendAppointment>
    >('/scheduling/appointments/');
    return unwrapList(response);
}

export async function createAppointmentApi(payload: {
    provider: string;
    location: string;
    room?: string;
    start_at: string;
    end_at: string;
    status?: string;
    credit_source?: string;
}): Promise<BackendAppointment> {
    return apiClient.post<BackendAppointment>('/scheduling/appointments/', payload);
}

export async function updateAppointmentApi(
    id: string,
    payload: Partial<{
        provider: string;
        location: string;
        room: string;
        start_at: string;
        end_at: string;
        status: string;
        credit_source: string;
    }>
): Promise<BackendAppointment> {
    return apiClient.patch<BackendAppointment>(`/scheduling/appointments/${id}/`, payload);
}

export async function deleteAppointmentApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/appointments/${id}/`);
}

// ─── Substitute requests ─────────────────────────────────────────────────────

export interface BackendSubstituteRequest {
    id: string;
    session: string;
    session_name?: string;
    requested_by_staff: string;
    requested_by_name?: string;
    accepted_by_staff?: string | null;
    accepted_by_name?: string;
    status?: string;
}

export async function fetchSubstituteRequestsFromApi(): Promise<BackendSubstituteRequest[]> {
    const response = await apiClient.get<
        BackendSubstituteRequest[] | ApiPaginatedResponse<BackendSubstituteRequest>
    >('/scheduling/substitute-requests/');
    return unwrapList(response);
}

export async function createSubstituteRequestApi(payload: {
    session: string;
    requested_by_staff: string;
    accepted_by_staff?: string | null;
    status?: string;
}): Promise<BackendSubstituteRequest> {
    return apiClient.post<BackendSubstituteRequest>(
        '/scheduling/substitute-requests/',
        payload
    );
}

export async function updateSubstituteRequestApi(
    id: string,
    payload: Partial<{
        session: string;
        requested_by_staff: string;
        accepted_by_staff: string | null;
        status: string;
    }>
): Promise<BackendSubstituteRequest> {
    return apiClient.patch<BackendSubstituteRequest>(
        `/scheduling/substitute-requests/${id}/`,
        payload
    );
}

export async function deleteSubstituteRequestApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/substitute-requests/${id}/`);
}
