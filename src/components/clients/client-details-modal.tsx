'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/clients';
import { clientStatusConfig } from '@/types/clients';
import { planTypeLabels } from '@/types/pricing';
import { useAssignPass, useClientPasses } from '@/hooks/use-clients';
import { usePricingPlans } from '@/hooks/use-pricing';
import { Calendar, Loader2, Mail, Phone, UserCircle } from 'lucide-react';

interface ClientDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client | null;
}

function expiresAtFromValidityDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + Math.max(days, 1));
    return date.toISOString();
}

export function ClientDetailsModal({
    open,
    onOpenChange,
    client,
}: ClientDetailsModalProps) {
    const [planId, setPlanId] = useState('');
    const { data: plans, isLoading: plansLoading } = usePricingPlans();
    const { data: passes, isLoading: passesLoading } = useClientPasses(
        open && client ? client.id : ''
    );
    const assignPass = useAssignPass();

    useEffect(() => {
        if (!open) setPlanId('');
    }, [open]);

    const selectedPlan = useMemo(
        () => plans?.find((p) => p.id === planId),
        [plans, planId]
    );

    if (!client) return null;

    const initials = (
        `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}` ||
        client.email?.[0] ||
        '?'
    ).toUpperCase();
    const status = clientStatusConfig[client.status];
    const fullName = `${client.firstName} ${client.lastName}`.trim();
    const activePasses = (passes || []).filter((p) => p.isActive);

    const handleAssign = async () => {
        if (!selectedPlan) return;

        const creditsRemaining =
            selectedPlan.type === 'membership'
                ? 0
                : selectedPlan.maxClasses && selectedPlan.maxClasses > 0
                  ? selectedPlan.maxClasses
                  : 1;

        try {
            await assignPass.mutateAsync({
                clientId: client.id,
                packageTypeId: selectedPlan.id,
                creditsRemaining,
                expiresAt: expiresAtFromValidityDays(selectedPlan.validityDays || 30),
            });
            setPlanId('');
        } catch {
            // Toast handled in hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Client details</DialogTitle>
                    <DialogDescription>
                        View profile and assign a pricing plan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={client.avatar} alt={fullName} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-lg font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900">{fullName}</h3>
                            <Badge
                                variant="secondary"
                                className={cn('mt-2 text-xs font-medium', status.color)}
                            >
                                {status.label}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 text-sm">
                        <div className="flex items-center gap-2 text-zinc-700">
                            <Mail className="h-4 w-4 text-zinc-400" />
                            <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone ? (
                            <div className="flex items-center gap-2 text-zinc-700">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                <span>{client.phone}</span>
                            </div>
                        ) : null}
                        <div className="flex items-center gap-2 text-zinc-700">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            <span>
                                Joined{' '}
                                {new Date(client.joinDate).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-700">
                            <UserCircle className="h-4 w-4 text-zinc-400" />
                            <span>
                                {(() => {
                                    const pass = activePasses[0];
                                    if (pass) {
                                        return (
                                            plans?.find((p) => p.id === pass.pricingOptionId)
                                                ?.name || pass.pricingOptionName
                                        );
                                    }
                                    if (
                                        client.membershipName &&
                                        client.membershipName !== 'No Active Plan'
                                    ) {
                                        return client.membershipName;
                                    }
                                    return 'No active membership';
                                })()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-zinc-800">Active packages</p>
                            {passesLoading ? (
                                <p className="mt-1 text-sm text-zinc-400">Loading…</p>
                            ) : activePasses.length > 0 ? (
                                <ul className="mt-2 space-y-2">
                                    {activePasses.map((pass) => {
                                        const planName =
                                            plans?.find((p) => p.id === pass.pricingOptionId)
                                                ?.name || pass.pricingOptionName;
                                        return (
                                        <li
                                            key={pass.id}
                                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                                        >
                                            <p className="font-medium text-zinc-900">
                                                {planName}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {pass.sessionsRemaining > 0
                                                    ? `${pass.sessionsRemaining} credits left`
                                                    : 'Membership'}
                                                {pass.expiresAt
                                                    ? ` · expires ${new Date(
                                                          pass.expiresAt
                                                      ).toLocaleDateString('en-US', {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      })}`
                                                    : ''}
                                            </p>
                                        </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="mt-1 text-sm text-zinc-400">
                                    No active pricing plan assigned.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Assign pricing plan</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={planId}
                                    onValueChange={setPlanId}
                                    disabled={plansLoading || !plans?.length}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue
                                            placeholder={
                                                plansLoading
                                                    ? 'Loading plans…'
                                                    : 'Select a plan'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(plans || []).map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id}>
                                                {plan.name}
                                                {plan.locationName
                                                    ? ` · ${plan.locationName}`
                                                    : ''}{' '}
                                                ({planTypeLabels[plan.type]})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    onClick={handleAssign}
                                    disabled={
                                        !planId ||
                                        assignPass.isPending ||
                                        !plans?.length
                                    }
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                                >
                                    {assignPass.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Assign'
                                    )}
                                </Button>
                            </div>
                            {!plansLoading && (!plans || plans.length === 0) && (
                                <p className="text-xs text-amber-600">
                                    No pricing plans yet. Create one under Pricing first.
                                </p>
                            )}
                            {selectedPlan && (
                                <p className="text-xs text-zinc-500">
                                    {selectedPlan.type === 'class-pack'
                                        ? `${selectedPlan.maxClasses || 0} credits`
                                        : 'Membership'}
                                    {' · '}
                                    valid {selectedPlan.validityDays || 30} days
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
