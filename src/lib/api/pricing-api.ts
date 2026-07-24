/**
 * Pricing / Package Types API — Gym Scheduling System (web)
 *
 * GET    /api/v1/scheduling/package-types/
 * POST   /api/v1/scheduling/package-types/
 * PATCH  /api/v1/scheduling/package-types/{id}/
 * DELETE /api/v1/scheduling/package-types/{id}/
 *
 * Stored fields: name, credit_count, price, validity_days, location
 */

import { apiClient } from '@/lib/api';
import { ensureDefaultLocation, fetchLocationsFromApi } from '@/lib/api/schedule-api';
import type { ApiPaginatedResponse } from '@/types/api-types';
import type { PricingPlan, CreatePlanInput, PlanType, BillingCycle } from '@/types/pricing';

interface BackendPackageType {
    id: string;
    name: string;
    credit_count?: number;
    credits?: number;
    session_credits?: number;
    price: string | number;
    validity_days?: number;
    duration_days?: number;
    location?: string | { id?: string; name?: string } | null;
    location_id?: string;
    location_name?: string;
    description?: string;
    created_at?: string;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

function readCredits(option: BackendPackageType): number {
    const value = option.credit_count ?? option.credits ?? option.session_credits ?? 0;
    const n = typeof value === 'number' ? value : parseInt(String(value), 10);
    return Number.isNaN(n) ? 0 : n;
}

function readValidityDays(option: BackendPackageType): number {
    const value = option.validity_days ?? option.duration_days ?? 30;
    const n = typeof value === 'number' ? value : parseInt(String(value), 10);
    return Number.isNaN(n) || n < 1 ? 30 : n;
}

function readPrice(option: BackendPackageType): number {
    const n = typeof option.price === 'number' ? option.price : parseFloat(String(option.price));
    return Number.isNaN(n) ? 0 : n;
}

function billingCycleFromDays(days: number): BillingCycle {
    if (days <= 31) return 'monthly';
    if (days <= 93) return 'quarterly';
    if (days >= 360) return 'yearly';
    return 'one-time';
}

function readLocationId(option: BackendPackageType): string | undefined {
    if (typeof option.location === 'string' && option.location) return option.location;
    if (option.location && typeof option.location === 'object' && option.location.id) {
        return option.location.id;
    }
    if (typeof option.location_id === 'string' && option.location_id) return option.location_id;
    return undefined;
}

function readLocationName(option: BackendPackageType): string | undefined {
    if (typeof option.location_name === 'string' && option.location_name.trim()) {
        return option.location_name;
    }
    if (option.location && typeof option.location === 'object' && option.location.name) {
        return option.location.name;
    }
    return undefined;
}

function mapBackendPackageTypeToPlan(option: BackendPackageType): PricingPlan {
    const credits = readCredits(option);
    const validityDays = readValidityDays(option);
    const price = readPrice(option);
    const isMembership = credits === 0 || credits >= 999;
    const planType: PlanType = isMembership ? 'membership' : 'class-pack';
    const billingCycle = billingCycleFromDays(validityDays);
    const locationId = readLocationId(option);
    const locationName = readLocationName(option);

    const description =
        (typeof option.description === 'string' && option.description.trim()) ||
        (isMembership
            ? `Membership · valid for ${validityDays} days`
            : `${credits} session credits · valid for ${validityDays} days`);

    const features = isMembership
        ? ['Membership access', `Valid for ${validityDays} days`]
        : [`${credits} session credits`, `Valid for ${validityDays} days`];

    return {
        id: option.id,
        name: option.name,
        description,
        type: planType,
        price,
        billingCycle,
        maxClasses: isMembership ? undefined : credits,
        validityDays,
        locationId,
        locationName,
        features,
        status: 'active',
        isPopular: false,
        isActive: true,
        subscribers: 0,
        subscriberCount: 0,
        createdAt: option.created_at || new Date().toISOString(),
    };
}

function creditCountForPayload(data: Partial<CreatePlanInput>): number | undefined {
    if (data.type === 'membership') return 0;
    if (data.maxClasses !== undefined) return data.maxClasses;
    return undefined;
}

/** GET /api/v1/scheduling/package-types/ */
export async function fetchPricingOptionsFromApi(): Promise<PricingPlan[]> {
    const [response, locations] = await Promise.all([
        apiClient.get<BackendPackageType[] | ApiPaginatedResponse<BackendPackageType>>(
            '/scheduling/package-types/'
        ),
        fetchLocationsFromApi().catch(() => []),
    ]);

    const locationNameById = new Map(locations.map((l) => [l.id, l.name]));

    return unwrapList(response).map((option) => {
        const plan = mapBackendPackageTypeToPlan(option);
        const locationName =
            plan.locationName ||
            (plan.locationId ? locationNameById.get(plan.locationId) : undefined);
        return { ...plan, locationName };
    });
}

/** GET /api/v1/scheduling/package-types/{id}/ */
export async function fetchPricingOptionFromApi(id: string): Promise<PricingPlan | null> {
    try {
        const response = await apiClient.get<BackendPackageType>(
            `/scheduling/package-types/${id}/`
        );
        return mapBackendPackageTypeToPlan(response);
    } catch {
        return null;
    }
}

/**
 * POST /api/v1/scheduling/package-types/
 * Body: { name, credit_count, price, validity_days, location }
 */
export async function createPricingOptionApi(data: CreatePlanInput): Promise<PricingPlan> {
    let locationId = data.locationId;
    if (!locationId) {
        const fallback = await ensureDefaultLocation();
        locationId = fallback.id;
    }

    const creditCount =
        data.type === 'membership' ? 0 : data.maxClasses && data.maxClasses > 0 ? data.maxClasses : 1;

    const response = await apiClient.post<BackendPackageType>('/scheduling/package-types/', {
        name: data.name,
        credit_count: creditCount,
        price: data.price.toFixed(2),
        validity_days: data.validityDays || 30,
        location: locationId,
    });
    const plan = mapBackendPackageTypeToPlan(response);
    return {
        ...plan,
        locationId: plan.locationId || locationId,
        locationName: plan.locationName || data.locationName,
    };
}

/** PATCH /api/v1/scheduling/package-types/{id}/ */
export async function updatePricingOptionApi(
    id: string,
    data: Partial<CreatePlanInput>
): Promise<PricingPlan> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price.toFixed(2);
    if (data.validityDays !== undefined) payload.validity_days = data.validityDays;
    if (data.locationId !== undefined) payload.location = data.locationId;

    const credits = creditCountForPayload(data);
    if (credits !== undefined) payload.credit_count = credits;

    const response = await apiClient.patch<BackendPackageType>(
        `/scheduling/package-types/${id}/`,
        payload
    );
    const plan = mapBackendPackageTypeToPlan(response);
    return {
        ...plan,
        locationId: plan.locationId || data.locationId,
        locationName: plan.locationName || data.locationName,
    };
}

/** DELETE /api/v1/scheduling/package-types/{id}/ */
export async function deletePricingOptionApi(id: string): Promise<void> {
    try {
        await apiClient.delete(`/scheduling/package-types/${id}/`);
    } catch (error) {
        // Already deleted (e.g. double-click after a successful 204)
        if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) {
            return;
        }
        throw error;
    }
}

export async function archivePricingOptionApi(id: string): Promise<PricingPlan> {
    const plan = await fetchPricingOptionFromApi(id);
    if (!plan) throw new Error('Package type not found');
    return plan;
}
