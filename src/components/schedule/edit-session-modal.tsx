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
import { useUpdateSession, useDeleteSession } from '@/hooks/use-schedule';
import { sessionTypeLabels } from '@/types/schedule';
import type { Session, SessionType } from '@/types/schedule';
import { Loader2, Trash2 } from 'lucide-react';

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
    location: z.string().min(1, 'Location is required'),
    roomUrl: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface EditSessionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: Session | null;
}

export function EditSessionModal({
    open,
    onOpenChange,
    session,
}: EditSessionModalProps) {
    const { data: staff } = useStaffMembers();
    const updateSession = useUpdateSession();
    const deleteSession = useDeleteSession();

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
            date: '',
            startTime: '',
            endTime: '',
            capacity: '10',
            location: '',
            roomUrl: '',
        },
    });

    // Populate form when session changes
    useEffect(() => {
        if (session) {
            const start = new Date(session.startTime);
            const end = new Date(session.endTime);

            reset({
                title: session.title,
                type: session.type,
                trainerId: session.trainerId,
                date: start.toISOString().split('T')[0],
                startTime: start.toTimeString().slice(0, 5),
                endTime: end.toTimeString().slice(0, 5),
                capacity: session.capacity.toString(),
                location: session.location,
                roomUrl: '',
            });
        }
    }, [session, reset]);

    const selectedType = watch('type');

    const onSubmit = async (data: SessionFormData) => {
        if (!session) return;

        const startDateTime = new Date(`${data.date}T${data.startTime}:00`);
        const endDateTime = new Date(`${data.date}T${data.endTime}:00`);

        try {
            await updateSession.mutateAsync({
                id: session.id,
                data: {
                    title: data.title,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    capacity: parseInt(data.capacity),
                    trainerId: data.trainerId,
                    location: data.location,
                    roomUrl: data.roomUrl,
                },
            });
            onOpenChange(false);
        } catch {
            // Error handled by mutation
        }
    };

    const handleDelete = async () => {
        if (!session) return;

        if (confirm(`Are you sure you want to delete "${session.title}"?`)) {
            try {
                await deleteSession.mutateAsync(session.id);
                onOpenChange(false);
            } catch {
                // Error handled by mutation
            }
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    const trainers = staff?.filter((s) => s.role === 'trainer' && s.status === 'active') || [];
    const isLoading = updateSession.isPending || deleteSession.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Session</DialogTitle>
                    <DialogDescription>
                        Update session details or delete it.
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
                                <SelectTrigger className={cn(errors.trainerId && 'border-red-500')}>
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            {...register('date')}
                            className={cn(errors.date && 'border-red-500')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                {...register('startTime')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                {...register('endTime')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min={1}
                                {...register('capacity')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                placeholder="Studio A"
                                {...register('location')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roomUrl">Room URL (Optional)</Label>
                        <Input
                            id="roomUrl"
                            type="url"
                            placeholder="https://zoom.us/j/..."
                            {...register('roomUrl')}
                        />
                        <p className="text-xs text-zinc-500">
                            Add a video conferencing link for virtual sessions
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600"
                            >
                                {updateSession.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
