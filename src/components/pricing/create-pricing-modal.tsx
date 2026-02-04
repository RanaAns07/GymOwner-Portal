'use client';

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
import { useCreatePricingPlan } from '@/hooks/use-pricing';
import { planTypeLabels, billingCycleLabels } from '@/types/pricing';
import type { PlanType, BillingCycle } from '@/types/pricing';
import { Loader2 } from 'lucide-react';

const pricingSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(1, 'Description is required'),
    type: z.enum(['membership', 'class-pack']),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Price must be greater than 0',
    }),
    billingCycle: z.enum(['monthly', 'quarterly', 'yearly', 'one-time']),
    maxClasses: z.string().optional(),
    validityDays: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 1, {
        message: 'Validity must be at least 1 day',
    }),
    features: z.string(),
});

type PricingFormData = z.infer<typeof pricingSchema>;

interface CreatePricingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePricingModal({ open, onOpenChange }: CreatePricingModalProps) {
    const createPlan = useCreatePricingPlan();

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
            description: '',
            type: 'membership',
            price: '',
            billingCycle: 'monthly',
            maxClasses: '',
            validityDays: '30',
            features: '',
        },
    });

    const selectedType = watch('type');
    const selectedBillingCycle = watch('billingCycle');

    const onSubmit = async (data: PricingFormData) => {
        // Parse features from newline-separated string
        const featuresList = data.features
            .split('\n')
            .map((f) => f.trim())
            .filter((f) => f.length > 0);

        try {
            await createPlan.mutateAsync({
                name: data.name,
                description: data.description,
                type: data.type as PlanType,
                price: parseFloat(data.price),
                billingCycle: data.billingCycle as BillingCycle,
                features: featuresList.length > 0 ? featuresList : ['Full gym access'],
                maxClasses: data.type === 'class-pack' && data.maxClasses ? parseInt(data.maxClasses) : undefined,
                validityDays: parseInt(data.validityDays),
            });
            onOpenChange(false);
            reset();
        } catch {
            // Error handled by mutation
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Pricing Plan</DialogTitle>
                    <DialogDescription>
                        Add a new membership or class pack to your offerings.
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
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Full access with personal training sessions"
                            {...register('description')}
                            className={cn(errors.description && 'border-red-500')}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                        <div className="space-y-2">
                            <Label>Billing Cycle</Label>
                            <Select
                                value={selectedBillingCycle}
                                onValueChange={(value) => setValue('billingCycle', value as BillingCycle)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(billingCycleLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                                <p className="text-xs text-red-500">{errors.validityDays.message}</p>
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
                            />
                            <p className="text-xs text-zinc-500">
                                Number of sessions included in this pack
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="features">Features (one per line)</Label>
                        <textarea
                            id="features"
                            placeholder={"24/7 gym access\n2 PT sessions/month\nAll group classes"}
                            rows={4}
                            {...register('features')}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <p className="text-xs text-zinc-500">
                            Enter each feature on a new line
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createPlan.isPending}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600"
                        >
                            {createPlan.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
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
