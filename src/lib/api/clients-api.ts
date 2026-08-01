/**
 * Clients API — Gym Scheduling System (web / owner portal)
 *
 * GET  /api/v1/users/profiles/ (filter role=client)
 * GET  /api/v1/scheduling/packages/
 * POST /api/v1/scheduling/packages/  — assign package to client
 * GET  /api/v1/scheduling/staff-assignments/
 * POST /api/v1/scheduling/staff-assignments/bulk-assign/
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';
import type { Client } from '@/types/clients';
import { fetchPricingOptionsFromApi } from '@/lib/api/pricing-api';

interface BackendProfile {
    nickname?: string;
    bio?: string;
    profile_image?: string | null;
    phone_number?: string;
}

interface BackendUser {
    id: string;
    email: string;
    role: string;
    profile?: BackendProfile;
    nickname?: string;
    date_joined?: string;
}

interface BackendPackage {
    id: string;
    client?: string | { id?: string } | null;
    client_id?: string;
    package_type?: string | { id?: string; name?: string } | null;
    package_type_id?: string;
    package_type_name?: string;
    name?: string;
    credits_remaining?: number;
    expires_at?: string;
    expiry_date?: string;
    is_active?: boolean;
    status?: string;
}

interface BackendStaffAssignment {
    id: string;
    staff: string | { id?: string };
    staff_name?: string;
    client: string | { id?: string };
    client_name?: string;
}

export interface ClientPass {
    id: string;
    pricingOptionId: string;
    pricingOptionName: string;
    sessionsRemaining: number;
    expiresAt: string;
    isActive: boolean;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

function mapBackendUserToClient(
    user: BackendUser,
    extras?: {
        membershipName?: string;
        assignedStaffId?: string;
        assignedStaffName?: string;
    }
): Client {
    const nickname = user.profile?.nickname || user.nickname || '';
    const nameParts = nickname.trim().split(/\s+/).filter(Boolean);

    return {
        id: user.id,
        firstName: nameParts[0] || user.email.split('@')[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: user.profile?.phone_number || '',
        status: 'active',
        avatar: user.profile?.profile_image || undefined,
        membershipName: extras?.membershipName || 'No Active Plan',
        assignedStaffId: extras?.assignedStaffId,
        assignedStaffName: extras?.assignedStaffName,
        joinDate: user.date_joined || new Date().toISOString(),
        lastVisit: user.date_joined,
    };
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
        if (typeof name === 'string' && name.trim()) return name;
    }
    return undefined;
}

function isPackageActive(pkg: BackendPackage): boolean {
    if (pkg.is_active === false) return false;
    if (typeof pkg.status === 'string') {
        const status = pkg.status.toLowerCase();
        if (status === 'expired' || status === 'cancelled' || status === 'inactive') {
            return false;
        }
    }
    const expiresAt = pkg.expires_at || pkg.expiry_date;
    if (expiresAt) {
        const t = new Date(expiresAt).getTime();
        if (!Number.isNaN(t) && t < Date.now()) return false;
    }
    return true;
}

function mapBackendPackageToPass(pkg: BackendPackage): ClientPass {
    const packageTypeId =
        asId(pkg.package_type) ||
        (typeof pkg.package_type_id === 'string' ? pkg.package_type_id : '');
    const packageTypeName =
        pkg.package_type_name ||
        asName(pkg.package_type) ||
        pkg.name ||
        'Package';

    return {
        id: pkg.id,
        pricingOptionId: packageTypeId,
        pricingOptionName: packageTypeName,
        sessionsRemaining: pkg.credits_remaining ?? 0,
        expiresAt: pkg.expires_at || pkg.expiry_date || '',
        isActive: isPackageActive(pkg),
    };
}

function packageClientId(pkg: BackendPackage): string {
    return asId(pkg.client) || (typeof pkg.client_id === 'string' ? pkg.client_id : '');
}

/** GET /api/v1/users/profiles/ — clients only (+ packages + assignments) */
export async function fetchClientsFromApi(): Promise<Client[]> {
    const [usersResponse, assignmentsResponse, packagesResponse, pricingPlans] =
        await Promise.all([
            apiClient.get<BackendUser[] | ApiPaginatedResponse<BackendUser>>(
                '/users/profiles/'
            ),
            apiClient
                .get<
                    BackendStaffAssignment[] | ApiPaginatedResponse<BackendStaffAssignment>
                >('/scheduling/staff-assignments/')
                .catch(() => [] as BackendStaffAssignment[]),
            apiClient
                .get<BackendPackage[] | ApiPaginatedResponse<BackendPackage>>(
                    '/scheduling/packages/'
                )
                .catch(() => [] as BackendPackage[]),
            fetchPricingOptionsFromApi().catch(() => []),
        ]);

    const planNameById = new Map(pricingPlans.map((p) => [p.id, p.name]));

    const users = unwrapList(usersResponse).filter((u) => u.role === 'client');
    const assignments = unwrapList(assignmentsResponse);
    const packages = unwrapList(packagesResponse);

    const assignmentByClient = new Map<string, BackendStaffAssignment>();
    for (const a of assignments) {
        const clientId = asId(a.client);
        if (clientId && !assignmentByClient.has(clientId)) {
            assignmentByClient.set(clientId, a);
        }
    }

    const activePackageByClient = new Map<string, BackendPackage>();
    for (const pkg of packages) {
        if (!isPackageActive(pkg)) continue;
        const clientId = packageClientId(pkg);
        if (clientId && !activePackageByClient.has(clientId)) {
            activePackageByClient.set(clientId, pkg);
        }
    }

    return users.map((user) => {
        const assignment = assignmentByClient.get(user.id);
        const activePkg = activePackageByClient.get(user.id);
        let membershipName: string | undefined;
        if (activePkg) {
            const pass = mapBackendPackageToPass(activePkg);
            membershipName =
                (pass.pricingOptionId && planNameById.get(pass.pricingOptionId)) ||
                (pass.pricingOptionName !== 'Package'
                    ? pass.pricingOptionName
                    : undefined) ||
                pass.pricingOptionName;
        }

        return mapBackendUserToClient(user, {
            membershipName,
            assignedStaffId: asId(assignment?.staff) || undefined,
            assignedStaffName: assignment?.staff_name,
        });
    });
}

/** GET packages for a client (best-effort filter) */
export async function fetchClientPassesFromApi(clientId: string): Promise<ClientPass[]> {
    const [filteredResponse, allResponse] = await Promise.all([
        apiClient
            .get<BackendPackage[] | ApiPaginatedResponse<BackendPackage>>(
                `/scheduling/packages/?client=${encodeURIComponent(clientId)}`
            )
            .catch(() => null),
        apiClient
            .get<BackendPackage[] | ApiPaginatedResponse<BackendPackage>>(
                '/scheduling/packages/'
            )
            .catch(() => [] as BackendPackage[]),
    ]);

    const filtered = filteredResponse ? unwrapList(filteredResponse) : [];
    const all = unwrapList(allResponse);
    const forClient =
        filtered.length > 0
            ? filtered
            : all.filter((pkg) => packageClientId(pkg) === clientId);

    return forClient.map(mapBackendPackageToPass);
}

/**
 * POST /api/v1/scheduling/packages/
 * Body: { client, package_type, credits_remaining, expires_at }
 */
export async function assignPassToClientApi(input: {
    clientId: string;
    packageTypeId: string;
    creditsRemaining: number;
    expiresAt: string;
}): Promise<void> {
    await apiClient.post('/scheduling/packages/', {
        client: input.clientId,
        package_type: input.packageTypeId,
        credits_remaining: input.creditsRemaining,
        expires_at: input.expiresAt,
    });
}

/**
 * POST /api/v1/scheduling/staff-assignments/bulk-assign/
 * Body: { staff, clients: UUID[] }
 */
export async function bulkAssignClientsToStaffApi(
    staffId: string,
    clientIds: string[]
): Promise<void> {
    await apiClient.post('/scheduling/staff-assignments/bulk-assign/', {
        staff: staffId,
        clients: clientIds,
    });
}

/** GET /api/v1/scheduling/staff-assignments/ */
export async function fetchStaffAssignmentsFromApi(): Promise<BackendStaffAssignment[]> {
    const response = await apiClient.get<
        BackendStaffAssignment[] | ApiPaginatedResponse<BackendStaffAssignment>
    >('/scheduling/staff-assignments/');
    return unwrapList(response);
}

export async function fetchClientWithPassesFromApi(clientId: string): Promise<{
    client: Client;
    passes: ClientPass[];
} | null> {
    try {
        const [userResponse, passesResponse] = await Promise.all([
            apiClient.get<BackendUser>(`/users/profiles/${clientId}/`),
            fetchClientPassesFromApi(clientId),
        ]);

        const activePasses = passesResponse.filter((p) => p.isActive);
        const client = mapBackendUserToClient(userResponse, {
            membershipName: activePasses[0]?.pricingOptionName,
        });

        return { client, passes: passesResponse };
    } catch {
        return null;
    }
}

/** PATCH /api/v1/scheduling/packages/{id}/ */
export async function updatePackageApi(
    id: string,
    payload: Partial<{
        client: string;
        package_type: string;
        credits_remaining: number;
        expires_at: string;
    }>
): Promise<void> {
    await apiClient.patch(`/scheduling/packages/${id}/`, payload);
}

/** DELETE /api/v1/scheduling/packages/{id}/ */
export async function deletePackageApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/packages/${id}/`);
}

/** POST /api/v1/scheduling/staff-assignments/ */
export async function createStaffAssignmentApi(payload: {
    staff: string;
    client: string;
}): Promise<BackendStaffAssignment> {
    return apiClient.post<BackendStaffAssignment>(
        '/scheduling/staff-assignments/',
        payload
    );
}

/** PATCH /api/v1/scheduling/staff-assignments/{id}/ */
export async function updateStaffAssignmentApi(
    id: string,
    payload: { staff: string; client: string }
): Promise<BackendStaffAssignment> {
    return apiClient.patch<BackendStaffAssignment>(
        `/scheduling/staff-assignments/${id}/`,
        payload
    );
}

/** DELETE /api/v1/scheduling/staff-assignments/{id}/ */
export async function deleteStaffAssignmentApi(id: string): Promise<void> {
    await apiClient.delete(`/scheduling/staff-assignments/${id}/`);
}

/** GET /api/v1/scheduling/api/view-all-clients/ */
export async function fetchViewAllClientsFromApi(
    status = 'Active'
): Promise<unknown[]> {
    const params = new URLSearchParams({ status });
    const response = await apiClient.get<unknown[] | ApiPaginatedResponse<unknown>>(
        `/scheduling/api/view-all-clients/?${params.toString()}`
    );
    return unwrapList(response);
}

export interface PaginatedDetailedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
    page?: number;
    page_size?: number;
}

/** GET /api/v1/users/profiles/clients-detailed-scheduling/ */
export async function fetchClientsDetailedSchedulingFromApi(params?: {
    page?: number;
    page_size?: number;
    search?: string;
}): Promise<PaginatedDetailedResponse<Record<string, unknown>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return apiClient.get(
        `/users/profiles/clients-detailed-scheduling/${qs ? `?${qs}` : ''}`
    );
}

/** GET /api/v1/users/profiles/staff-detailed-scheduling/ */
export async function fetchStaffDetailedSchedulingFromApi(params?: {
    page?: number;
    page_size?: number;
    search?: string;
}): Promise<PaginatedDetailedResponse<Record<string, unknown>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return apiClient.get(
        `/users/profiles/staff-detailed-scheduling/${qs ? `?${qs}` : ''}`
    );
}

/** GET /api/v1/users/profiles/{id}/detailed-scheduling/ */
export async function fetchUserDetailedSchedulingFromApi(
    id: string
): Promise<Record<string, unknown>> {
    return apiClient.get(`/users/profiles/${id}/detailed-scheduling/`);
}

/** POST /api/v1/users/profiles/{id}/deactivate/ — toggles active status */
export async function toggleUserDeactivateApi(id: string): Promise<unknown> {
    return apiClient.post(`/users/profiles/${id}/deactivate/`, {});
}

/** GET /api/v1/users/profiles/clients-detailed-nutrition/ */
export async function fetchClientsDetailedNutritionFromApi(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    id?: string;
}): Promise<PaginatedDetailedResponse<Record<string, unknown>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.id) searchParams.set('id', params.id);
    const qs = searchParams.toString();
    return apiClient.get(
        `/users/profiles/clients-detailed-nutrition/${qs ? `?${qs}` : ''}`
    );
}

/** GET /api/v1/users/profiles/{id}/detailed-nutrition/ */
export async function fetchClientDetailedNutritionFromApi(
    id: string
): Promise<Record<string, unknown>> {
    return apiClient.get(`/users/profiles/${id}/detailed-nutrition/`);
}

/** GET /api/v1/users/profiles/clients-detailed-reflection/ */
export async function fetchClientsDetailedReflectionFromApi(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    id?: string;
}): Promise<PaginatedDetailedResponse<Record<string, unknown>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.id) searchParams.set('id', params.id);
    const qs = searchParams.toString();
    return apiClient.get(
        `/users/profiles/clients-detailed-reflection/${qs ? `?${qs}` : ''}`
    );
}

/** GET /api/v1/users/profiles/{id}/detailed-reflection/ */
export async function fetchClientDetailedReflectionFromApi(
    id: string
): Promise<Record<string, unknown>> {
    return apiClient.get(`/users/profiles/${id}/detailed-reflection/`);
}
