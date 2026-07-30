'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toDisplayImageUrl } from '@/lib/media-url';
import { resolveStaffAvatar } from '@/lib/staff-avatar-cache';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/types/staff';
import { roleLabels, statusConfig } from '@/types/staff';
import { Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { StaffCard, StaffCardSkeleton } from './staff-card';

interface StaffGridProps {
    staff: StaffMember[];
    viewMode?: 'grid' | 'list';
    isLoading?: boolean;
    onEdit?: (staff: StaffMember) => void;
    onDelete?: (staff: StaffMember) => void;
    onView?: (staff: StaffMember) => void;
}

function getInitials(member: StaffMember) {
    const first = member.firstName?.[0] || '';
    const last = member.lastName?.[0] || '';
    return (first + last || member.email?.[0] || '?').toUpperCase();
}

function StaffListView({
    staff,
    onEdit,
    onDelete,
    onView,
}: Omit<StaffGridProps, 'isLoading' | 'viewMode'>) {
    return (
        <div className="rounded-2xl border border-zinc-200/60 bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-12" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.map((member) => {
                        const status = statusConfig[member.status];
                        return (
                            <TableRow key={member.id} className="hover:bg-zinc-50/80">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src={toDisplayImageUrl(
                                                    resolveStaffAvatar(member.id, member.avatar)
                                                )}
                                                referrerPolicy="no-referrer"
                                            />
                                            <AvatarFallback className="bg-ink text-primary text-xs font-medium">
                                                {getInitials(member)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-zinc-900">
                                            {member.firstName} {member.lastName}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-zinc-600">
                                    {roleLabels[member.role] || member.role}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={cn('text-xs font-medium', status.color)}
                                    >
                                        {status.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-zinc-600">
                                    {member.email}
                                </TableCell>
                                <TableCell className="text-sm text-zinc-600">
                                    {new Date(member.hireDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-zinc-400"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => onView?.(member)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit?.(member)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => onDelete?.(member)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

export function StaffGrid({
    staff,
    viewMode = 'grid',
    isLoading,
    onEdit,
    onDelete,
    onView,
}: StaffGridProps) {
    if (isLoading) {
        if (viewMode === 'list') {
            return (
                <div className="rounded-2xl border border-zinc-200/60 bg-card p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 rounded-lg bg-zinc-100 animate-pulse" />
                    ))}
                </div>
            );
        }

        return (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <StaffCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (staff.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
                    <svg
                        className="h-8 w-8 text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">No staff members found</h3>
                <p className="mt-1 text-sm text-zinc-500">
                    Try adjusting your filters or add a new team member.
                </p>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <StaffListView
                staff={staff}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
            />
        );
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staff.map((member) => (
                <StaffCard
                    key={member.id}
                    staff={member}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                />
            ))}
        </div>
    );
}
