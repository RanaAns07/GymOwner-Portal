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
import { useStaffMembers, useDeleteStaffMember } from '@/hooks/use-staff';
import { roleLabels, statusConfig } from '@/types/staff';
import { Plus, Search, LayoutGrid, List, Filter, Users } from 'lucide-react';

export default function StaffPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: staff, isLoading } = useStaffMembers();
    const deleteStaff = useDeleteStaffMember();

    // Filter staff based on search and filters
    const filteredStaff = staff?.filter((member) => {
        const matchesSearch =
            searchQuery === '' ||
            `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

                    {/* Role Filter */}
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-40">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {Object.entries(roleLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(statusConfig).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                    {config.label}
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

            {/* Staff Grid */}
            <StaffGrid
                staff={filteredStaff || []}
                isLoading={isLoading}
                onEdit={(staff) => console.log('Edit:', staff)}
                onDelete={(staff) => {
                    if (confirm(`Are you sure you want to remove ${staff.firstName} ${staff.lastName}?`)) {
                        deleteStaff.mutate(staff.id);
                    }
                }}
                onView={(staff) => console.log('View:', staff)}
            />

            {/* Add Staff Modal */}
            <AddStaffModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        </div>
    );
}
