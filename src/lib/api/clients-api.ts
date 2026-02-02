/**
 * Clients API Service
 * 
 * Real API calls to the backend for client management.
 * 
 * Backend Endpoints:
 * - GET /api/v1/users/profiles/?role=client - List clients
 * - GET /api/v1/scheduling/client-passes/ - List client passes
 * - POST /api/v1/scheduling/client-passes/ - Assign pass to client
 * 
 * Backend ClientPass Model:
 * {
 *   id: string (UUID),
 *   client: string (UUID),
 *   client_name: string (read-only),
 *   client_email: string (read-only),
 *   pricing_option: string (UUID),
 *   pricing_option_name: string (read-only),
 *   credits_remaining: number,
 *   start_date: string (date),
 *   expiry_date: string (date),
 *   is_active: boolean,
 *   created_at: string (ISO)
 * }
 */

import { apiClient } from '@/lib/api';
import type { Client } from '@/types/clients';

// Backend response types (matching Django serializers)
interface BackendProfile {
    nickname: string;
    bio: string;
    profile_image: string | null;
    phone_number: string;
}

interface BackendUser {
    id: string;
    email: string;
    role: string;
    profile: BackendProfile;
    date_joined: string;
}

interface BackendClientPass {
    id: string;
    client: string;
    client_name: string;
    client_email: string;
    pricing_option: string;
    pricing_option_name: string;
    credits_remaining: number;
    start_date: string;
    expiry_date: string;
    is_active: boolean;
    created_at: string;
}

interface BackendPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ClientPass {
    id: string;
    pricingOptionId: string;
    pricingOptionName: string;
    sessionsRemaining: number;
    expiresAt: string;
    isActive: boolean;
}

/**
 * Maps backend user to frontend Client
 */
function mapBackendUserToClient(user: BackendUser, extras?: { membershipName?: string }): Client {
    const nickname = user.profile?.nickname || '';
    const nameParts = nickname.split(' ');

    return {
        id: user.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: user.profile?.phone_number || '',
        status: 'active',
        avatar: user.profile?.profile_image || undefined,
        membershipName: extras?.membershipName || 'No Active Plan',
        joinDate: user.date_joined,
        lastVisit: user.date_joined, // Not tracked separately
    };
}

/**
 * Maps backend pass to frontend ClientPass
 */
function mapBackendPassToClientPass(pass: BackendClientPass): ClientPass {
    return {
        id: pass.id,
        pricingOptionId: pass.pricing_option,
        pricingOptionName: pass.pricing_option_name || 'Unknown Plan',
        sessionsRemaining: pass.credits_remaining,
        expiresAt: pass.expiry_date,
        isActive: pass.is_active,
    };
}

/**
 * Fetch all clients from the API
 */
export async function fetchClientsFromApi(): Promise<Client[]> {
    // Use the profiles endpoint and filter by role
    const response = await apiClient.get<BackendUser[] | BackendPaginatedResponse<BackendUser>>(
        '/users/profiles/'
    );

    // Handle paginated or direct array response
    const users = 'results' in response ? response.results : response;

    // Filter only clients
    const clients = users.filter(u => u.role === 'client');

    return clients.map((user) => mapBackendUserToClient(user));
}

/**
 * Fetch client passes for a specific client
 */
export async function fetchClientPassesFromApi(clientId: string): Promise<ClientPass[]> {
    const response = await apiClient.get<BackendClientPass[] | BackendPaginatedResponse<BackendClientPass>>(
        `/scheduling/client-passes/?client=${clientId}`
    );

    // Handle paginated or direct array response
    const passes = 'results' in response ? response.results : response;
    return passes.map(mapBackendPassToClientPass);
}

/**
 * Assign a pricing plan to a client
 */
export async function assignPassToClientApi(
    clientId: string,
    pricingOptionId: string
): Promise<void> {
    await apiClient.post('/scheduling/client-passes/', {
        client: clientId,
        pricing_option: pricingOptionId,
    });
}

/**
 * Fetch a single client by ID with their passes
 */
export async function fetchClientWithPassesFromApi(clientId: string): Promise<{
    client: Client;
    passes: ClientPass[];
} | null> {
    try {
        const [userResponse, passesResponse] = await Promise.all([
            apiClient.get<BackendUser>(`/users/profiles/${clientId}/`),
            fetchClientPassesFromApi(clientId),
        ]);

        const activePasses = passesResponse.filter(p => p.isActive);
        const client = mapBackendUserToClient(userResponse, {
            membershipName: activePasses[0]?.pricingOptionName,
        });

        return {
            client,
            passes: passesResponse,
        };
    } catch {
        return null;
    }
}
