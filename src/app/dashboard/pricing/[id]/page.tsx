'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    DetailHero,
    DetailPageShell,
} from '@/components/layout/detail-page-shell';
import { CreatePricingModal } from '@/components/pricing/create-pricing-modal';
import { usePricingPlans } from '@/hooks/use-pricing';
import {
    billingCycleLabels,
    planTypeLabels,
} from '@/types/pricing';
import { ArrowLeft, CreditCard, MapPin, Pencil } from 'lucide-react';

export default function PricingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: plans, isLoading } = usePricingPlans();
    const [editOpen, setEditOpen] = useState(false);

    const plan = useMemo(() => plans?.find((p) => p.id === id), [plans, id]);

    if (isLoading) {
        return (
            <div className="-m-6 bg-[#0b1220] px-6 py-10 lg:-m-8">
                <Skeleton className="h-10 w-56 bg-white/10" />
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-lg font-semibold text-ink">Plan not found</p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/dashboard/pricing">
                        <ArrowLeft className="h-4 w-4" />
                        Back to pricing
                    </Link>
                </Button>
            </div>
        );
    }

    const status = plan.status ?? (plan.isActive === false ? 'archived' : 'active');

    return (
        <>
            <DetailPageShell
                backHref="/dashboard/pricing"
                backLabel="Back to pricing"
                actions={
                    <Button
                        className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
                        Edit plan
                    </Button>
                }
                hero={
                    <DetailHero
                        eyebrow="Pricing plan"
                        title={plan.name}
                        meta={
                            <>
                                <Badge className="rounded-lg bg-primary/20 text-primary hover:bg-primary/20">
                                    {planTypeLabels[plan.type]}
                                </Badge>
                                <Badge variant="secondary" className="rounded-lg capitalize">
                                    {status}
                                </Badge>
                            </>
                        }
                        stats={
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:min-w-[160px]">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                    Price
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-primary">
                                    ${plan.price.toFixed(2)}
                                </p>
                                <p className="mt-0.5 text-xs text-white/50">
                                    {billingCycleLabels[plan.billingCycle]}
                                </p>
                            </div>
                        }
                    />
                }
            >
                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Plan details
                        </h2>
                        <Separator className="my-4" />
                        <p className="text-sm leading-relaxed text-ink-muted">
                            {plan.description || 'No description provided.'}
                        </p>
                        <ul className="mt-5 space-y-3 text-sm">
                            <li className="flex items-center gap-3">
                                <CreditCard className="h-4 w-4 text-accent-foreground" />
                                <span className="text-ink">
                                    {plan.type === 'class-pack'
                                        ? `${plan.maxClasses ?? 0} credits`
                                        : 'Membership'}
                                    {plan.validityDays
                                        ? ` · ${plan.validityDays} day validity`
                                        : ''}
                                </span>
                            </li>
                            {plan.locationId ? (
                                <li className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 text-accent-foreground" />
                                    <Link
                                        href={`/dashboard/locations/${plan.locationId}`}
                                        className="font-medium text-accent-foreground hover:underline"
                                    >
                                        {plan.locationName || 'View location'}
                                    </Link>
                                </li>
                            ) : null}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Features
                        </h2>
                        <Separator className="my-4" />
                        {(plan.features || []).length > 0 ? (
                            <ul className="space-y-2">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="rounded-xl border border-border bg-canvas/40 px-3 py-2 text-sm text-ink"
                                    >
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-ink-muted">No features listed.</p>
                        )}
                    </section>
                </div>
            </DetailPageShell>

            <CreatePricingModal
                open={editOpen}
                onOpenChange={setEditOpen}
                plan={plan}
            />
        </>
    );
}
