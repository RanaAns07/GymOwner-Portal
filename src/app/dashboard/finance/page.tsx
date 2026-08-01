'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PageReveal } from '@/components/dashboard/PageReveal';
import { useTenantLedgers, usePlatformLedgers } from '@/hooks/use-ledgers';
import type { BackendLedgerEntry } from '@/lib/api/ledgers-api';
import { Landmark, RefreshCw, Wallet } from 'lucide-react';

function formatAmount(entry: BackendLedgerEntry) {
    const amount = entry.amount;
    if (amount === undefined || amount === null) return '—';
    const num = typeof amount === 'number' ? amount : Number(amount);
    if (Number.isNaN(num)) return String(amount);
    const currency = entry.currency || 'USD';
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
        }).format(num);
    } catch {
        return `${currency} ${num.toFixed(2)}`;
    }
}

function formatWhen(entry: BackendLedgerEntry) {
    const value = entry.created_at || entry.timestamp;
    if (!value || typeof value !== 'string') return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

function LedgerTable({
    entries,
    loading,
    empty,
}: {
    entries: BackendLedgerEntry[] | undefined;
    loading: boolean;
    empty: string;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-canvas/50 hover:bg-canvas/50">
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>When</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 6 }).map((__, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : entries && entries.length > 0 ? (
                        entries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="font-medium text-ink">
                                    {entry.description || 'Ledger entry'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="rounded-lg capitalize">
                                        {String(entry.entry_type || entry.type || '—')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-ink">
                                    {formatAmount(entry)}
                                </TableCell>
                                <TableCell className="text-sm text-ink-muted capitalize">
                                    {String(entry.status || '—')}
                                </TableCell>
                                <TableCell className="text-sm text-ink-muted">
                                    {String(entry.reference || '—')}
                                </TableCell>
                                <TableCell className="text-sm text-ink-muted">
                                    {formatWhen(entry)}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-28 text-center text-sm text-ink-muted"
                            >
                                {empty}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default function FinancePage() {
    const tenant = useTenantLedgers();
    const platform = usePlatformLedgers();

    const tenantTotal = (tenant.data || []).reduce((sum, e) => {
        const n = typeof e.amount === 'number' ? e.amount : Number(e.amount);
        return sum + (Number.isNaN(n) ? 0 : n);
    }, 0);

    return (
        <PageReveal className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-ink">Finance</h1>
                    <p className="mt-1 text-sm text-ink-muted">
                        Tenant and platform ledger activity for your gym.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                        tenant.refetch();
                        platform.refetch();
                    }}
                    disabled={tenant.isFetching || platform.isFetching}
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            tenant.isFetching || platform.isFetching ? 'animate-spin' : ''
                        }`}
                    />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <Wallet className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Tenant entries</p>
                            <p className="text-2xl font-bold text-ink">
                                {tenant.data?.length ?? 0}
                            </p>
                            <p className="text-xs text-ink-muted">
                                Sum ≈ ${tenantTotal.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
                            <Landmark className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-muted">Platform entries</p>
                            <p className="text-2xl font-bold text-ink">
                                {platform.data?.length ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="tenant" className="space-y-4">
                <TabsList className="rounded-xl">
                    <TabsTrigger value="tenant" className="rounded-lg">
                        Tenant ledger
                    </TabsTrigger>
                    <TabsTrigger value="platform" className="rounded-lg">
                        Platform ledger
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="tenant">
                    <LedgerTable
                        entries={tenant.data}
                        loading={tenant.isLoading}
                        empty="No tenant ledger entries"
                    />
                </TabsContent>
                <TabsContent value="platform">
                    <LedgerTable
                        entries={platform.data}
                        loading={platform.isLoading}
                        empty="No platform ledger entries"
                    />
                </TabsContent>
            </Tabs>
        </PageReveal>
    );
}
