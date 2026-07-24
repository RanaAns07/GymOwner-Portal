'use client';

import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { resolveStaffAvatar } from '@/lib/staff-avatar-cache';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/types/staff';
import { roleLabels, statusConfig } from '@/types/staff';
import { Mail, MoreVertical, Phone, Calendar, Edit, Trash2, Eye, User } from 'lucide-react';

interface StaffCardProps {
    staff: StaffMember;
    onEdit?: (staff: StaffMember) => void;
    onDelete?: (staff: StaffMember) => void;
    onView?: (staff: StaffMember) => void;
}

export function StaffCard({ staff, onEdit, onDelete, onView }: StaffCardProps) {
    const initials = (
        `${staff.firstName?.[0] || ''}${staff.lastName?.[0] || ''}` ||
        staff.email?.[0] ||
        '?'
    ).toUpperCase();
    const status = statusConfig[staff.status];
    const avatarSrc = resolveStaffAvatar(staff.id, staff.avatar);

    const avatarGradients: Record<string, string> = {
        trainer: 'from-violet-500 to-purple-500',
        manager: 'from-rose-500 to-pink-500',
        owner: 'from-indigo-500 to-blue-500',
    };

    return (
        <Card className="group relative overflow-hidden border-zinc-200/60 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50">
            {/* Subtle gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    {/* Avatar & Info */}
                    <div className="flex gap-4">
                        <ProfileAvatar
                            className="h-14 w-14 ring-2 ring-zinc-100 transition-transform duration-300 group-hover:scale-105"
                            src={avatarSrc}
                            alt={`${staff.firstName} ${staff.lastName}`}
                            fallback={initials}
                            fallbackClassName={cn(
                                'bg-gradient-to-br text-white font-medium',
                                avatarGradients[staff.role] || avatarGradients.trainer
                            )}
                        />

                        <div className="space-y-1">
                            <h3 className="font-semibold text-zinc-900">
                                {staff.firstName} {staff.lastName}
                            </h3>
                            <p className="text-sm text-zinc-500">
                                {staff.role === 'trainer'
                                    ? 'Trainer'
                                    : staff.role === 'manager'
                                      ? 'Gym Manager'
                                      : roleLabels[staff.role]}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <Badge variant="secondary" className={cn("text-xs font-medium", status.color)}>
                                    {status.label}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => onView?.(staff)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(staff)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDelete?.(staff)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2 text-sm text-zinc-600">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-zinc-400" />
                        <span className="truncate">{staff.email}</span>
                    </div>
                    {staff.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-zinc-400" />
                            <span>{staff.phone}</span>
                        </div>
                    )}
                    {staff.gender ? (
                        <div className="flex items-center gap-2 capitalize">
                            <User className="h-4 w-4 text-zinc-400" />
                            <span>{staff.gender.replace(/_/g, ' ')}</span>
                        </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span>Joined {new Date(staff.hireDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        })}</span>
                    </div>
                </div>

                {staff.specializations.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {staff.specializations.slice(0, 3).map((spec) => (
                            <Badge
                                key={spec}
                                variant="outline"
                                className="border-zinc-200 bg-zinc-50 text-xs font-normal text-zinc-600"
                            >
                                {spec}
                            </Badge>
                        ))}
                        {staff.specializations.length > 3 && (
                            <Badge
                                variant="outline"
                                className="border-zinc-200 bg-zinc-50 text-xs font-normal text-zinc-500"
                            >
                                +{staff.specializations.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Skeleton loader for staff card
export function StaffCardSkeleton() {
    return (
        <Card className="border-zinc-200/60 bg-white">
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="mt-2 h-5 w-16" />
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="mt-4 flex gap-1.5">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}
