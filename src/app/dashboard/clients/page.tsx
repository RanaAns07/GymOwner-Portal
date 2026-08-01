'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
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
import type { Client } from '@/types/clients';
import { clientStatusConfig } from '@/types/clients';
import { cn } from '@/lib/utils';
import {
    Search,
    Users,
    UserCheck,
    UserX,
    Clock,
    Mail,
    Phone,
    Calendar,
} from 'lucide-react';
import { PageReveal } from '@/components/dashboard/PageReveal';

export default function ClientsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: clients, isLoading } = useClients();

    const filteredClients = clients?.filter((client) => {
        const matchesSearch =
            searchQuery === '' ||
            `${client.firstName} ${client.lastName}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeCount = clients?.filter((c) => c.status === 'active').length || 0;
    const totalCount = clients?.length || 0;

    const openDetails = (client: Client) => {
        router.push(`/dashboard/clients/${client.id}`);
    };

    return (
        <PageReveal className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                    Client Operations
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                    View and manage your clients.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <Users className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Total Clients</p>
                            <p className="text-2xl font-bold text-ink">{totalCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                            <UserCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Active</p>
                            <p className="text-2xl font-bold text-ink">{activeCount}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Pending</p>
                            <p className="text-2xl font-bold text-ink">
                                {clients?.filter((c) => c.status === 'pending').length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <Input
                        type="search"
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList className="bg-canvas">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-canvas/50 hover:bg-canvas/50">
                            <TableHead>Client</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Membership</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Visit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-40" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-28" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredClients && filteredClients.length > 0 ? (
                            filteredClients.map((client) => {
                                const initials = (
                                    `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}` ||
                                    '?'
                                ).toUpperCase();
                                const status = clientStatusConfig[client.status];

                                return (
                                    <TableRow
                                        key={client.id}
                                        className="cursor-pointer transition-colors hover:bg-canvas"
                                        onClick={() => openDetails(client)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={client.avatar} />
                                                    <AvatarFallback className="bg-ink text-primary text-sm font-medium">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-ink">
                                                        {client.firstName} {client.lastName}
                                                    </p>
                                                    <p className="text-xs text-ink-muted">
                                                        <Calendar className="inline h-3 w-3 mr-1" />
                                                        Joined{' '}
                                                        {new Date(
                                                            client.joinDate
                                                        ).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1.5 text-ink-muted">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="truncate max-w-[180px]">
                                                        {client.email}
                                                    </span>
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-1.5 text-ink-muted">
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
                                                <span className="text-sm text-ink-muted">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn('text-xs', status.color)}
                                            >
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {client.lastVisit ? (
                                                <span className="text-sm text-ink-muted">
                                                    {new Date(
                                                        client.lastVisit
                                                    ).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-ink-muted">Never</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <UserX className="h-8 w-8 text-border" />
                                        <p className="mt-2 text-sm text-ink-muted">
                                            No clients found
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

        </PageReveal>
    );
}
