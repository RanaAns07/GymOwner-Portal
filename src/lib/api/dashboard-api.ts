/**
 * Dashboard / Analytics API — Gym Scheduling System (web)
 *
 * GET /api/v1/scheduling/reports/?type=fill-rate|no-show|staff-utilization
 *     &location=&start_date=&end_date=
 */

import { apiClient } from '@/lib/api';
import { ensureDefaultLocation, fetchSessionsFromApi } from '@/lib/api/schedule-api';
import { fetchStaffFromApi } from '@/lib/api/staff-api';
import { fetchClientsFromApi } from '@/lib/api/clients-api';

export type ReportType = 'fill-rate' | 'no-show' | 'staff-utilization';

export interface DashboardReportQuery {
    type: ReportType;
    location?: string;
    start_date?: string;
    end_date?: string;
}

export interface DashboardSummary {
    totalStaff: number;
    totalClients: number;
    weekSessions: number;
    fillRatePercent: number;
    noShowRatePercent: number;
    staffUtilizationPercent: number;
    reports: {
        fillRate: unknown;
        noShow: unknown;
        staffUtilization: unknown;
    };
}

function asPercent(value: unknown): number {
    if (typeof value === 'number' && !Number.isNaN(value)) {
        return value <= 1 ? Math.round(value * 100) : Math.round(value);
    }
    if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        for (const key of ['rate', 'fill_rate', 'percentage', 'percent', 'value', 'utilization']) {
            if (typeof obj[key] === 'number') return asPercent(obj[key]);
        }
        if (Array.isArray(obj.results) && obj.results.length > 0) {
            return asPercent(obj.results[0]);
        }
    }
    return 0;
}

/**
 * GET /api/v1/scheduling/reports/
 */
export async function fetchReportFromApi(query: DashboardReportQuery): Promise<unknown> {
    const params = new URLSearchParams({ type: query.type });
    if (query.location) params.set('location', query.location);
    if (query.start_date) params.set('start_date', query.start_date);
    if (query.end_date) params.set('end_date', query.end_date);

    return apiClient.get(`/scheduling/reports/?${params.toString()}`);
}

/**
 * Aggregate dashboard stats for the owner portal home.
 * Uses reports + staff/clients/sessions list endpoints.
 *
 * @param locationFilter — concrete UUID, 'all', or omit for default location
 */
export async function fetchDashboardSummaryFromApi(
    locationFilter?: string | 'all'
): Promise<DashboardSummary> {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    const startDate = start.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    let locationId: string | undefined;
    if (locationFilter && locationFilter !== 'all') {
        locationId = locationFilter;
    } else if (locationFilter !== 'all') {
        try {
            const location = await ensureDefaultLocation();
            locationId = location.id;
        } catch {
            locationId = undefined;
        }
    }

    const reportQuery = {
        location: locationId,
        start_date: startDate,
        end_date: endDate,
    };

    const sessionLocation = locationFilter ?? locationId;

    const [staff, clients, sessions, fillRate, noShow, staffUtilization] = await Promise.all([
        fetchStaffFromApi().catch(() => []),
        fetchClientsFromApi().catch(() => []),
        fetchSessionsFromApi(today, sessionLocation).catch(() => []),
        fetchReportFromApi({ type: 'fill-rate', ...reportQuery }).catch(() => null),
        fetchReportFromApi({ type: 'no-show', ...reportQuery }).catch(() => null),
        fetchReportFromApi({ type: 'staff-utilization', ...reportQuery }).catch(() => null),
    ]);

    const capacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
    const enrolled = sessions.reduce((sum, s) => sum + s.enrolledCount, 0);
    const localFillRate = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

    return {
        totalStaff: staff.length,
        totalClients: clients.length,
        weekSessions: sessions.length,
        fillRatePercent: asPercent(fillRate) || localFillRate,
        noShowRatePercent: asPercent(noShow),
        staffUtilizationPercent: asPercent(staffUtilization),
        reports: {
            fillRate,
            noShow,
            staffUtilization,
        },
    };
}
