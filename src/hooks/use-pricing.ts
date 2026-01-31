import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchPricingPlans, createPricingPlan } from '@/lib/mock-data/pricing';
import type { PricingPlan, CreatePlanInput } from '@/types/pricing';

export const pricingKeys = {
    all: ['pricing'] as const,
    lists: () => [...pricingKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...pricingKeys.lists(), filters] as const,
};

export function usePricingPlans(filters?: { type?: string; status?: string }) {
    return useQuery({
        queryKey: pricingKeys.list(filters || {}),
        queryFn: async () => {
            let data = await fetchPricingPlans();

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
        mutationFn: (data: CreatePlanInput) =>
            createPricingPlan({
                ...data,
                currency: 'USD',
                status: 'active',
            }),
        onSuccess: (newPlan) => {
            queryClient.invalidateQueries({ queryKey: pricingKeys.lists() });
            toast.success(`"${newPlan.name}" has been created!`);
        },
        onError: () => {
            toast.error('Failed to create pricing plan. Please try again.');
        },
    });
}
