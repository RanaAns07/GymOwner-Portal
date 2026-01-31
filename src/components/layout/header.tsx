'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

// Map paths to readable names
const pathNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    staff: 'Staff',
    pricing: 'Pricing',
    clients: 'Clients',
    schedule: 'Schedule',
    settings: 'Settings',
    help: 'Help & Support',
};

function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center text-sm">
            {segments.map((segment, index) => {
                const href = '/' + segments.slice(0, index + 1).join('/');
                const isLast = index === segments.length - 1;
                const name = pathNameMap[segment] || segment;

                return (
                    <div key={href} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="mx-2 h-4 w-4 text-zinc-400" />
                        )}
                        {isLast ? (
                            <span className="font-medium text-zinc-900">{name}</span>
                        ) : (
                            <Link
                                href={href}
                                className="text-zinc-500 transition-colors hover:text-zinc-700"
                            >
                                {name}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200/60 bg-white/80 px-6 backdrop-blur-xl">
            {/* Left: Breadcrumbs */}
            <div className="flex items-center gap-4 pl-12 lg:pl-0">
                <Breadcrumbs />
            </div>

            {/* Right: Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-64 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 text-sm placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
                    />
                </div>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-xl text-zinc-500 hover:text-zinc-900"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-white" />
                </Button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-zinc-100"
                        >
                            <Avatar className="h-8 w-8 ring-2 ring-zinc-200">
                                <AvatarImage src="/avatars/owner.jpg" alt="John Doe" />
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-medium text-white">
                                    JD
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start text-sm lg:flex">
                                <span className="font-medium text-zinc-900">John Doe</span>
                                <span className="text-xs text-zinc-500">Gym Owner</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href="/dashboard/profile" className="flex w-full">
                                Profile Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href="/dashboard/billing" className="flex w-full">
                                Billing
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link href="/dashboard/settings" className="flex w-full">
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
