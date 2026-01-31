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
    HelpCircle,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
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
];

const secondaryNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
    {
        title: 'Help & Support',
        href: '/dashboard/help',
        icon: HelpCircle,
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
            {/* Logo */}
            <div className={cn(
                "flex h-16 items-center border-b border-zinc-200/60 px-4",
                collapsed ? "justify-center" : "justify-between"
            )}>
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                        <Dumbbell className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-tight text-zinc-900">
                            GymFlow
                        </span>
                    )}
                </Link>
                {!collapsed && onCollapse && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                        onClick={() => onCollapse(true)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-3">
                    {mainNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700"
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive
                                            ? "text-violet-600"
                                            : "text-zinc-500 group-hover:text-zinc-700"
                                    )}
                                />
                                {!collapsed && <span>{item.title}</span>}
                                {!collapsed && item.badge && (
                                    <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
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
                                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-zinc-100 text-zinc-900"
                                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
                                    collapsed && "justify-center px-2"
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Collapse Toggle (for expanded state from bottom) */}
            {collapsed && onCollapse && (
                <div className="border-t border-zinc-200/60 p-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-9 text-zinc-500 hover:text-zinc-900"
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
            {/* Mobile Sidebar */}
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

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-30 hidden h-screen border-r border-zinc-200/60 bg-white/80 backdrop-blur-xl transition-all duration-300 lg:block",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <SidebarContent collapsed={collapsed} onCollapse={setCollapsed} />
            </aside>

            {/* Spacer for main content */}
            <div
                className={cn(
                    "hidden lg:block transition-all duration-300",
                    collapsed ? "w-20" : "w-64"
                )}
            />
        </>
    );
}
