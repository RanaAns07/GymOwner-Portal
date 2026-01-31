'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClients } from '@/hooks/use-clients';
import { useStaffMembers } from '@/hooks/use-staff';
import { clientStatusConfig } from '@/types/clients';
import { cn } from '@/lib/utils';
import {
    Search,
    UserPlus,
    Users,
    UserCheck,
    UserX,
    Clock,
    Mail,
    Phone,
    Calendar,
    UserCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedClients, setSelectedClients] = useState<string[]>([]);

    const { data: clients, isLoading } = useClients();
    const { data: staff } = useStaffMembers();

    // Filter clients
    const filteredClients = clients?.filter((client) => {
        const matchesSearch =
            searchQuery === '' ||
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Stats
    const activeCount = clients?.filter((c) => c.status === 'active').length || 0;
    const totalCount = clients?.length || 0;
    const assignedCount = clients?.filter((c) => c.assignedStaffId).length || 0;

    const toggleClientSelection = (clientId: string) => {
        setSelectedClients((prev) =>
            prev.includes(clientId)
                ? prev.filter((id) => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleAssignStaff = (staffId: string) => {
        const staffMember = staff?.find((s) => s.id === staffId);
        if (staffMember && selectedClients.length > 0) {
            toast.success(
                `${selectedClients.length} client(s) assigned to ${staffMember.firstName} ${staffMember.lastName}`
            );
            setSelectedClients([]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Client Operations</h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Manage clients and assign them to trainers.
                    </p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700">
                    <UserPlus className="h-4 w-4" />
                    Add Client
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
                            <p className="text-sm font-medium text-zinc-500">Total Clients</p>
                            <p className="text-2xl font-bold text-zinc-900">{totalCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                            <UserCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Active</p>
                            <p className="text-2xl font-bold text-zinc-900">{activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <UserCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Assigned</p>
                            <p className="text-2xl font-bold text-zinc-900">{assignedCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-500">Pending</p>
                            <p className="text-2xl font-bold text-zinc-900">
                                {clients?.filter((c) => c.status === 'pending').length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedClients.length > 0 && (
                <Card className="border-violet-200 bg-violet-50">
                    <CardContent className="flex items-center justify-between p-4">
                        <p className="text-sm font-medium text-violet-900">
                            {selectedClients.length} client(s) selected
                        </p>
                        <div className="flex items-center gap-3">
                            <Select onValueChange={handleAssignStaff}>
                                <SelectTrigger className="w-48 bg-white">
                                    <SelectValue placeholder="Assign to trainer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {staff
                                        ?.filter((s) => s.role === 'trainer' && s.status === 'active')
                                        .map((trainer) => (
                                            <SelectItem key={trainer.id} value={trainer.id}>
                                                {trainer.firstName} {trainer.lastName}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedClients([])}
                            >
                                Clear
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            type="search"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList className="bg-zinc-100">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Clients Table */}
            <div className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                            <TableHead className="w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedClients.length === filteredClients?.length && filteredClients.length > 0}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedClients(filteredClients?.map((c) => c.id) || []);
                                        } else {
                                            setSelectedClients([]);
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-zinc-300"
                                />
                            </TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Membership</TableHead>
                            <TableHead>Assigned Trainer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Visit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredClients && filteredClients.length > 0 ? (
                            filteredClients.map((client) => {
                                const initials = `${client.firstName[0]}${client.lastName[0]}`;
                                const status = clientStatusConfig[client.status];
                                const isSelected = selectedClients.includes(client.id);

                                return (
                                    <TableRow
                                        key={client.id}
                                        className={cn(
                                            "cursor-pointer transition-colors",
                                            isSelected && "bg-violet-50"
                                        )}
                                        onClick={() => toggleClientSelection(client.id)}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleClientSelection(client.id)}
                                                className="h-4 w-4 rounded border-zinc-300"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={client.avatar} />
                                                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-medium">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-zinc-900">
                                                        {client.firstName} {client.lastName}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">
                                                        <Calendar className="inline h-3 w-3 mr-1" />
                                                        Joined {new Date(client.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1.5 text-zinc-600">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="truncate max-w-[180px]">{client.email}</span>
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {client.membershipName ? (
                                                <Badge variant="outline" className="font-normal">
                                                    {client.membershipName}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-zinc-400">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {client.assignedStaffName ? (
                                                <span className="text-sm text-zinc-700">{client.assignedStaffName}</span>
                                            ) : (
                                                <span className="text-sm text-zinc-400">Unassigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={cn("text-xs", status.color)}>
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {client.lastVisit ? (
                                                <span className="text-sm text-zinc-600">
                                                    {new Date(client.lastVisit).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-zinc-400">Never</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <UserX className="h-8 w-8 text-zinc-300" />
                                        <p className="mt-2 text-sm text-zinc-500">No clients found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
