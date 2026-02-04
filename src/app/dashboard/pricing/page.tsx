'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricingCard, PricingCardSkeleton } from '@/components/pricing/pricing-card';
import { CreatePricingModal } from '@/components/pricing/create-pricing-modal';
import { usePricingPlans, useArchivePricingPlan, useDeletePricingPlan } from '@/hooks/use-pricing';
import { Plus, CreditCard, Package, TrendingUp, DollarSign } from 'lucide-react';
import type { PricingPlan } from '@/types/pricing';

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState<string>('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const { data: plans, isLoading } = usePricingPlans();
    const archivePlan = useArchivePricingPlan();
    const deletePlan = useDeletePricingPlan();

    // Filter plans by type
    const filteredPlans = plans?.filter((plan) => {
        if (activeTab === 'all') return plan.status === 'active';
        if (activeTab === 'membership') return plan.type === 'membership' && plan.status === 'active';
        if (activeTab === 'class-pack') return plan.type === 'class-pack' && plan.status === 'active';
        if (activeTab === 'archived') return plan.status === 'archived';
        return true;
    });

    // Stats
    const activePlansCount = plans?.filter((p) => p.status === 'active').length || 0;
    const totalSubscribers = plans?.reduce((acc, p) => acc + (p.subscriberCount ?? 0), 0) || 0;
    const monthlyRevenue = plans
        ?.filter((p) => p.status === 'active' && p.billingCycle === 'monthly')
        .reduce((acc, p) => acc + p.price * (p.subscriberCount ?? 0), 0) || 0;

    const handleArchive = (plan: PricingPlan) => {
        archivePlan.mutate(plan.id);
    };

    const handleDelete = (plan: PricingPlan) => {
        if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
            deletePlan.mutate(plan.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pricing Engine</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Manage membership plans and class packages.
                    </p>
                </div>
                <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Create Plan
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                            <CreditCard className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Active Plans</p>
                            <p className="text-2xl font-bold text-zinc-900">{activePlansCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                            <Package className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Subscribers</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalSubscribers}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Monthly Revenue</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                ${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <TrendingUp className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Avg. Plan Value</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                ${activePlansCount > 0 && plans
                                    ? (plans.filter((p) => p.status === 'active')
                                        .reduce((acc, p) => acc + p.price, 0) / activePlansCount
                                    ).toFixed(2)
                                    : '0.00'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-zinc-100">
                        <TabsTrigger value="all">All Active</TabsTrigger>
                        <TabsTrigger value="membership">Memberships</TabsTrigger>
                        <TabsTrigger value="class-pack">Class Packs</TabsTrigger>
                        <TabsTrigger value="archived">Archived</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <PricingCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredPlans && filteredPlans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPlans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            featured={plan.name === 'Premium Membership'}
                            onEdit={(p) => console.log('Edit:', p)}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                        <CreditCard className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-zinc-900">No plans found</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                        Create your first pricing plan to get started.
                    </p>
                    <Button
                        onClick={() => setCreateModalOpen(true)}
                        className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Plan
                    </Button>
                </div>
            )}

            {/* Create Pricing Modal */}
            <CreatePricingModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />
        </div>
    );
}
