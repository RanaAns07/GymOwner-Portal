'use client';

import { useEffect, useState } from 'react';
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
import {
    useCreateRoom,
    useUpdateRoom,
    type BackendRoom,
} from '@/hooks/use-rooms';
import { useLocations } from '@/hooks/use-locations';
import { useLocationFilter } from '@/providers/location-context';
import { Loader2, X } from 'lucide-react';

const roomSchema = z.object({
    location: z.string().min(1, 'Location is required'),
    name: z.string().min(2, 'Name is required'),
    capacity: z
        .number({ error: 'Capacity must be a number' })
        .min(1, 'Capacity must be at least 1'),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    room?: BackendRoom | null;
}

export function RoomFormModal({ open, onOpenChange, room }: RoomFormModalProps) {
    const createRoom = useCreateRoom();
    const updateRoom = useUpdateRoom();
    const { data: locations = [] } = useLocations();
    const { resolveLocationId } = useLocationFilter();
    const isEditing = !!room;
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RoomFormData>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            location: '',
            name: '',
            capacity: 20,
        },
    });

    const locationValue = watch('location');

    useEffect(() => {
        if (!open) return;
        if (room) {
            reset({
                location: room.location,
                name: room.name,
                capacity: room.capacity,
            });
            setTags(room.equipment_tags ?? []);
        } else {
            reset({
                location: resolveLocationId() || locations[0]?.id || '',
                name: '',
                capacity: 20,
            });
            setTags([]);
        }
        setTagInput('');
    }, [open, room, reset, resolveLocationId, locations]);

    const isPending = createRoom.isPending || updateRoom.isPending;

    const addTag = () => {
        const value = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
        if (!value || tags.includes(value)) return;
        setTags((prev) => [...prev, value]);
        setTagInput('');
    };

    const onSubmit = async (data: RoomFormData) => {
        try {
            if (isEditing && room) {
                await updateRoom.mutateAsync({
                    id: room.id,
                    data: {
                        location: data.location,
                        name: data.name,
                        capacity: data.capacity,
                        equipment_tags: tags,
                    },
                });
            } else {
                await createRoom.mutateAsync({
                    location: data.location,
                    name: data.name,
                    capacity: data.capacity,
                    equipment_tags: tags,
                });
            }
            onOpenChange(false);
        } catch {
            // toast in hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit room' : 'Add room'}</DialogTitle>
                    <DialogDescription>
                        Rooms are spaces inside a location used for class sessions.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                            value={locationValue}
                            onValueChange={(v) => setValue('location', v, { shouldValidate: true })}
                        >
                            <SelectTrigger className="w-full rounded-xl">
                                <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                        {loc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.location && (
                            <p className="text-xs text-red-600">{errors.location.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="room-name">Name</Label>
                        <Input id="room-name" {...register('name')} placeholder="Yoga Studio A" />
                        {errors.name && (
                            <p className="text-xs text-red-600">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="room-capacity">Capacity</Label>
                        <Input
                            id="room-capacity"
                            type="number"
                            min={1}
                            {...register('capacity', { valueAsNumber: true })}
                        />
                        {errors.capacity && (
                            <p className="text-xs text-red-600">{errors.capacity.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Equipment tags</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder="yoga-mats"
                            />
                            <Button type="button" variant="outline" onClick={addTag}>
                                Add
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2 py-0.5 text-xs font-medium text-accent-foreground"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setTags((prev) => prev.filter((t) => t !== tag))
                                            }
                                            className="hover:text-ink"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className="shadow-lg shadow-primary/20">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : isEditing ? (
                                'Save changes'
                            ) : (
                                'Create room'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
