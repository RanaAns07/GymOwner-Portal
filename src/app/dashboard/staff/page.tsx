'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaffGrid } from '@/components/staff/staff-grid';
import { AddStaffModal } from '@/components/staff/add-staff-modal';
import { ViewStaffModal } from '@/components/staff/view-staff-modal';
import { EditStaffModal } from '@/components/staff/edit-staff-modal';
import { RemoveStaffDialog } from '@/components/staff/remove-staff-dialog';
import { useStaffMembers, useDeleteStaffMember } from '@/hooks/use-staff';
import type { StaffMember } from '@/types/staff';
import { statusConfig } from '@/types/staff';
import { Plus, Search, LayoutGrid, List, Filter, Users } from 'lucide-react';

/** Roles returned/created by the staff API */
const ROLE_FILTER_OPTIONS = [
    { value: 'trainer', label: 'Trainer' },
    { value: 'manager', label: 'Gym Manager' },
] as const;

/** Status values from staff profile (active / on_leave / inactive) */
const STATUS_FILTER_OPTIONS = [
    { value: 'active', label: statusConfig.active.label },
    { value: 'on-leave', label: statusConfig['on-leave'].label },
    { value: 'inactive', label: statusConfig.inactive.label },
] as const;

export default function StaffPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    const { data: staff, isLoading } = useStaffMembers();
    const deleteStaff = useDeleteStaffMember();

    const openView = (member: StaffMember) => {
        setSelectedStaff(member);
        setViewOpen(true);
    };

    const openEdit = (member: StaffMember) => {
        setSelectedStaff(member);
        setEditOpen(true);
    };

    const openRemove = (member: StaffMember) => {
        setSelectedStaff(member);
        setRemoveOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!selectedStaff) return;
        try {
            await deleteStaff.mutateAsync(selectedStaff.id);
            setRemoveOpen(false);
            setSelectedStaff(null);
        } catch {
            // Toast handled in hook
        }
    };

    const filteredStaff = staff?.filter((member) => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const matchesSearch =
            searchQuery === '' ||
            fullName.includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'all' || member.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Stats
    const activeCount = staff?.filter((s) => s.status === 'active').length || 0;
    const totalCount = staff?.length || 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Staff Management</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Manage your team members and their roles.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Staff
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                            <Users className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Total Staff</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                            <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Active</p>
                            <p className="text-2xl font-bold text-zinc-900">{activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <Users className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">On Leave</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {staff?.filter((s) => s.status === 'on-leave').length || 0}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Trainers</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {staff?.filter((s) => s.role === 'trainer').length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            type="search"
                            placeholder="Search staff..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Role Filter — trainer | gym_manager */}
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-40">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {ROLE_FILTER_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter — active | on_leave | inactive */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {STATUS_FILTER_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* View Toggle */}
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
                    <TabsList className="bg-zinc-100">
                        <TabsTrigger value="grid" className="gap-1.5">
                            <LayoutGrid className="h-4 w-4" />
                            Grid
                        </TabsTrigger>
                        <TabsTrigger value="list" className="gap-1.5">
                            <List className="h-4 w-4" />
                            List
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <StaffGrid
                staff={filteredStaff || []}
                viewMode={viewMode}
                isLoading={isLoading}
                onView={openView}
                onEdit={openEdit}
                onDelete={openRemove}
            />

            <AddStaffModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />

            <ViewStaffModal
                open={viewOpen}
                onOpenChange={setViewOpen}
                staff={selectedStaff}
                onEdit={(member) => {
                    setViewOpen(false);
                    openEdit(member);
                }}
            />

            <EditStaffModal
                open={editOpen}
                onOpenChange={setEditOpen}
                staff={selectedStaff}
            />

            <RemoveStaffDialog
                open={removeOpen}
                onOpenChange={setRemoveOpen}
                staff={selectedStaff}
                isRemoving={deleteStaff.isPending}
                onConfirm={handleConfirmRemove}
            />
        </div>
    );
}
