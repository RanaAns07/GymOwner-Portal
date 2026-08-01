'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/providers/auth-context';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LocationSwitcher } from '@/components/layout/location-switcher';

const pathNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    staff: 'Staff',
    locations: 'Locations',
    rooms: 'Rooms',
    pricing: 'Pricing',
    clients: 'Clients',
    schedule: 'Schedule',
    operations: 'Operations',
    access: 'Facility Access',
    inventory: 'Inventory',
    finance: 'Finance',
    settings: 'Settings',
    profile: 'Profile Settings',
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
                const looksLikeId =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                        segment
                    ) || /^\d+$/.test(segment);
                const name = pathNameMap[segment] || (looksLikeId ? 'Details' : segment);

                return (
                    <div key={href} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight className="mx-2 h-4 w-4 text-ink-muted" />
                        )}
                        {isLast ? (
                            <span className="font-medium text-ink">{name}</span>
                        ) : (
                            <Link
                                href={href}
                                className="text-ink-muted transition-colors hover:text-ink"
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
    const { user, logout } = useAuth();

    const initials = user?.nickname
        ? user.nickname.substring(0, 2).toUpperCase()
        : user?.email?.substring(0, 2).toUpperCase() || 'U';

    const displayName = user?.nickname || user?.email?.split('@')[0] || 'User';
    const displayRole =
        user?.role === 'gym_owner'
            ? 'Gym Owner'
            : user?.role === 'gym_manager'
              ? 'Manager'
              : user?.role === 'trainer'
                ? 'Trainer'
                : 'Staff';

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 pl-12 lg:pl-0">
                <Breadcrumbs />
            </div>

            <div className="flex items-center gap-2">
                <LocationSwitcher className="hidden sm:flex" />
                <ThemeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-canvas"
                        >
                            <ProfileAvatar
                                className="h-8 w-8 ring-2 ring-border"
                                src={user?.profile?.profile_image}
                                alt={displayName}
                                fallback={initials}
                                fallbackClassName="bg-[#0b1220] text-xs font-medium text-primary dark:bg-primary dark:text-primary-foreground"
                            />
                            <div className="hidden flex-col items-start text-sm lg:flex">
                                <span className="font-medium text-ink">
                                    {displayName}
                                </span>
                                <span className="text-xs text-ink-muted capitalize">
                                    {displayRole}
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dashboard/profile"
                                className="flex w-full cursor-pointer"
                            >
                                Profile Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => logout()}
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
