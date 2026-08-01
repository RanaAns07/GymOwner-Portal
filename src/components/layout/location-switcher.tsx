'use client';

import { MapPin, Building2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ALL_LOCATIONS,
    useLocationFilter,
    type LocationSelection,
} from '@/providers/location-context';
import { cn } from '@/lib/utils';

interface LocationSwitcherProps {
    className?: string;
    /** Compact header style vs page filter bar */
    variant?: 'header' | 'filter';
}

export function LocationSwitcher({
    className,
    variant = 'header',
}: LocationSwitcherProps) {
    const { locations, locationId, setLocationId, isLoading } = useLocationFilter();

    return (
        <Select
            value={locationId}
            onValueChange={(value) => setLocationId(value as LocationSelection)}
            disabled={isLoading}
        >
            <SelectTrigger
                size={variant === 'header' ? 'sm' : 'default'}
                className={cn(
                    variant === 'header'
                        ? 'h-9 max-w-[220px] rounded-xl border-border bg-canvas/60 px-3 shadow-none'
                        : 'h-10 w-full max-w-xs rounded-xl',
                    className
                )}
                aria-label="Filter by location"
            >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-foreground" />
                <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[220px]">
                <SelectItem value={ALL_LOCATIONS}>
                    <span className="inline-flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-ink-muted" />
                        All locations
                    </span>
                </SelectItem>
                {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                        {location.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
