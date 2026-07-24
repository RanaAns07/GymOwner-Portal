'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCreatePricingPlan, useUpdatePricingPlan } from '@/hooks/use-pricing';
import { useLocations } from '@/hooks/use-locations';
import { planTypeLabels } from '@/types/pricing';
import type { PlanType, PricingPlan } from '@/types/pricing';
import { Loader2 } from 'lucide-react';

/**
 * Form fields match package-types API:
 * name, credit_count (via type + maxClasses), price, validity_days, location
 */
const pricingSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        type: z.enum(['membership', 'class-pack']),
        locationId: z.string().min(1, 'Please select a location'),
        price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Price must be greater than 0',
        }),
        maxClasses: z.string().optional(),
        validityDays: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 1, {
            message: 'Validity must be at least 1 day',
        }),
    })
    .superRefine((data, ctx) => {
        if (data.type === 'class-pack') {
            const credits = parseInt(data.maxClasses || '', 10);
            if (Number.isNaN(credits) || credits < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Session credits must be at least 1',
                    path: ['maxClasses'],
                });
            }
        }
    });

type PricingFormData = z.infer<typeof pricingSchema>;

interface CreatePricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan?: PricingPlan | null;
}

export function CreatePricingModal({
    open,
    onOpenChange,
    plan = null,
}: CreatePricingModalProps) {
    const createPlan = useCreatePricingPlan();
    const updatePlan = useUpdatePricingPlan();
    const { data: locations, isLoading: locationsLoading } = useLocations();
    const isEditing = !!plan;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<PricingFormData>({
        resolver: zodResolver(pricingSchema),
        defaultValues: {
            name: '',
            type: 'membership',
            locationId: '',
            price: '',
            maxClasses: '10',
            validityDays: '30',
        },
    });

    useEffect(() => {
        if (!open) return;
        if (plan) {
            reset({
                name: plan.name,
                type: plan.type,
                locationId: plan.locationId || locations?.[0]?.id || '',
                price: String(plan.price),
                maxClasses:
                    plan.type === 'class-pack' && plan.maxClasses
                        ? String(plan.maxClasses)
                        : '10',
                validityDays: String(plan.validityDays || 30),
            });
        } else {
            reset({
                name: '',
                type: 'membership',
                locationId: locations?.[0]?.id || '',
                price: '',
                maxClasses: '10',
                validityDays: '30',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, plan, reset]);

    const selectedType = watch('type');
    const selectedLocationId = watch('locationId');
    const isPending = createPlan.isPending || updatePlan.isPending;

    useEffect(() => {
        if (!open || !locations?.length) return;
        if (
            !selectedLocationId ||
            !locations.some((l) => l.id === selectedLocationId)
        ) {
            setValue('locationId', locations[0].id, { shouldValidate: true });
        }
    }, [open, locations, selectedLocationId, setValue]);

    const onSubmit = async (data: PricingFormData) => {
        const validityDays = parseInt(data.validityDays, 10);
        const locationName =
            locations?.find((l) => l.id === data.locationId)?.name || '';
        const payload = {
            name: data.name,
            description: '',
            type: data.type as PlanType,
            price: parseFloat(data.price),
            billingCycle:
                validityDays <= 31
                    ? ('monthly' as const)
                    : validityDays <= 93
                      ? ('quarterly' as const)
                      : validityDays >= 360
                        ? ('yearly' as const)
                        : ('one-time' as const),
            features: [] as string[],
            maxClasses:
                data.type === 'class-pack' ? parseInt(data.maxClasses || '1', 10) : 0,
            validityDays,
            locationId: data.locationId,
            locationName,
        };

        try {
            if (isEditing && plan) {
                await updatePlan.mutateAsync({ id: plan.id, data: payload });
            } else {
                await createPlan.mutateAsync(payload);
            }
            onOpenChange(false);
            reset();
        } catch {
            // Error handled by mutation
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    onOpenChange(false);
                    reset();
                } else {
                    onOpenChange(true);
                }
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update this plan.'
                            : 'Add a membership or class pack for a location.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                            id="name"
                            placeholder="Premium Membership"
                            {...register('name')}
                            className={cn(errors.name && 'border-red-500')}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                            value={selectedLocationId}
                            onValueChange={(value) =>
                                setValue('locationId', value, { shouldValidate: true })
                            }
                            disabled={locationsLoading || !locations?.length}
                        >
                            <SelectTrigger
                                className={cn(errors.locationId && 'border-red-500')}
                            >
                                <SelectValue
                                    placeholder={
                                        locationsLoading
                                            ? 'Loading locations…'
                                            : 'Select location'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {(locations || []).map((location) => (
                                    <SelectItem key={location.id} value={location.id}>
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.locationId && (
                            <p className="text-xs text-red-500">
                                {errors.locationId.message}
                            </p>
                        )}
                        {!locationsLoading && (!locations || locations.length === 0) && (
                            <p className="text-xs text-amber-600">
                                No locations yet. Add one under Locations first.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Plan Type</Label>
                        <Select
                            value={selectedType}
                            onValueChange={(value) => setValue('type', value as PlanType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(planTypeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="99.99"
                                {...register('price')}
                                className={cn(errors.price && 'border-red-500')}
                            />
                            {errors.price && (
                                <p className="text-xs text-red-500">{errors.price.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="validityDays">Validity (Days)</Label>
                            <Input
                                id="validityDays"
                                type="number"
                                min="1"
                                placeholder="30"
                                {...register('validityDays')}
                                className={cn(errors.validityDays && 'border-red-500')}
                            />
                            {errors.validityDays && (
                                <p className="text-xs text-red-500">
                                    {errors.validityDays.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {selectedType === 'class-pack' && (
                        <div className="space-y-2">
                            <Label htmlFor="maxClasses">Session Credits</Label>
                            <Input
                                id="maxClasses"
                                type="number"
                                min="1"
                                placeholder="10"
                                {...register('maxClasses')}
                                className={cn(errors.maxClasses && 'border-red-500')}
                            />
                            {errors.maxClasses && (
                                <p className="text-xs text-red-500">
                                    {errors.maxClasses.message}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                reset();
                            }}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isPending ||
                                locationsLoading ||
                                !locations?.length
                            }
                            className="bg-gradient-to-r from-violet-600 to-indigo-600"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : isEditing ? (
                                'Save changes'
                            ) : (
                                'Create Plan'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
