'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    fetchLocationsFromApi,
    type BackendLocation,
} from '@/lib/api/schedule-api';
import { locationKeys } from '@/hooks/use-locations';

export const ALL_LOCATIONS = 'all' as const;
export type LocationSelection = string | typeof ALL_LOCATIONS;

const STORAGE_KEY = 'gymflow.selectedLocationId';

interface LocationContextValue {
    locations: BackendLocation[];
    isLoading: boolean;
    locationId: LocationSelection;
    isAllLocations: boolean;
    selectedLocation: BackendLocation | null;
    setLocationId: (id: LocationSelection) => void;
    /** Concrete location UUID for APIs that require one; falls back to first location. */
    resolveLocationId: () => string | undefined;
}

const LocationContext = createContext<LocationContextValue | null>(null);

function readStoredLocationId(): LocationSelection {
    if (typeof window === 'undefined') return ALL_LOCATIONS;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === ALL_LOCATIONS || (stored && stored.length > 0)) {
            return stored as LocationSelection;
        }
    } catch {
        // ignore
    }
    return ALL_LOCATIONS;
}

export function LocationProvider({ children }: { children: ReactNode }) {
    const [locationId, setLocationIdState] = useState<LocationSelection>(ALL_LOCATIONS);
    const [hydrated, setHydrated] = useState(false);

    const { data: locations = [], isLoading } = useQuery({
        queryKey: locationKeys.lists(),
        queryFn: fetchLocationsFromApi,
        staleTime: 60_000,
    });

    useEffect(() => {
        setLocationIdState(readStoredLocationId());
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated || isLoading || locations.length === 0) return;
        if (locationId === ALL_LOCATIONS) return;
        if (!locations.some((l) => l.id === locationId)) {
            setLocationIdState(ALL_LOCATIONS);
            try {
                localStorage.setItem(STORAGE_KEY, ALL_LOCATIONS);
            } catch {
                // ignore
            }
        }
    }, [hydrated, isLoading, locations, locationId]);

    const setLocationId = useCallback((id: LocationSelection) => {
        setLocationIdState(id);
        try {
            localStorage.setItem(STORAGE_KEY, id);
        } catch {
            // ignore
        }
    }, []);

    const selectedLocation = useMemo(() => {
        if (locationId === ALL_LOCATIONS) return null;
        return locations.find((l) => l.id === locationId) ?? null;
    }, [locationId, locations]);

    const resolveLocationId = useCallback(() => {
        if (locationId !== ALL_LOCATIONS) return locationId;
        return locations[0]?.id;
    }, [locationId, locations]);

    const value = useMemo<LocationContextValue>(
        () => ({
            locations,
            isLoading,
            locationId,
            isAllLocations: locationId === ALL_LOCATIONS,
            selectedLocation,
            setLocationId,
            resolveLocationId,
        }),
        [
            locations,
            isLoading,
            locationId,
            selectedLocation,
            setLocationId,
            resolveLocationId,
        ]
    );

    return (
        <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
    );
}

export function useLocationFilter(): LocationContextValue {
    const ctx = useContext(LocationContext);
    if (!ctx) {
        throw new Error('useLocationFilter must be used within LocationProvider');
    }
    return ctx;
}
