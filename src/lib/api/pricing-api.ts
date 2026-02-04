/**
 * Pricing API Service
 * 
 * Real API calls to the backend for pricing option management.
 * 
 * Backend Endpoints:
 * - GET /api/v1/scheduling/pricing-options/ - List pricing options
 * - POST /api/v1/scheduling/pricing-options/ - Create pricing option
 * - GET /api/v1/scheduling/pricing-options/:id/ - Get pricing option
 * - PATCH /api/v1/scheduling/pricing-options/:id/ - Update pricing option
 * - DELETE /api/v1/scheduling/pricing-options/:id/ - Delete pricing option
 * 
 * Backend PricingOption Model:
 * {
 *   id: string (UUID),
 *   name: string,
 *   price: string (decimal as string),
 *   session_credits: number,
 *   duration_days: number | null,
 *   fixed_start_date: string | null,
 *   fixed_expiry_date: string | null,
 *   created_at: string (ISO datetime)
 * }
 */

import { apiClient } from '@/lib/api';
import type { PricingPlan, CreatePlanInput, PlanType, BillingCycle } from '@/types/pricing';

// Backend response types (matching Django serializers)
interface BackendPricingOption {
    id: string;
    name: string;
    price: string;
    session_credits: number;
    duration_days: number | null;
    fixed_start_date: string | null;
    fixed_expiry_date: string | null;
    created_at: string;
}

interface BackendPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

interface BackendCreatePricingRequest {
    name: string;
    price: string;
    session_credits: number;
    duration_days?: number;
    fixed_start_date?: string;
    fixed_expiry_date?: string;
}

/**
 * Maps backend pricing option to frontend PricingPlan
 */
function mapBackendPricingToPlan(option: BackendPricingOption): PricingPlan {
    // Determine plan type based on session credits
    // If unlimited credits (0 or very high), it's a membership
    const isUnlimited = option.session_credits === 0 || option.session_credits >= 999;
    const planType: PlanType = isUnlimited ? 'membership' : 'class-pack';

    // Determine billing cycle based on duration_days
    let billingCycle: BillingCycle = 'one-time';
    if (option.duration_days) {
        if (option.duration_days <= 31) {
            billingCycle = 'monthly';
        } else if (option.duration_days <= 93) {
            billingCycle = 'quarterly';
        } else if (option.duration_days >= 360) {
            billingCycle = 'yearly';
        }
    }

    return {
        id: option.id,
        name: option.name,
        description: `${option.session_credits} sessions, valid for ${option.duration_days || 30} days`,
        type: planType,
        price: parseFloat(option.price),
        billingCycle,
        maxClasses: option.session_credits,
        validityDays: option.duration_days || 30,
        features: [
            `${option.session_credits} session credits`,
            `Valid for ${option.duration_days || 30} days`,
        ],
        isPopular: false,
        isActive: true,
        subscribers: 0, // Would need separate query
        createdAt: option.created_at,
    };
}

/**
 * Fetch all pricing options from the API
 */
export async function fetchPricingOptionsFromApi(): Promise<PricingPlan[]> {
    const response = await apiClient.get<BackendPricingOption[] | BackendPaginatedResponse<BackendPricingOption>>(
        '/scheduling/pricing-options/'
    );

    // Handle paginated or direct array response
    const options = 'results' in response ? response.results : response;
    return options.map(mapBackendPricingToPlan);
}

/**
 * Fetch a single pricing option by ID
 */
export async function fetchPricingOptionFromApi(id: string): Promise<PricingPlan | null> {
    try {
        const response = await apiClient.get<BackendPricingOption>(`/scheduling/pricing-options/${id}/`);
        return mapBackendPricingToPlan(response);
    } catch {
        return null;
    }
}

/**
 * Create a new pricing option
 */
export async function createPricingOptionApi(data: CreatePlanInput): Promise<PricingPlan> {
    const payload: BackendCreatePricingRequest = {
        name: data.name,
        price: data.price.toFixed(2),
        session_credits: data.maxClasses || 0,
        duration_days: data.validityDays || 30,
    };

    const response = await apiClient.post<BackendPricingOption>('/scheduling/pricing-options/', payload);
    return mapBackendPricingToPlan(response);
}

/**
 * Update an existing pricing option
 */
export async function updatePricingOptionApi(
    id: string,
    data: Partial<CreatePlanInput>
): Promise<PricingPlan> {
    const payload: Partial<BackendCreatePricingRequest> = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price.toFixed(2);
    if (data.maxClasses !== undefined) payload.session_credits = data.maxClasses;
    if (data.validityDays !== undefined) payload.duration_days = data.validityDays;

    const response = await apiClient.patch<BackendPricingOption>(`/scheduling/pricing-options/${id}/`, payload);
    return mapBackendPricingToPlan(response);
}

/**
 * Delete a pricing option
 */
export async function deletePricingOptionApi(id: string): Promise<boolean> {
    try {
        await apiClient.delete(`/scheduling/pricing-options/${id}/`);
        return true;
    } catch {
        return false;
    }
}

/**
 * Archive a pricing option (soft delete by marking inactive)
 * Note: Backend doesn't have is_active field on PricingOption yet
 * This will just delete for now
 */
export async function archivePricingOptionApi(id: string): Promise<PricingPlan> {
    // The backend doesn't have is_active on PricingOption
    // For now we'll just fetch it (no-op)
    const response = await apiClient.get<BackendPricingOption>(`/scheduling/pricing-options/${id}/`);
    return mapBackendPricingToPlan(response);
}
