'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toDisplayImageUrl } from '@/lib/media-url';
import { resolveStaffAvatar } from '@/lib/staff-avatar-cache';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/types/staff';
import { statusConfig } from '@/types/staff';
import { useLocations, useStaffLocations } from '@/hooks/use-locations';
import { Calendar, Mail, MapPin, Phone, User } from 'lucide-react';
import { useMemo } from 'react';

interface ViewStaffModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: StaffMember | null;
    onEdit?: (staff: StaffMember) => void;
}

function roleLabel(role: StaffMember['role']) {
    if (role === 'trainer') return 'Trainer';
    if (role === 'manager') return 'Gym Manager';
    return role;
}

export function ViewStaffModal({
    open,
    onOpenChange,
    staff,
    onEdit,
}: ViewStaffModalProps) {
    const { data: locations } = useLocations();
    const { data: staffLocations, isLoading: locationsLoading } = useStaffLocations(
        open ? staff?.id : undefined
    );

    const locationNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const loc of locations || []) {
            map.set(loc.id, loc.name);
        }
        return map;
    }, [locations]);

    if (!staff) return null;

    const initials = (
        `${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}` ||
        staff.email?.[0] ||
        '?'
    ).toUpperCase();
    const status = statusConfig[staff.status];
    const fullName = `${staff.firstName} ${staff.lastName}`.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Staff details</DialogTitle>
                    <DialogDescription>
                        Profile information for this team member.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage
                                src={toDisplayImageUrl(
                                    resolveStaffAvatar(staff.id, staff.avatar)
                                )}
                                alt={fullName}
                                referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-lg font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900">{fullName}</h3>
                            <p className="text-sm text-zinc-500">{roleLabel(staff.role)}</p>
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
                            <span className="truncate">{staff.email}</span>
                        </div>
                        {staff.phone ? (
                            <div className="flex items-center gap-2 text-zinc-700">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                <span>{staff.phone}</span>
                            </div>
                        ) : null}
                        {staff.gender ? (
                            <div className="flex items-center gap-2 text-zinc-700 capitalize">
                                <User className="h-4 w-4 text-zinc-400" />
                                <span>{staff.gender.replace(/_/g, ' ')}</span>
                            </div>
                        ) : null}
                        <div className="flex items-center gap-2 text-zinc-700">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            <span>
                                Joined{' '}
                                {new Date(staff.hireDate).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-800">Locations</p>
                        {locationsLoading ? (
                            <Skeleton className="h-8 w-40" />
                        ) : (staffLocations || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {(staffLocations || []).map((assignment) => (
                                    <Badge
                                        key={assignment.id}
                                        variant="outline"
                                        className="gap-1.5 border-violet-200 bg-violet-50 text-violet-700"
                                    >
                                        <MapPin className="h-3 w-3" />
                                        {assignment.location_name ||
                                            locationNameById.get(assignment.location) ||
                                            'Location'}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">No locations assigned.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        {onEdit && (
                            <Button
                                onClick={() => {
                                    onOpenChange(false);
                                    onEdit(staff);
                                }}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
