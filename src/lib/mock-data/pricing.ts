import { PricingPlan } from '@/types/pricing';

export const mockPricingPlans: PricingPlan[] = [
    {
        id: '1',
        name: 'Basic Membership',
        description: 'Access to gym facilities during regular hours',
        type: 'membership',
        price: 49.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
            'Gym access 6AM-10PM',
            'Locker room access',
            'Basic equipment usage',
            'Free parking',
        ],
        status: 'active',
        createdAt: '2023-01-15',
        subscriberCount: 156,
    },
    {
        id: '2',
        name: 'Premium Membership',
        description: 'Full access with personal training sessions',
        type: 'membership',
        price: 99.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
            '24/7 gym access',
            '2 PT sessions/month',
            'All group classes',
            'Sauna & spa access',
            'Nutrition consultation',
            'Guest passes (2/month)',
        ],
        status: 'active',
        createdAt: '2023-01-15',
        subscriberCount: 89,
    },
    {
        id: '3',
        name: 'Annual Elite',
        description: 'Best value for committed members',
        type: 'membership',
        price: 899.99,
        currency: 'USD',
        billingCycle: 'yearly',
        features: [
            'All Premium features',
            '4 PT sessions/month',
            'Priority booking',
            'Free merchandise',
            'Unlimited guest passes',
        ],
        status: 'active',
        createdAt: '2023-02-01',
        subscriberCount: 34,
    },
    {
        id: '4',
        name: '10-Class Pack',
        description: 'Flexible class package for drop-in members',
        type: 'class-pack',
        price: 120,
        currency: 'USD',
        billingCycle: 'one-time',
        maxClasses: 10,
        validityDays: 90,
        features: [
            'Any group class',
            '90-day validity',
            'Shareable with family',
        ],
        status: 'active',
        createdAt: '2023-03-10',
        subscriberCount: 67,
    },
    {
        id: '5',
        name: '25-Class Pack',
        description: 'Best value class package',
        type: 'class-pack',
        price: 250,
        currency: 'USD',
        billingCycle: 'one-time',
        maxClasses: 25,
        validityDays: 180,
        features: [
            'Any group class',
            '180-day validity',
            'Shareable with family',
            'Priority booking',
        ],
        status: 'active',
        createdAt: '2023-03-10',
        subscriberCount: 42,
    },
    {
        id: '6',
        name: 'Student Membership',
        description: 'Discounted access for students',
        type: 'membership',
        price: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
            'Gym access 6AM-6PM',
            'Basic equipment usage',
            'Student ID required',
        ],
        status: 'archived',
        createdAt: '2023-01-15',
        subscriberCount: 0,
    },
];

export async function fetchPricingPlans(): Promise<PricingPlan[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockPricingPlans;
}

export async function createPricingPlan(
    data: Omit<PricingPlan, 'id' | 'createdAt' | 'subscriberCount'>
): Promise<PricingPlan> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newPlan: PricingPlan = {
        ...data,
        id: String(mockPricingPlans.length + 1),
        createdAt: new Date().toISOString().split('T')[0],
        subscriberCount: 0,
    };
    mockPricingPlans.push(newPlan);
    return newPlan;
}
