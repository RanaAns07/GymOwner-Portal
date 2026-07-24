/**
 * Staff API — Gym Scheduling System (web / owner portal)
 *
 * POST /api/v1/users/profiles/create_staff/
 * GET  /api/v1/users/profiles/
 * GET  /api/v1/users/profiles/{id}/
 * PATCH /api/v1/users/profiles/{id}/
 * DELETE /api/v1/users/profiles/{id}/
 * GET/POST /api/v1/scheduling/staff-locations/
 * DELETE /api/v1/scheduling/staff-locations/{id}/
 * GET/POST /api/v1/scheduling/staff-availability/
 * DELETE /api/v1/scheduling/staff-availability/{id}/
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';
import type { StaffMember, CreateStaffInput, UpdateStaffInput } from '@/types/staff';
import {
    fileToDataUrl,
    resolveStaffAvatar,
    setStaffAvatarCache,
} from '@/lib/staff-avatar-cache';

interface BackendProfile {
    nickname?: string;
    bio?: string;
    profile_image?: string | null;
    phone_number?: string;
    gender?: string;
    specializations?: string[];
    staff_status?: 'active' | 'on_leave' | 'inactive';
}

interface BackendUser {
    id: string;
    email: string;
    role: string;
    profile?: BackendProfile;
    nickname?: string;
    date_joined?: string;
}

interface BackendCreateStaffResponse {
    id: string;
    role: string;
    email?: string;
    profile?: BackendProfile;
}

export interface BackendStaffLocation {
    id: string;
    staff: string;
    location: string;
    location_name?: string;
}

interface BackendStaffAvailability {
    id: string;
    staff: string;
    weekday_or_date: string;
    start_time: string;
    end_time: string;
    is_blackout?: boolean;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

function asId(value: unknown): string {
    if (typeof value === 'string' && value) return value;
    if (value && typeof value === 'object' && 'id' in value) {
        const id = (value as { id?: unknown }).id;
        if (typeof id === 'string') return id;
    }
    return '';
}

function asName(value: unknown, fallback?: string): string | undefined {
    if (fallback) return fallback;
    if (value && typeof value === 'object' && 'name' in value) {
        const name = (value as { name?: unknown }).name;
        if (typeof name === 'string') return name;
    }
    return undefined;
}

/** Normalize nested DRF relations into flat { id, staff, location, location_name } */
function mapStaffLocation(raw: Record<string, unknown>): BackendStaffLocation | null {
    const id = asId(raw.id);
    const staff = asId(raw.staff ?? raw.staff_id ?? raw.user ?? raw.user_id);
    const location = asId(raw.location ?? raw.location_id);
    if (!id || !staff || !location) return null;

    return {
        id,
        staff,
        location,
        location_name: asName(
            raw.location,
            typeof raw.location_name === 'string' ? raw.location_name : undefined
        ),
    };
}

function mapBackendUserToStaff(user: BackendUser): StaffMember {
    const nickname = user.profile?.nickname || user.nickname || '';
    const nameParts = nickname.trim().split(/\s+/).filter(Boolean);

    return {
        id: user.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: user.profile?.phone_number || '',
        gender: user.profile?.gender || '',
        role:
            user.role === 'trainer'
                ? 'trainer'
                : user.role === 'gym_manager'
                  ? 'manager'
                  : user.role === 'gym_owner'
                    ? 'owner'
                    : 'trainer',
        status:
            user.profile?.staff_status === 'on_leave'
                ? 'on-leave'
                : user.profile?.staff_status || 'active',
        avatar: resolveStaffAvatar(user.id, user.profile?.profile_image),
        specializations: user.profile?.specializations || [],
        hireDate: user.date_joined || new Date().toISOString(),
        clients: 0,
        schedule: '',
    };
}

function mapCreateInputToStaff(
    data: CreateStaffInput,
    created: BackendCreateStaffResponse
): StaffMember {
    return {
        id: created.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role === 'manager' ? 'manager' : 'trainer',
        status: 'active',
        specializations: data.specializations || [],
        hireDate: new Date().toISOString(),
        clients: 0,
        schedule: '',
    };
}

/** GET /api/v1/users/profiles/ — trainers & managers */
export async function fetchStaffFromApi(): Promise<StaffMember[]> {
    const response = await apiClient.get<BackendUser[] | ApiPaginatedResponse<BackendUser>>(
        '/users/profiles/'
    );
    console.log('[GET /users/profiles/] raw', response);

    const users = unwrapList(response);
    console.log(
        '[GET /users/profiles/] profile_image URLs',
        users.map((u) => ({
            email: u.email,
            profile_image: u.profile?.profile_image,
        }))
    );

    const staff = users
        .filter((u) => u.role === 'trainer' || u.role === 'gym_manager')
        .map(mapBackendUserToStaff);

    console.log('[GET /users/profiles/] mapped staff', staff);
    return staff;
}

/** GET /api/v1/users/profiles/{id}/ */
export async function fetchStaffMemberFromApi(id: string): Promise<StaffMember | undefined> {
    try {
        const response = await apiClient.get<BackendUser>(`/users/profiles/${id}/`);
        return mapBackendUserToStaff(response);
    } catch {
        return undefined;
    }
}

/**
 * POST /api/v1/users/profiles/create_staff/
 * Body: { email, password, role: "trainer"|"gym_manager", nickname }
 */
export async function createStaffMemberApi(data: CreateStaffInput): Promise<StaffMember> {
    const nickname = `${data.firstName} ${data.lastName}`.trim();
    // API only accepts trainer | gym_manager
    const role = data.role === 'manager' ? 'gym_manager' : 'trainer';

    const response = await apiClient.post<BackendCreateStaffResponse>(
        '/users/profiles/create_staff/',
        {
            email: data.email,
            password: data.password || 'TempPassword123!',
            role,
            nickname,
        }
    );

    if (response.email || response.profile) {
        return mapBackendUserToStaff(response as BackendUser);
    }

    return mapCreateInputToStaff(data, response);
}

/** PATCH /api/v1/users/profiles/{id}/ — JSON or multipart when image is included */
export async function updateStaffMemberApi(
    id: string,
    data: UpdateStaffInput
): Promise<StaffMember | undefined> {
    const nickname =
        data.firstName || data.lastName
            ? `${data.firstName || ''} ${data.lastName || ''}`.trim()
            : undefined;

    const hasImage = !!data.imageFile;

    if (hasImage) {
        const formData = new FormData();
        if (nickname) formData.append('profile.nickname', nickname);
        if (data.phone !== undefined) {
            formData.append('profile.phone_number', data.phone || '');
        }
        if (data.gender !== undefined) {
            formData.append('profile.gender', data.gender || '');
        }
        if (data.bio) formData.append('profile.bio', data.bio);
        formData.append(
            'profile.profile_image',
            data.imageFile as File,
            (data.imageFile as File).name || 'avatar.jpg'
        );

        const response = await apiClient.patchFormData<BackendUser>(
            `/users/profiles/${id}/`,
            formData
        );
        const mapped = mapBackendUserToStaff(response);
        try {
            const dataUrl = await fileToDataUrl(data.imageFile as File);
            setStaffAvatarCache(id, dataUrl);
            return { ...mapped, avatar: dataUrl };
        } catch {
            return {
                ...mapped,
                avatar: resolveStaffAvatar(id, mapped.avatar),
            };
        }
    }

    const profile: {
        nickname?: string;
        bio?: string;
        phone_number?: string;
        gender?: string;
    } = {};

    if (nickname) profile.nickname = nickname;
    if (data.bio) profile.bio = data.bio;
    if (data.phone !== undefined) profile.phone_number = data.phone || '';
    if (data.gender !== undefined) profile.gender = data.gender || '';

    const response = await apiClient.patch<BackendUser>(`/users/profiles/${id}/`, {
        profile,
    });
    const mapped = mapBackendUserToStaff(response);
    return {
        ...mapped,
        avatar: resolveStaffAvatar(id, mapped.avatar),
        phone: data.phone !== undefined ? data.phone || '' : mapped.phone,
        gender: data.gender !== undefined ? data.gender || '' : mapped.gender,
    };
}

/** DELETE /api/v1/users/profiles/{id}/ */
export async function deleteStaffMemberApi(id: string): Promise<void> {
    await apiClient.delete(`/users/profiles/${id}/`);
}

/** GET /api/v1/scheduling/staff-locations/?staff= */
export async function fetchStaffLocationsFromApi(
    staffId?: string
): Promise<BackendStaffLocation[]> {
    const query = staffId ? `?staff=${encodeURIComponent(staffId)}` : '';
    const response = await apiClient.get<
        Record<string, unknown>[] | ApiPaginatedResponse<Record<string, unknown>>
    >(`/scheduling/staff-locations/${query}`);

    return unwrapList(response)
        .map((item) => mapStaffLocation(item))
        .filter((item): item is BackendStaffLocation => item !== null)
        .filter((item) => (staffId ? item.staff === staffId : true));
}

/** POST /api/v1/scheduling/staff-locations/ */
export async function assignStaffLocationApi(
    staffId: string,
    locationId: string
): Promise<BackendStaffLocation> {
    const response = await apiClient.post<Record<string, unknown>>(
        '/scheduling/staff-locations/',
        {
            staff: staffId,
            location: locationId,
        }
    );

    const mapped = mapStaffLocation(response);
    if (mapped) return mapped;

    // Fallback if create response is minimal
    return {
        id: asId(response.id) || `${staffId}:${locationId}`,
        staff: staffId,
        location: locationId,
    };
}

/** DELETE /api/v1/scheduling/staff-locations/{id}/ */
export async function removeStaffLocationApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/staff-locations/${id}/`);
}

/** GET /api/v1/scheduling/staff-availability/?staff= */
export async function fetchStaffAvailabilityFromApi(
    staffId?: string
): Promise<BackendStaffAvailability[]> {
    const query = staffId ? `?staff=${staffId}` : '';
    const response = await apiClient.get<
        BackendStaffAvailability[] | ApiPaginatedResponse<BackendStaffAvailability>
    >(`/scheduling/staff-availability/${query}`);
    return unwrapList(response);
}

/** POST /api/v1/scheduling/staff-availability/ */
export async function createStaffAvailabilityApi(payload: {
    staff: string;
    weekday_or_date: string;
    start_time: string;
    end_time: string;
    is_blackout?: boolean;
}): Promise<BackendStaffAvailability> {
    return apiClient.post<BackendStaffAvailability>('/scheduling/staff-availability/', payload);
}

/** DELETE /api/v1/scheduling/staff-availability/{id}/ */
export async function deleteStaffAvailabilityApi(id: string): Promise<boolean> {
    try {
        await apiClient.delete(`/scheduling/staff-availability/${id}/`);
        return true;
    } catch {
        return false;
    }
}
