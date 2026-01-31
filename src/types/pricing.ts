// Pricing plan type definitions

export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    type: PlanType;
    price: number;
    currency: string;
    billingCycle: BillingCycle;
    features: string[];
    status: PlanStatus;
    maxClasses?: number; // For class packs
    validityDays?: number; // For class packs
    createdAt: string;
    subscriberCount: number;
}

export type PlanType = 'membership' | 'class-pack';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly' | 'one-time';
export type PlanStatus = 'active' | 'archived' | 'draft';

export interface CreatePlanInput {
    name: string;
    description: string;
    type: PlanType;
    price: number;
    billingCycle: BillingCycle;
    features: string[];
    maxClasses?: number;
    validityDays?: number;
}

// Display labels and config
export const planTypeLabels: Record<PlanType, string> = {
    membership: 'Membership',
    'class-pack': 'Class Pack',
};

export const billingCycleLabels: Record<BillingCycle, string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
    'one-time': 'One-time',
};

export const planStatusConfig: Record<PlanStatus, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    archived: { label: 'Archived', color: 'bg-zinc-100 text-zinc-600' },
    draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700' },
};
