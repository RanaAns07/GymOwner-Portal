'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toDisplayImageUrl } from '@/lib/media-url';
import { resolveStaffAvatar } from '@/lib/staff-avatar-cache';
import { useUpdateStaffMember } from '@/hooks/use-staff';
import {
    useLocations,
    useStaffLocations,
    useAssignStaffLocation,
    useRemoveStaffLocation,
} from '@/hooks/use-locations';
import type { StaffMember } from '@/types/staff';
import { Camera, Loader2, MapPin, Plus, X } from 'lucide-react';

const editStaffSchema = z.object({
    nickname: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    gender: z.enum(['', 'male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

type EditStaffFormData = z.infer<typeof editStaffSchema>;

interface EditStaffModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: StaffMember | null;
}

export function EditStaffModal({ open, onOpenChange, staff }: EditStaffModalProps) {
    const updateStaff = useUpdateStaffMember();
    const { data: locations, isLoading: locationsLoading } = useLocations();
    const {
        data: staffLocations,
        isLoading: assignmentsLoading,
    } = useStaffLocations(open ? staff?.id : undefined);
    const assignLocation = useAssignStaffLocation();
    const removeLocation = useRemoveStaffLocation();
    const [locationToAdd, setLocationToAdd] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EditStaffFormData>({
        resolver: zodResolver(editStaffSchema),
        defaultValues: { nickname: '', phone: '', gender: '' },
    });

    const genderValue = watch('gender') || '';

    useEffect(() => {
        if (staff && open) {
            const gender = (staff.gender || '').toLowerCase();
            const normalized =
                gender === 'male' ||
                gender === 'female' ||
                gender === 'other' ||
                gender === 'prefer_not_to_say'
                    ? gender
                    : '';
            reset({
                nickname: `${staff.firstName} ${staff.lastName}`.trim(),
                phone: staff.phone || '',
                gender: normalized,
            });
            setLocationToAdd('');
            setImageFile(null);
            setPreviewUrl(null);
        }
    }, [staff, open, reset]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const locationNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const loc of locations || []) {
            map.set(loc.id, loc.name);
        }
        return map;
    }, [locations]);

    const assignedLocationIds = new Set((staffLocations || []).map((a) => a.location));
    const availableLocations = (locations || []).filter(
        (loc) => !assignedLocationIds.has(loc.id)
    );

    const initials = staff
        ? `${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}`.toUpperCase() ||
          staff.email.substring(0, 2).toUpperCase()
        : 'ST';

    const displaySrc =
        previewUrl ||
        toDisplayImageUrl(resolveStaffAvatar(staff?.id || '', staff?.avatar)) ||
        undefined;

    const onPickImage = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const assignPendingLocation = async () => {
        if (!staff || !locationToAdd) return;
        await assignLocation.mutateAsync({
            staffId: staff.id,
            locationId: locationToAdd,
        });
        setLocationToAdd('');
    };

    const onSubmit = async (data: EditStaffFormData) => {
        if (!staff) return;

        const parts = data.nickname.trim().split(/\s+/);
        const firstName = parts[0] || data.nickname;
        const lastName = parts.slice(1).join(' ') || '';

        try {
            if (locationToAdd) {
                await assignPendingLocation();
            }

            await updateStaff.mutateAsync({
                id: staff.id,
                data: {
                    firstName,
                    lastName,
                    phone: data.phone?.trim() || '',
                    gender: data.gender || '',
                    imageFile,
                },
            });
            onOpenChange(false);
        } catch {
            // Toast handled in hooks
        }
    };

    const handleAssignLocation = async () => {
        try {
            await assignPendingLocation();
        } catch {
            // Toast handled in hook
        }
    };

    const handleRemoveLocation = async (assignmentId: string) => {
        if (!staff) return;
        try {
            await removeLocation.mutateAsync({
                assignmentId,
                staffId: staff.id,
            });
        } catch {
            // Toast handled in hook
        }
    };

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) {
            reset({ nickname: '', phone: '', gender: '' });
            setLocationToAdd('');
            setImageFile(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        onOpenChange(nextOpen);
    };

    const isBusy =
        updateStaff.isPending || assignLocation.isPending || removeLocation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit team member</DialogTitle>
                    <DialogDescription>
                        Update their profile, contact details, and locations.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16 ring-2 ring-zinc-200">
                                <AvatarImage
                                    key={displaySrc || 'none'}
                                    src={displaySrc}
                                    alt={staff ? `${staff.firstName} ${staff.lastName}` : 'Staff'}
                                    referrerPolicy="no-referrer"
                                />
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-medium text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800"
                                aria-label="Change photo"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="text-sm text-zinc-500">
                            <p className="font-medium text-zinc-800">Profile photo</p>
                            <p className="mt-0.5">JPG or PNG. Optional.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-nickname">Name</Label>
                        <Input
                            id="edit-nickname"
                            placeholder="Sarah Johnson"
                            {...register('nickname')}
                            className={cn(errors.nickname && 'border-red-500')}
                        />
                        {errors.nickname && (
                            <p className="text-xs text-red-500">{errors.nickname.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                type="tel"
                                placeholder="+1 555 000 0000"
                                {...register('phone')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={genderValue || '__none__'}
                                onValueChange={(value) =>
                                    setValue(
                                        'gender',
                                        value === '__none__'
                                            ? ''
                                            : (value as EditStaffFormData['gender']),
                                        { shouldDirty: true }
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Not specified</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer_not_to_say">
                                        Prefer not to say
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {staff && (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-2 text-sm text-zinc-600">
                            <p>
                                <span className="font-medium text-zinc-800">Email:</span>{' '}
                                {staff.email}
                            </p>
                            <p className="mt-1">
                                <span className="font-medium text-zinc-800">Role:</span>{' '}
                                {staff.role === 'manager' ? 'Gym Manager' : 'Trainer'}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                                Email and password cannot be edited here.
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <Label>Locations</Label>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Select a location and click Assign, or Save to apply it.
                            </p>
                        </div>

                        {assignmentsLoading || locationsLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-40" />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-2 min-h-[32px]">
                                    {(staffLocations || []).length === 0 ? (
                                        <p className="text-sm text-zinc-400">
                                            No locations assigned yet.
                                        </p>
                                    ) : (
                                        (staffLocations || []).map((assignment) => (
                                            <Badge
                                                key={assignment.id}
                                                variant="outline"
                                                className="gap-1.5 border-violet-200 bg-violet-50 text-violet-700 pr-1"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                {assignment.location_name ||
                                                    locationNameById.get(assignment.location) ||
                                                    'Location'}
                                                <button
                                                    type="button"
                                                    className="rounded-full p-0.5 hover:bg-violet-100"
                                                    disabled={removeLocation.isPending}
                                                    onClick={() =>
                                                        handleRemoveLocation(assignment.id)
                                                    }
                                                    aria-label="Remove location"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    )}
                                </div>

                                {availableLocations.length > 0 ? (
                                    <div className="flex gap-2">
                                        <Select
                                            value={locationToAdd}
                                            onValueChange={setLocationToAdd}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select a location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableLocations.map((loc) => (
                                                    <SelectItem key={loc.id} value={loc.id}>
                                                        {loc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAssignLocation}
                                            disabled={!locationToAdd || assignLocation.isPending}
                                            className="gap-1.5"
                                        >
                                            {assignLocation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                            Assign
                                        </Button>
                                    </div>
                                ) : (locations || []).length === 0 ? (
                                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                        No locations yet. Add one under Locations first.
                                    </p>
                                ) : (
                                    <p className="text-sm text-zinc-500">
                                        Assigned to all available locations.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={isBusy}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isBusy || !staff}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                        >
                            {isBusy ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                'Save changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
