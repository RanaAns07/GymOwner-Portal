'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { PageReveal } from '@/components/dashboard/PageReveal';
import { ArrowLeft } from 'lucide-react';

interface DetailPageShellProps {
    backHref: string;
    backLabel: string;
    actions?: ReactNode;
    hero: ReactNode;
    children: ReactNode;
}

/** Full-page detail layout shared across dashboard entity screens. */
export function DetailPageShell({
    backHref,
    backLabel,
    actions,
    hero,
    children,
}: DetailPageShellProps) {
    return (
        <PageReveal className="-m-6 flex min-h-[calc(100dvh-4rem)] flex-col lg:-m-8">
            <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    className="gap-2 rounded-xl text-ink-muted hover:text-ink"
                    asChild
                >
                    <Link href={backHref}>
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>
                </Button>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
            <div className="relative flex-1 bg-canvas">
                {hero}
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </div>
            </div>
        </PageReveal>
    );
}

export function DetailHero({
    eyebrow,
    title,
    meta,
    stats,
}: {
    eyebrow: string;
    title: string;
    meta?: ReactNode;
    stats?: ReactNode;
}) {
    return (
        <div className="relative overflow-hidden border-b border-border bg-[#0b1220] text-white">
            <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                    background:
                        'radial-gradient(ellipse 70% 80% at 15% 20%, color-mix(in srgb, var(--primary) 28%, transparent), transparent 55%), radial-gradient(ellipse 50% 60% at 90% 80%, rgba(255,255,255,0.06), transparent 50%)',
                }}
            />
            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                        {eyebrow}
                    </p>
                    <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        {title}
                    </h1>
                    {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
                </div>
                {stats}
            </div>
        </div>
    );
}
