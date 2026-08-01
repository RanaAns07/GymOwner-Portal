'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
    Users,
    CreditCard,
    UserCircle,
    Calendar,
    Menu,
    ChevronLeft,
    ChevronRight,
    Dumbbell,
    LayoutDashboard,
    Settings,
    MapPin,
    DoorOpen,
    ClipboardList,
    LogIn,
    Package,
    Landmark,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Staff',
        href: '/dashboard/staff',
        icon: Users,
    },
    {
        title: 'Locations',
        href: '/dashboard/locations',
        icon: MapPin,
    },
    {
        title: 'Rooms',
        href: '/dashboard/rooms',
        icon: DoorOpen,
    },
    {
        title: 'Pricing',
        href: '/dashboard/pricing',
        icon: CreditCard,
    },
    {
        title: 'Clients',
        href: '/dashboard/clients',
        icon: UserCircle,
    },
    {
        title: 'Schedule',
        href: '/dashboard/schedule',
        icon: Calendar,
    },
    {
        title: 'Operations',
        href: '/dashboard/operations',
        icon: ClipboardList,
    },
    {
        title: 'Access',
        href: '/dashboard/access',
        icon: LogIn,
    },
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
    },
    {
        title: 'Finance',
        href: '/dashboard/finance',
        icon: Landmark,
    },
];

const secondaryNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

interface SidebarProps {
    collapsed?: boolean;
    onCollapse?: (collapsed: boolean) => void;
}

function SidebarContent({ collapsed, onCollapse }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col">
            <div
                className={cn(
                    'flex h-16 items-center border-b border-border px-4',
                    collapsed ? 'justify-center' : 'justify-between'
                )}
            >
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1220] text-primary shadow-lg shadow-black/20 dark:bg-primary dark:text-primary-foreground">
                        <Dumbbell className="h-5 w-5" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-tight text-ink">
                            Gym<span className="text-primary">Flow</span>
                        </span>
                    )}
                </Link>
                {!collapsed && onCollapse && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-ink-muted hover:text-ink"
                        onClick={() => onCollapse(true)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-3">
                    {mainNavItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== '/dashboard' &&
                                pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/15 text-accent-foreground'
                                        : 'text-ink-muted hover:bg-canvas hover:text-ink',
                                    collapsed && 'justify-center px-2'
                                )}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                                )}
                                <item.icon
                                    className={cn(
                                        'h-5 w-5 flex-shrink-0 transition-colors',
                                        isActive
                                            ? 'text-accent-foreground'
                                            : 'text-ink-muted group-hover:text-ink'
                                    )}
                                />
                                {!collapsed && <span>{item.title}</span>}
                                {!collapsed && item.badge && (
                                    <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-accent-foreground">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <Separator className="my-4 mx-3" />

                <nav className="space-y-1 px-3">
                    {secondaryNavItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-brand-secondary/10 text-ink'
                                        : 'text-ink-muted hover:bg-canvas hover:text-ink',
                                    collapsed && 'justify-center px-2'
                                )}
                            >
                                {isActive && (
                                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-secondary" />
                                )}
                                <item.icon
                                    className={cn(
                                        'h-5 w-5 flex-shrink-0',
                                        isActive
                                            ? 'text-brand-secondary'
                                            : 'text-ink-muted'
                                    )}
                                />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {collapsed && onCollapse && (
                <div className="border-t border-border p-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-9 text-ink-muted hover:text-ink"
                        onClick={() => onCollapse(false)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="fixed left-4 top-4 z-40 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            <aside
                className={cn(
                    'fixed left-0 top-0 z-30 hidden h-screen border-r border-border bg-card/90 backdrop-blur-xl transition-all duration-300 lg:block',
                    collapsed ? 'w-20' : 'w-64'
                )}
            >
                <SidebarContent
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                />
            </aside>

            <div
                className={cn(
                    'hidden lg:block transition-all duration-300',
                    collapsed ? 'w-20' : 'w-64'
                )}
            />
        </>
    );
}
