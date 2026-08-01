import { useQuery } from '@tanstack/react-query';
import {
    fetchDashboardSummaryFromApi,
    fetchReportFromApi,
    type DashboardReportQuery,
} from '@/lib/api/dashboard-api';
import { useLocationFilter } from '@/providers/location-context';

export const dashboardKeys = {
    all: ['dashboard'] as const,
    summary: (locationId?: string) =>
        [...dashboardKeys.all, 'summary', locationId ?? 'default'] as const,
    report: (query: DashboardReportQuery) => [...dashboardKeys.all, 'report', query] as const,
};

export function useDashboardSummary() {
    const { locationId, isLoading: locationsLoading } = useLocationFilter();
    return useQuery({
        queryKey: dashboardKeys.summary(locationId),
        queryFn: () => fetchDashboardSummaryFromApi(locationId),
        // Wait until location preference is hydrated so we don't fire twice
        // (default → 'all') and leave the UI stuck on skeletons.
        enabled: !locationsLoading,
        staleTime: 60_000,
    });
}

export function useDashboardReport(query: DashboardReportQuery, enabled = true) {
    return useQuery({
        queryKey: dashboardKeys.report(query),
        queryFn: () => fetchReportFromApi(query),
        enabled: enabled && !!query.type,
        staleTime: 60_000,
    });
}
