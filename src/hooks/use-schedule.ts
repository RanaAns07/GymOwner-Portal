import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchSessionsFromApi,
    createSessionApi,
    updateSessionApi,
    deleteSessionApi,
} from '@/lib/api/schedule-api';
import type { Session, CreateSessionInput } from '@/types/schedule';

export const scheduleKeys = {
    all: ['schedule'] as const,
    weeks: () => [...scheduleKeys.all, 'week'] as const,
    week: (date: string) => [...scheduleKeys.weeks(), date] as const,
    details: () => [...scheduleKeys.all, 'detail'] as const,
    detail: (id: string) => [...scheduleKeys.details(), id] as const,
};

export function useSessions(weekStart?: Date) {
    return useQuery({
        queryKey: scheduleKeys.week(weekStart?.toISOString() || 'current'),
        queryFn: () => fetchSessionsFromApi(weekStart),
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.weeks() });
            toast.success('Session deleted successfully.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to delete session';
            toast.error(message);
            console.error('Delete session error:', error);
        },
    });
}
