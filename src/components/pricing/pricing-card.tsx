'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PricingPlan } from '@/types/pricing';
import { planTypeLabels, billingCycleLabels, planStatusConfig } from '@/types/pricing';
import { Check, MoreVertical, Edit, Archive, Trash2, Users, Sparkles } from 'lucide-react';

interface PricingCardProps {
    plan: PricingPlan;
    onEdit?: (plan: PricingPlan) => void;
    onArchive?: (plan: PricingPlan) => void;
    onDelete?: (plan: PricingPlan) => void;
    featured?: boolean;
}

export function PricingCard({ plan, onEdit, onArchive, onDelete, featured }: PricingCardProps) {
    const status = planStatusConfig[plan.status];
    const isPopular = plan.subscriberCount > 50;

    return (
        <Card
            className={cn(
                "relative flex flex-col overflow-hidden border-zinc-200/60 bg-white transition-all duration-300 hover:shadow-lg",
                featured && "border-violet-200 ring-2 ring-violet-500/20"
            )}
        >
            {/* Popular Badge */}
            {isPopular && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-lg shadow-violet-500/25">
                    <Sparkles className="h-3 w-3" />
                    Popular
                </div>
            )}

            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-normal">
                                {planTypeLabels[plan.type]}
                            </Badge>
                            <Badge variant="secondary" className={cn("text-xs", status.color)}>
                                {status.label}
                            </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{plan.description}</p>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit?.(plan)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onArchive?.(plan)}>
                                <Archive className="mr-2 h-4 w-4" />
                                {plan.status === 'archived' ? 'Restore' : 'Archive'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => onDelete?.(plan)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Price */}
                <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight text-zinc-900">
                            ${plan.price.toFixed(2)}
                        </span>
                        <span className="text-sm font-medium text-zinc-500">
                            /{billingCycleLabels[plan.billingCycle].toLowerCase()}
                        </span>
                    </div>
                    {plan.type === 'class-pack' && plan.maxClasses && (
                        <p className="mt-1 text-sm text-zinc-500">
                            {plan.maxClasses} classes • Valid for {plan.validityDays} days
                        </p>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
                {/* Features */}
                <ul className="space-y-2.5">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                <Check className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="text-sm text-zinc-600">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Users className="h-4 w-4" />
                        <span>{plan.subscriberCount} subscribers</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => onEdit?.(plan)}
                    >
                        Manage Plan
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

export function PricingCardSkeleton() {
    return (
        <Card className="border-zinc-200/60 bg-white">
            <CardHeader className="pb-4">
                <div className="flex gap-2 mb-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-7 w-40" />
                <Skeleton className="mt-1 h-4 w-56" />
                <div className="mt-4">
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
                <Skeleton className="h-4 w-24" />
            </CardFooter>
        </Card>
    );
}
