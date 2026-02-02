/**
 * Schedule API Service
 * 
 * Real API calls to the backend for session management.
 * 
 * Backend Endpoints:
 * - GET /api/v1/scheduling/sessions/ - List sessions
 * - POST /api/v1/scheduling/sessions/ - Create session
 * - GET /api/v1/scheduling/sessions/:id/ - Get session
 * - PATCH /api/v1/scheduling/sessions/:id/ - Update session
 * - DELETE /api/v1/scheduling/sessions/:id/ - Delete session
 * 
 * Backend Session Model:
 * {
 *   id: string (UUID),
 *   title: string,
 *   staff: string (UUID) - FK to User,
 *   staff_name: string (read-only, from staff.profile.nickname),
 *   start_time: string (ISO datetime),
 *   end_time: string (ISO datetime),
 *   capacity: number,
 *   session_type: 'physical' | 'virtual',
 *   meeting_url: string | null,
 *   is_full: boolean (read-only)
 * }
 */

import { apiClient } from '@/lib/api';
import type { Session, CreateSessionInput, SessionType } from '@/types/schedule';

// Backend response types (matching Django serializers)
interface BackendSession {
    id: string;
    title: string;
    staff: string;
    staff_name: string;
    start_time: string;
    end_time: string;
    capacity: number;
    session_type: 'physical' | 'virtual' | 'workshop' | 'open_gym';
    meeting_url: string | null;
    is_full: boolean;
}

interface BackendPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

interface BackendCreateSessionRequest {
    title: string;
    staff: string;
    start_time: string;
    end_time: string;
    capacity: number;
    session_type: 'physical' | 'virtual' | 'workshop' | 'open_gym';
    meeting_url?: string;
}

/**
 * Maps backend session_type to frontend SessionType
 */
function mapBackendSessionType(backendType: string): SessionType {
    switch (backendType) {
        case 'physical':
            return 'group-class';
        case 'virtual':
            return 'personal-training';
        case 'workshop':
            return 'workshop';
        case 'open_gym':
            return 'open-gym';
        default:
            return 'group-class';
    }
}

/**
 * Maps frontend SessionType to backend session_type
 */
function mapFrontendSessionType(frontendType: SessionType): 'physical' | 'virtual' | 'workshop' | 'open_gym' {
    switch (frontendType) {
        case 'personal-training':
            return 'virtual';
        case 'workshop':
            return 'workshop';
        case 'open-gym':
            return 'open_gym';
        case 'group-class':
        default:
            return 'physical';
    }
}

/**
 * Maps backend session to frontend Session
 */
function mapBackendSessionToSession(session: BackendSession): Session {
    return {
        id: session.id,
        title: session.title,
        type: mapBackendSessionType(session.session_type),
        trainerId: session.staff,
        trainerName: session.staff_name || 'TBD',
        startTime: session.start_time,
        endTime: session.end_time,
        capacity: session.capacity,
        enrolledCount: session.is_full ? session.capacity : 0, // Approximate
        location: session.session_type === 'virtual' ? 'Online' : 'Studio',
        status: session.is_full ? 'full' : 'open',
    };
}

/**
 * Format date for API query parameter
 */
function formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Fetch sessions from the API
 * Optionally filter by week
 */
export async function fetchSessionsFromApi(weekStart?: Date): Promise<Session[]> {
    let endpoint = '/scheduling/sessions/';

    if (weekStart) {
        const startDate = formatDateForApi(weekStart);
        const endDate = new Date(weekStart);
        endDate.setDate(endDate.getDate() + 7);
        endpoint += `?start_time__gte=${startDate}&start_time__lt=${formatDateForApi(endDate)}`;
    }

    const response = await apiClient.get<BackendSession[] | BackendPaginatedResponse<BackendSession>>(
        endpoint
    );

    // Handle paginated or direct array response
    const sessions = 'results' in response ? response.results : response;
    return sessions.map(mapBackendSessionToSession);
}

/**
 * Fetch a single session by ID
 */
export async function fetchSessionFromApi(id: string): Promise<Session | null> {
    try {
        const response = await apiClient.get<BackendSession>(`/scheduling/sessions/${id}/`);
        return mapBackendSessionToSession(response);
    } catch {
        return null;
    }
}

/**
 * Create a new session
 */
export async function createSessionApi(data: CreateSessionInput): Promise<Session> {
    const payload: BackendCreateSessionRequest = {
        title: data.title,
        staff: data.trainerId,
        start_time: data.startTime,
        end_time: data.endTime,
        capacity: data.capacity,
        session_type: mapFrontendSessionType(data.type),
    };

    const response = await apiClient.post<BackendSession>('/scheduling/sessions/', payload);
    return mapBackendSessionToSession(response);
}

/**
 * Update an existing session
 */
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
    const payload: Partial<BackendCreateSessionRequest> = {};

    if (data.title !== undefined) payload.title = data.title;
    if (data.startTime !== undefined) payload.start_time = data.startTime;
    if (data.endTime !== undefined) payload.end_time = data.endTime;
    if (data.capacity !== undefined) payload.capacity = data.capacity;
    if (data.trainerId !== undefined) payload.staff = data.trainerId;
    if (data.roomUrl !== undefined) payload.meeting_url = data.roomUrl;

    const response = await apiClient.patch<BackendSession>(`/scheduling/sessions/${id}/`, payload);
    return mapBackendSessionToSession(response);
}

/**
 * Delete a session
 */
export async function deleteSessionApi(id: string): Promise<boolean> {
    try {
        await apiClient.delete(`/scheduling/sessions/${id}/`);
        return true;
    } catch {
        return false;
    }
}
