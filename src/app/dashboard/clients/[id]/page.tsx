'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientDetailView } from '@/components/clients/client-detail-view';
import { useClient } from '@/hooks/use-clients';
import { ArrowLeft } from 'lucide-react';

export default function ClientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: client, isLoading, isError } = useClient(id);

    if (isLoading) {
        return (
            <div className="-m-6 space-y-0 lg:-m-8">
                <div className="flex h-14 items-center border-b border-border bg-card px-6">
                    <Skeleton className="h-9 w-40" />
                </div>
                <div className="bg-[#0b1220] px-6 py-10">
                    <Skeleton className="h-10 w-64 bg-white/10" />
                    <Skeleton className="mt-3 h-6 w-32 bg-white/10" />
                </div>
            </div>
        );
    }

    if (isError || !client) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <p className="text-lg font-semibold text-ink">Client not found</p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/dashboard/clients">
                        <ArrowLeft className="h-4 w-4" />
                        Back to clients
                    </Link>
                </Button>
            </div>
        );
    }

    return <ClientDetailView client={client} />;
}
