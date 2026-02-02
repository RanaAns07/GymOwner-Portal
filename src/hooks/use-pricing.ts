import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchPricingOptionsFromApi,
    createPricingOptionApi,
    updatePricingOptionApi,
    deletePricingOptionApi,
    archivePricingOptionApi,
} from '@/lib/api/pricing-api';
import type { PricingPlan, CreatePlanInput } from '@/types/pricing';

export const pricingKeys = {
    all: ['pricing'] as const,
    lists: () => [...pricingKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...pricingKeys.lists(), filters] as const,
    details: () => [...pricingKeys.all, 'detail'] as const,
    detail: (id: string) => [...pricingKeys.details(), id] as const,
};

export function usePricingPlans(filters?: { type?: string; status?: string }) {
    return useQuery({
        queryKey: pricingKeys.list(filters || {}),
        queryFn: async () => {
            let data = await fetchPricingOptionsFromApi();

            if (filters?.type) {
                data = data.filter((plan) => plan.type === filters.type);
            }
            if (filters?.status) {
                data = data.filter((plan) => plan.status === filters.status);
            }

            return data;
        },
    });
}

export function useCreatePricingPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePlanInput) => createPricingOptionApi(data),
        onSuccess: (newPlan) => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.lists() });
            toast.success(`"${newPlan.name}" has been created!`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to create pricing plan';
            toast.error(message);
            console.error('Create pricing plan error:', error);
        },
    });
}

export function useUpdatePricingPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlanInput> }) =>
            updatePricingOptionApi(id, data),
        onSuccess: (updatedPlan) => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.lists() });
            queryClient.setQueryData(pricingKeys.detail(updatedPlan.id), updatedPlan);
            toast.success('Pricing plan updated successfully!');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to update pricing plan';
            toast.error(message);
            console.error('Update pricing plan error:', error);
        },
    });
}

export function useDeletePricingPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deletePricingOptionApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.lists() });
            toast.success('Pricing plan deleted successfully.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to delete pricing plan';
            toast.error(message);
            console.error('Delete pricing plan error:', error);
        },
    });
}

export function useArchivePricingPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => archivePricingOptionApi(id),
        onSuccess: (archivedPlan) => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.lists() });
            toast.success(`"${archivedPlan.name}" has been archived.`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to archive pricing plan';
            toast.error(message);
            console.error('Archive pricing plan error:', error);
        },
    });
}
