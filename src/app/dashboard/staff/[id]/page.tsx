'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffDetailView } from '@/components/staff/staff-detail-view';
import { EditStaffModal } from '@/components/staff/edit-staff-modal';
import { useStaffMember } from '@/hooks/use-staff';
import { ArrowLeft } from 'lucide-react';

export default function StaffDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { data: staff, isLoading, isError } = useStaffMember(id);
    const [editOpen, setEditOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="-m-6 space-y-0 lg:-m-8">
                <div className="flex h-14 items-center border-b border-border bg-card px-6">
                    <Skeleton className="h-9 w-36" />
                </div>
                <div className="bg-[#0b1220] px-6 py-10">
                    <div className="mx-auto flex max-w-6xl items-center gap-5">
                        <Skeleton className="h-28 w-28 rounded-full bg-white/10" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-24 bg-white/10" />
                            <Skeleton className="h-10 w-64 bg-white/10" />
                            <Skeleton className="h-6 w-32 bg-white/10" />
                        </div>
                    </div>
                </div>
                <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError || !staff) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <p className="text-lg font-semibold text-ink">Staff member not found</p>
                <p className="text-sm text-ink-muted">
                    This profile may have been removed or the link is invalid.
                </p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/dashboard/staff">
                        <ArrowLeft className="h-4 w-4" />
                        Back to staff
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <StaffDetailView staff={staff} onEdit={() => setEditOpen(true)} />
            <EditStaffModal
                open={editOpen}
                onOpenChange={setEditOpen}
                staff={staff}
            />
        </>
    );
}
