import { useQuery } from '@tanstack/react-query';
import {
    fetchDashboardSummaryFromApi,
    fetchReportFromApi,
    type DashboardReportQuery,
} from '@/lib/api/dashboard-api';

export const dashboardKeys = {
    all: ['dashboard'] as const,
    summary: () => [...dashboardKeys.all, 'summary'] as const,
    report: (query: DashboardReportQuery) => [...dashboardKeys.all, 'report', query] as const,
};

export function useDashboardSummary() {
    return useQuery({
        queryKey: dashboardKeys.summary(),
        queryFn: fetchDashboardSummaryFromApi,
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
