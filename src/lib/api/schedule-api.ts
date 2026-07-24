/**
 * Schedule API — Gym Scheduling System (web / owner portal)
 *
 * Locations, rooms, class templates, recurrence rules, sessions.
 *
 * Session creation flow (per API guide):
 * 1) location → 2) room (optional) → 3) class template → 4) recurrence rule
 *    (expands ClassSession rows)
 *
 * Sessions:
 * GET    /api/v1/scheduling/sessions/?location=&date_from=&date_to=
 * GET    /api/v1/scheduling/sessions/{id}/
 * PATCH  /api/v1/scheduling/sessions/{id}/
 * DELETE /api/v1/scheduling/sessions/{id}/
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';
import type { Session, CreateSessionInput, SessionType } from '@/types/schedule';

export interface BackendLocation {
    id: string;
    name: string;
    address?: string;
    timezone?: string;
    phone?: string;
}

export interface BackendRoom {
    id: string;
    location: string;
    name: string;
    capacity: number;
    equipment_tags?: string[];
}

export interface BackendClassTemplate {
    id: string;
    location: string;
    name: string;
    duration_min: number;
    default_capacity?: number;
    intensity?: string;
    category?: string;
}

export interface BackendRecurrenceRule {
    id: string;
    template: string;
    days_of_week: string[];
    start_date: string;
    end_date: string;
    start_time: string;
    room?: string | null;
    staff?: string | null;
}

interface BackendSession {
    id: string;
    title?: string;
    name?: string;
    template?: string;
    template_name?: string;
    staff?: string | null;
    staff_name?: string | null;
    room?: string | null;
    room_name?: string | null;
    location?: string | null;
    location_name?: string | null;
    start_at?: string;
    end_at?: string;
    start_time?: string;
    end_time?: string;
    capacity?: number;
    default_capacity?: number;
    enrolled_count?: number;
    booked_count?: number;
    spots_taken?: number;
    is_full?: boolean;
    status?: string;
    session_type?: string;
    category?: string;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

function formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
}

/** YYYY-MM-DD in the user's local timezone (avoids UTC day shift) */
function formatLocalDateForApi(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function weekdayName(date: Date): string {
    return date
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
}

function durationMinutes(startIso: string, endIso: string): number {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const mins = Math.round((end - start) / 60000);
    return mins > 0 ? mins : 60;
}

function timeFromIso(iso: string): string {
    // Prefer parsing wall-clock from the string directly (avoids TZ shifts)
    const match = iso.match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
        return `${match[1]}:${match[2]}:${match[3] || '00'}`;
    }
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

/**
 * Backend session datetimes are wall-clock times often serialized with a "Z"
 * (e.g. 19:00 local stored as 19:00Z). Parsing that as real UTC shifts display
 * by the local offset (EDT -4h → 3:00 PM). Strip the zone and keep the clock time.
 */
function normalizeSessionDateTime(value: string): string {
    if (!value) return value;
    const match = value.match(
        /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})(?::(\d{2}))?/
    );
    if (!match) return value;
    const [, date, hm, sec] = match;
    return `${date}T${hm}:${sec || '00'}`;
}

function mapCategoryToSessionType(category?: string | null): SessionType {
    const value = (category || '').toLowerCase();
    if (value.includes('personal') || value.includes('pt')) return 'personal-training';
    if (value.includes('workshop')) return 'workshop';
    if (value.includes('open')) return 'open-gym';
    return 'group-class';
}

function mapSessionTypeToCategory(type: SessionType): string {
    switch (type) {
        case 'personal-training':
            return 'personal-training';
        case 'workshop':
            return 'workshop';
        case 'open-gym':
            return 'open-gym';
        default:
            return 'group-class';
    }
}

function mapBackendSessionToSession(session: BackendSession): Session {
    const start = normalizeSessionDateTime(session.start_at || session.start_time || '');
    const end = normalizeSessionDateTime(session.end_at || session.end_time || '');
    const capacity = session.capacity ?? session.default_capacity ?? 0;
    const enrolled =
        session.enrolled_count ??
        session.booked_count ??
        session.spots_taken ??
        (session.is_full ? capacity : 0);

    let status: Session['status'] = 'open';
    if (session.status === 'cancelled') status = 'cancelled';
    else if (session.is_full || (capacity > 0 && enrolled >= capacity)) status = 'full';
    else if (session.status === 'completed') status = 'completed';
    else if (session.status === 'in_progress' || session.status === 'in-progress') {
        status = 'in-progress';
    } else if (session.status === 'scheduled') status = 'scheduled';

    return {
        id: session.id,
        title: session.title || session.name || session.template_name || 'Class Session',
        type: mapCategoryToSessionType(session.category || session.session_type),
        trainerId: session.staff || '',
        trainerName: session.staff_name || 'TBD',
        startTime: start,
        endTime: end,
        capacity,
        enrolledCount: enrolled,
        location: session.location_name || session.room_name || 'Studio',
        status,
    };
}

// ─── Locations ───────────────────────────────────────────────────────────────

/** GET /api/v1/scheduling/locations/ */
export async function fetchLocationsFromApi(): Promise<BackendLocation[]> {
    const response = await apiClient.get<BackendLocation[] | ApiPaginatedResponse<BackendLocation>>(
        '/scheduling/locations/'
    );
    return unwrapList(response);
}

/** POST /api/v1/scheduling/locations/ */
export async function createLocationApi(payload: {
    name: string;
    address: string;
    timezone: string;
    phone?: string;
}): Promise<BackendLocation> {
    return apiClient.post<BackendLocation>('/scheduling/locations/', payload);
}

/** GET /api/v1/scheduling/locations/{id}/ */
export async function fetchLocationFromApi(id: string): Promise<BackendLocation> {
    return apiClient.get<BackendLocation>(`/scheduling/locations/${id}/`);
}

/** PATCH /api/v1/scheduling/locations/{id}/ */
export async function updateLocationApi(
    id: string,
    payload: Partial<{
        name: string;
        address: string;
        timezone: string;
        phone: string;
    }>
): Promise<BackendLocation> {
    return apiClient.patch<BackendLocation>(`/scheduling/locations/${id}/`, payload);
}

/** DELETE /api/v1/scheduling/locations/{id}/ */
export async function deleteLocationApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/locations/${id}/`);
}

/** Ensure at least one location exists for session queries / creation */
export async function ensureDefaultLocation(): Promise<BackendLocation> {
    const locations = await fetchLocationsFromApi();
    if (locations.length > 0) return locations[0];

    return createLocationApi({
        name: 'Main Studio',
        address: 'Primary location',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    });
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

/** GET /api/v1/scheduling/rooms/?location= */
export async function fetchRoomsFromApi(locationId?: string): Promise<BackendRoom[]> {
    const query = locationId ? `?location=${locationId}` : '';
    const response = await apiClient.get<BackendRoom[] | ApiPaginatedResponse<BackendRoom>>(
        `/scheduling/rooms/${query}`
    );
    return unwrapList(response);
}

/** POST /api/v1/scheduling/rooms/ */
export async function createRoomApi(payload: {
    location: string;
    name: string;
    capacity: number;
    equipment_tags?: string[];
}): Promise<BackendRoom> {
    return apiClient.post<BackendRoom>('/scheduling/rooms/', payload);
}

// ─── Class templates ─────────────────────────────────────────────────────────

/** GET /api/v1/scheduling/class-templates/ */
export async function fetchClassTemplatesFromApi(): Promise<BackendClassTemplate[]> {
    const response = await apiClient.get<
        BackendClassTemplate[] | ApiPaginatedResponse<BackendClassTemplate>
    >('/scheduling/class-templates/');
    return unwrapList(response);
}

/** POST /api/v1/scheduling/class-templates/ */
export async function createClassTemplateApi(payload: {
    location: string;
    name: string;
    duration_min: number;
    default_capacity?: number;
    intensity?: string;
    category?: string;
}): Promise<BackendClassTemplate> {
    return apiClient.post<BackendClassTemplate>('/scheduling/class-templates/', payload);
}

// ─── Recurrence rules (creates sessions) ─────────────────────────────────────

/** GET /api/v1/scheduling/recurrence-rules/ */
export async function fetchRecurrenceRulesFromApi(): Promise<BackendRecurrenceRule[]> {
    const response = await apiClient.get<
        BackendRecurrenceRule[] | ApiPaginatedResponse<BackendRecurrenceRule>
    >('/scheduling/recurrence-rules/');
    return unwrapList(response);
}

/**
 * POST /api/v1/scheduling/recurrence-rules/
 * Backend expands ClassSession rows between start_date and end_date.
 */
export async function createRecurrenceRuleApi(payload: {
    template: string;
    days_of_week: string[];
    start_date: string;
    end_date: string;
    start_time: string;
    room?: string;
    staff?: string;
}): Promise<BackendRecurrenceRule> {
    return apiClient.post<BackendRecurrenceRule>('/scheduling/recurrence-rules/', payload);
}

/** DELETE /api/v1/scheduling/recurrence-rules/{id}/ */
export async function deleteRecurrenceRuleApi(id: string): Promise<boolean> {
    try {
        await apiClient.delete(`/scheduling/recurrence-rules/${id}/`);
        return true;
    } catch {
        return false;
    }
}

// ─── Sessions ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/scheduling/sessions/
 * Query: location (required), date_from, date_to
 */
export async function fetchSessionsFromApi(weekStart?: Date): Promise<Session[]> {
    const location = await ensureDefaultLocation();

    const start = weekStart ? new Date(weekStart) : new Date();
    // Normalize to Monday of the week if a weekStart was provided loosely
    const day = start.getDay();
    const monday = new Date(start);
    monday.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const params = new URLSearchParams({
        location: location.id,
        date_from: formatLocalDateForApi(monday),
        date_to: formatLocalDateForApi(sunday),
    });

    const response = await apiClient.get<BackendSession[] | ApiPaginatedResponse<BackendSession>>(
        `/scheduling/sessions/?${params.toString()}`
    );

    return unwrapList(response)
        .map(mapBackendSessionToSession)
        // Soft-deleted / cancelled sessions should not appear on the calendar
        .filter((session) => session.status !== 'cancelled');
}

/** GET /api/v1/scheduling/sessions/{id}/ */
export async function fetchSessionFromApi(id: string): Promise<Session | null> {
    try {
        const response = await apiClient.get<BackendSession>(`/scheduling/sessions/${id}/`);
        return mapBackendSessionToSession(response);
    } catch {
        return null;
    }
}

/**
 * Create a session via class template + single-day recurrence rule
 * (official create path — sessions have no POST endpoint).
 */
export async function createSessionApi(data: CreateSessionInput): Promise<Session> {
    let locationId = data.locationId;
    let locationName = data.locationName || 'Studio';

    if (!locationId) {
        const fallback = await ensureDefaultLocation();
        locationId = fallback.id;
        locationName = fallback.name;
    } else if (!data.locationName) {
        try {
            const locations = await fetchLocationsFromApi();
            locationName = locations.find((l) => l.id === locationId)?.name || locationName;
        } catch {
            // keep fallback name
        }
    }

    // Use local calendar date (not UTC) so evening sessions don't shift day
    const sessionLocal = new Date(data.startTime);
    const startDate = formatLocalDateForApi(sessionLocal);
    // Backend requires end_date strictly after start_date for recurrence rules
    const endExclusive = new Date(sessionLocal);
    endExclusive.setDate(endExclusive.getDate() + 1);
    const endDate = formatLocalDateForApi(endExclusive);
    const duration = durationMinutes(data.startTime, data.endTime);

    const template = await createClassTemplateApi({
        location: locationId,
        name: data.title,
        duration_min: duration,
        default_capacity: data.capacity,
        category: mapSessionTypeToCategory(data.type),
    });

    await createRecurrenceRuleApi({
        template: template.id,
        days_of_week: [weekdayName(sessionLocal)],
        start_date: startDate,
        end_date: endDate,
        start_time: timeFromIso(data.startTime),
        staff: data.trainerId || undefined,
    });

    // Recurrence expands sessions asynchronously/server-side; return optimistic Session
    return {
        id: template.id,
        title: data.title,
        type: data.type,
        trainerId: data.trainerId,
        trainerName: 'TBD',
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
        enrolledCount: 0,
        location: locationName,
        status: 'scheduled',
    };
}

/** PATCH /api/v1/scheduling/sessions/{id}/ */
export async function updateSessionApi(
    id: string,
    data: Partial<{
        title: string;
        startTime: string;
        endTime: string;
        capacity: number;
        trainerId: string;
        location: string;
        roomUrl: string;
    }>
): Promise<Session> {
    const payload: Record<string, unknown> = {};

    if (data.title !== undefined) payload.title = data.title;
    if (data.startTime !== undefined) {
        payload.start_at = data.startTime;
        payload.start_time = data.startTime;
    }
    if (data.endTime !== undefined) {
        payload.end_at = data.endTime;
        payload.end_time = data.endTime;
    }
    if (data.capacity !== undefined) payload.capacity = data.capacity;
    if (data.trainerId !== undefined) payload.staff = data.trainerId;

    const response = await apiClient.patch<BackendSession>(`/scheduling/sessions/${id}/`, payload);
    return mapBackendSessionToSession(response);
}

/** DELETE /api/v1/scheduling/sessions/{id}/ */
export async function deleteSessionApi(id: string): Promise<void> {
    try {
        await apiClient.delete(`/scheduling/sessions/${id}/`);
    } catch (error) {
        // Some backends soft-cancel instead of hard-delete
        const status =
            error && typeof error === 'object' && 'status' in error
                ? Number((error as { status: number }).status)
                : 0;
        if (status === 405 || status === 404) {
            await apiClient.patch(`/scheduling/sessions/${id}/`, { status: 'cancelled' });
            return;
        }
        throw error;
    }
}
