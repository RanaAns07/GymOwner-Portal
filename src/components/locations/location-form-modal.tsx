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
import { cn } from '@/lib/utils';
import {
    useCreateLocation,
    useUpdateLocation,
    type BackendLocation,
} from '@/hooks/use-locations';
import { Loader2 } from 'lucide-react';

const locationSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    address: z.string().min(2, 'Address is required'),
    timezone: z.string().min(2, 'Timezone is required'),
    phone: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location?: BackendLocation | null;
}

export function LocationFormModal({
    open,
    onOpenChange,
    location,
}: LocationFormModalProps) {
    const createLocation = useCreateLocation();
    const updateLocation = useUpdateLocation();
    const isEditing = !!location;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<LocationFormData>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            name: '',
            address: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            phone: '',
        },
    });

    useEffect(() => {
        if (!open) return;
        if (location) {
            reset({
                name: location.name || '',
                address: location.address || '',
                timezone:
                    location.timezone ||
                    Intl.DateTimeFormat().resolvedOptions().timeZone ||
                    'UTC',
                phone: location.phone || '',
            });
        } else {
            reset({
                name: '',
                address: '',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                phone: '',
            });
        }
    }, [open, location, reset]);

    const isPending = createLocation.isPending || updateLocation.isPending;

    const onSubmit = async (data: LocationFormData) => {
        try {
            if (isEditing && location) {
                await updateLocation.mutateAsync({
                    id: location.id,
                    data: {
                        name: data.name,
                        address: data.address,
                        timezone: data.timezone,
                        phone: data.phone || undefined,
                    },
                });
            } else {
                await createLocation.mutateAsync({
                    name: data.name,
                    address: data.address,
                    timezone: data.timezone,
                    phone: data.phone || undefined,
                });
            }
            onOpenChange(false);
        } catch {
            // Toast handled in hooks
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit location' : 'Add location'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update this gym location.'
                            : 'Add a new location for your gym.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="location-name">Name</Label>
                        <Input
                            id="location-name"
                            placeholder="Main Studio"
                            {...register('name')}
                            className={cn(errors.name && 'border-red-500')}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location-address">Address</Label>
                        <Input
                            id="location-address"
                            placeholder="123 Fitness Ave"
                            {...register('address')}
                            className={cn(errors.address && 'border-red-500')}
                        />
                        {errors.address && (
                            <p className="text-xs text-red-500">{errors.address.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location-timezone">Timezone</Label>
                        <Input
                            id="location-timezone"
                            placeholder="America/New_York"
                            {...register('timezone')}
                            className={cn(errors.timezone && 'border-red-500')}
                        />
                        {errors.timezone && (
                            <p className="text-xs text-red-500">{errors.timezone.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location-phone">Phone (optional)</Label>
                        <Input
                            id="location-phone"
                            placeholder="+1 555-0100"
                            {...register('phone')}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : isEditing ? (
                                'Save changes'
                            ) : (
                                'Add location'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
