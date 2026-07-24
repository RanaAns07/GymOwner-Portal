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
import { useStaffMembers } from '@/hooks/use-staff';
import { useCreateSession } from '@/hooks/use-schedule';
import { useLocations } from '@/hooks/use-locations';
import { sessionTypeLabels } from '@/types/schedule';
import type { SessionType } from '@/types/schedule';
import { Loader2 } from 'lucide-react';

const sessionSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    type: z.enum(['group-class', 'personal-training', 'workshop', 'open-gym']),
    trainerId: z.string().min(1, 'Please select a trainer'),
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    capacity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 1, {
        message: 'Capacity must be at least 1',
    }),
    locationId: z.string().min(1, 'Please select a location'),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface CreateSessionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialDate?: Date;
    initialHour?: number;
}

export function CreateSessionModal({
    open,
    onOpenChange,
    initialDate,
    initialHour,
}: CreateSessionModalProps) {
    const { data: staff } = useStaffMembers();
    const { data: locations, isLoading: locationsLoading } = useLocations();
    const createSession = useCreateSession();

    const getDefaultDate = () => {
        const date = initialDate || new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getDefaultTime = (hour?: number) => {
        const h = hour ?? new Date().getHours();
        return `${h.toString().padStart(2, '0')}:00`;
    };

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<SessionFormData>({
        resolver: zodResolver(sessionSchema),
        defaultValues: {
            title: '',
            type: 'group-class',
            trainerId: '',
            date: getDefaultDate(),
            startTime: getDefaultTime(initialHour),
            endTime: getDefaultTime(initialHour ? initialHour + 1 : undefined),
            capacity: '10',
            locationId: '',
        },
    });

    // Prefill with live locations when modal opens
    useEffect(() => {
        if (!open) return;

        reset({
            title: '',
            type: 'group-class',
            trainerId: '',
            date: getDefaultDate(),
            startTime: getDefaultTime(initialHour),
            endTime: getDefaultTime(initialHour ? initialHour + 1 : undefined),
            capacity: '10',
            locationId: locations?.[0]?.id || '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialDate, initialHour]);

    const selectedType = watch('type');
    const selectedLocationId = watch('locationId');

    useEffect(() => {
        if (!open || !locations?.length) return;
        if (!selectedLocationId || !locations.some((l) => l.id === selectedLocationId)) {
            setValue('locationId', locations[0].id, { shouldValidate: true });
        }
    }, [open, locations, selectedLocationId, setValue]);

    const onSubmit = async (data: SessionFormData) => {
        // Keep wall-clock local times (no toISOString UTC shift)
        const startTime = `${data.date}T${data.startTime}:00`;
        const endTime = `${data.date}T${data.endTime}:00`;
        const locationName =
            locations?.find((l) => l.id === data.locationId)?.name || 'Studio';

        try {
            await createSession.mutateAsync({
                title: data.title,
                type: data.type as SessionType,
                trainerId: data.trainerId,
                startTime,
                endTime,
                capacity: parseInt(data.capacity),
                locationId: data.locationId,
                locationName,
            });
            onOpenChange(false);
        } catch {
            // Error handled by mutation
        }
    };

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) onOpenChange(false);
    };

    const trainers = staff?.filter((s) => s.role === 'trainer' && s.status === 'active') || [];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Session</DialogTitle>
                    <DialogDescription>
                        Schedule a new class or training session.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Session Title</Label>
                        <Input
                            id="title"
                            placeholder="Morning HIIT"
                            {...register('title')}
                            className={cn(errors.title && 'border-red-500')}
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Session Type</Label>
                            <Select
                                value={selectedType}
                                onValueChange={(value) => setValue('type', value as SessionType)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(sessionTypeLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Trainer</Label>
                            <Select
                                value={watch('trainerId')}
                                onValueChange={(value) => setValue('trainerId', value)}
                            >
                                <SelectTrigger
                                    className={cn(errors.trainerId && 'border-red-500')}
                                >
                                    <SelectValue placeholder="Select trainer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {trainers.map((trainer) => (
                                        <SelectItem key={trainer.id} value={trainer.id}>
                                            {trainer.firstName} {trainer.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.trainerId && (
                                <p className="text-xs text-red-500">
                                    {errors.trainerId.message}
                                </p>
                            )}
                        </div>
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
                            <p className="text-xs text-red-500">{errors.locationId.message}</p>
                        )}
                        {!locationsLoading && (!locations || locations.length === 0) && (
                            <p className="text-xs text-amber-700">
                                No locations yet. Add one under Locations first.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            {...register('date')}
                            className={cn(errors.date && 'border-red-500')}
                        />
                        {errors.date && (
                            <p className="text-xs text-red-500">{errors.date.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                {...register('startTime')}
                                className={cn(errors.startTime && 'border-red-500')}
                            />
                            {errors.startTime && (
                                <p className="text-xs text-red-500">
                                    {errors.startTime.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                {...register('endTime')}
                                className={cn(errors.endTime && 'border-red-500')}
                            />
                            {errors.endTime && (
                                <p className="text-xs text-red-500">{errors.endTime.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                            id="capacity"
                            type="number"
                            min={1}
                            {...register('capacity')}
                            className={cn(errors.capacity && 'border-red-500')}
                        />
                        {errors.capacity && (
                            <p className="text-xs text-red-500">{errors.capacity.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                createSession.isPending ||
                                locationsLoading ||
                                !locations?.length
                            }
                            className="bg-gradient-to-r from-violet-600 to-indigo-600"
                        >
                            {createSession.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Session'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
