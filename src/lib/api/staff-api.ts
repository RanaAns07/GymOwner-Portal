/**
 * Staff API Service
 * 
 * Real API calls to the backend for staff management.
 * 
 * Backend Endpoints:
 * - GET /api/v1/users/profiles/ - List users (tenant-scoped)
 * - POST /api/v1/users/profiles/create_staff/ - Create trainer/manager
 * - GET /api/v1/users/profiles/:id/ - Get user
 * - PATCH /api/v1/users/profiles/:id/ - Update user
 * - DELETE /api/v1/users/profiles/:id/ - Delete user
 * 
 * Backend User Response:
 * {
 *   id: string (UUID),
 *   email: string,
 *   role: 'platform_admin' | 'gym_owner' | 'gym_manager' | 'trainer' | 'client',
 *   profile: { nickname: string, bio: string, profile_image: string | null },
 *   date_joined: string (ISO)
 * }
 */

import { apiClient } from '@/lib/api';
import type { StaffMember, CreateStaffInput } from '@/types/staff';

// Backend response types (matching Django serializers)
interface BackendProfile {
    nickname: string;
    bio: string;
    profile_image: string | null;
    phone_number: string;
    specializations: string[];
    staff_status: 'active' | 'on_leave' | 'inactive';
}

interface BackendUser {
    id: string;
    email: string;
    role: string;
    profile: BackendProfile;
    date_joined: string;
}

interface BackendPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

interface BackendCreateStaffRequest {
    email: string;
    password: string;
    role: 'trainer' | 'gym_manager';
    nickname: string;
    bio: string;
    profile_image: string | null;
}

/**
 * Maps backend user to frontend StaffMember
 */
function mapBackendUserToStaff(user: BackendUser): StaffMember {
    const nickname = user.profile?.nickname || '';
    const nameParts = nickname.split(' ');

    return {
        id: user.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: user.profile?.phone_number || '',
        role: user.role === 'trainer' ? 'trainer' :
            user.role === 'gym_manager' ? 'manager' :
                user.role === 'gym_owner' ? 'owner' : 'trainer',
        status: user.profile?.staff_status === 'on_leave' ? 'on-leave' : (user.profile?.staff_status || 'active'),
        avatar: user.profile?.profile_image || undefined,
        specializations: user.profile?.specializations || [],
        hireDate: user.date_joined,
        clients: 0, // Would need a separate query
        schedule: '',
    };
}

/**
 * Fetch all staff members (trainers and managers) from the API
 */
export async function fetchStaffFromApi(): Promise<StaffMember[]> {
    const response = await apiClient.get<BackendUser[] | BackendPaginatedResponse<BackendUser>>(
        '/users/profiles/'
    );

    // Handle paginated or direct array response
    const users = 'results' in response ? response.results : response;

    // Filter to only trainers and managers (exclude clients and owners for staff view)
    const staffUsers = users.filter(u =>
        u.role === 'trainer' || u.role === 'gym_manager'
    );

    return staffUsers.map(mapBackendUserToStaff);
}

/**
 * Fetch a single staff member by ID
 */
export async function fetchStaffMemberFromApi(id: string): Promise<StaffMember | undefined> {
    try {
        const response = await apiClient.get<BackendUser>(`/users/profiles/${id}/`);
        return mapBackendUserToStaff(response);
    } catch {
        return undefined;
    }
}

/**
 * Create a new staff member
 * Uses the create_staff endpoint which is admin-only
 */
export async function createStaffMemberApi(data: CreateStaffInput): Promise<StaffMember> {
    const nickname = `${data.firstName} ${data.lastName}`.trim();

    const payload: BackendCreateStaffRequest = {
        email: data.email,
        password: data.password || 'TempPassword123!', // Backend requires password
        role: data.role === 'manager' ? 'gym_manager' : 'trainer',
        nickname: nickname,
        bio: data.bio || "",
        profile_image: null,
    };

    const response = await apiClient.post<BackendUser>('/users/profiles/create_staff/', payload);
    return mapBackendUserToStaff(response);
}

/**
 * Update a staff member
 */
export async function updateStaffMemberApi(
    id: string,
    data: Partial<CreateStaffInput>
): Promise<StaffMember | undefined> {
    // Backend profile update - only profile fields can be updated
    const payload: { profile?: { nickname?: string; bio?: string } } = {};

    if (data.firstName || data.lastName) {
        payload.profile = payload.profile || {};
        const nickname = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        if (nickname) {
            payload.profile.nickname = nickname;
        }
    }

    if (data.bio) {
        payload.profile = payload.profile || {};
        payload.profile.bio = data.bio;
    }

    const response = await apiClient.patch<BackendUser>(`/users/profiles/${id}/`, payload);
    return mapBackendUserToStaff(response);
}

/**
 * Delete a staff member
 */
export async function deleteStaffMemberApi(id: string): Promise<boolean> {
    try {
        await apiClient.delete(`/users/profiles/${id}/`);
        return true;
    } catch {
        return false;
    }
}
