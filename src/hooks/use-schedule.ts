import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchSessionsFromApi,
    createSessionApi,
    updateSessionApi,
    deleteSessionApi,
    fetchLocationsFromApi,
    fetchClassTemplatesFromApi,
    fetchRecurrenceRulesFromApi,
} from '@/lib/api/schedule-api';
import type { CreateSessionInput, Session } from '@/types/schedule';

export const scheduleKeys = {
    all: ['schedule'] as const,
    weeks: () => [...scheduleKeys.all, 'week'] as const,
    week: (date: string) => [...scheduleKeys.weeks(), date] as const,
    details: () => [...scheduleKeys.all, 'detail'] as const,
    detail: (id: string) => [...scheduleKeys.details(), id] as const,
    locations: () => [...scheduleKeys.all, 'locations'] as const,
    templates: () => [...scheduleKeys.all, 'templates'] as const,
    recurrenceRules: () => [...scheduleKeys.all, 'recurrence-rules'] as const,
};

function weekKeyFromDate(date?: Date): string {
    if (!date) return 'current';
    const day = date.getDay();
    const monday = new Date(date);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    const yyyy = monday.getFullYear();
    const mm = String(monday.getMonth() + 1).padStart(2, '0');
    const dd = String(monday.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export function useSessions(weekStart?: Date) {
    return useQuery({
        queryKey: scheduleKeys.week(weekKeyFromDate(weekStart)),
        queryFn: () => fetchSessionsFromApi(weekStart),
    });
}

export function useLocations() {
    return useQuery({
        queryKey: scheduleKeys.locations(),
        queryFn: fetchLocationsFromApi,
    });
}

export function useClassTemplates() {
    return useQuery({
        queryKey: scheduleKeys.templates(),
        queryFn: fetchClassTemplatesFromApi,
    });
}

export function useRecurrenceRules() {
    return useQuery({
        queryKey: scheduleKeys.recurrenceRules(),
        queryFn: fetchRecurrenceRulesFromApi,
    });
}

export function useCreateSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSessionInput) => createSessionApi(data),
        onSuccess: (newSession) => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.weeks() });
            toast.success(`"${newSession.title}" has been scheduled!`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to create session';
            toast.error(message);
            console.error('Create session error:', error);
        },
    });
}

export function useUpdateSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Partial<{
                title: string;
                startTime: string;
                endTime: string;
                capacity: number;
                trainerId: string;
                location: string;
                roomUrl: string;
            }>;
        }) => updateSessionApi(id, data),
        onSuccess: (updatedSession) => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.weeks() });
            queryClient.setQueryData(scheduleKeys.detail(updatedSession.id), updatedSession);
            toast.success('Session updated successfully!');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to update session';
            toast.error(message);
            console.error('Update session error:', error);
        },
    });
}

export function useDeleteSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteSessionApi(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: scheduleKeys.weeks() });
            const previous = queryClient.getQueriesData<Session[]>({
                queryKey: scheduleKeys.weeks(),
            });
            queryClient.setQueriesData<Session[]>(
                { queryKey: scheduleKeys.weeks() },
                (old) => (old ? old.filter((session) => session.id !== id) : old)
            );
            return { previous };
        },
        onSuccess: () => {
            toast.success('Session deleted successfully.');
        },
        onError: (error, _id, context) => {
            context?.previous?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
            const message = error instanceof Error ? error.message : 'Failed to delete session';
            toast.error(message);
            console.error('Delete session error:', error);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.weeks() });
        },
    });
}
