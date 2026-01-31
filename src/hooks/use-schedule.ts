import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchSessions, createSession } from '@/lib/mock-data/schedule';
import type { Session, CreateSessionInput } from '@/types/schedule';

export const scheduleKeys = {
    all: ['schedule'] as const,
    weeks: () => [...scheduleKeys.all, 'week'] as const,
    week: (date: string) => [...scheduleKeys.weeks(), date] as const,
};

export function useSessions(weekStart?: Date) {
    return useQuery({
        queryKey: scheduleKeys.week(weekStart?.toISOString() || 'current'),
        queryFn: () => fetchSessions(weekStart),
    });
}

export function useCreateSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSessionInput) =>
            createSession({
                ...data,
                trainerName: 'Staff Member', // Would be looked up in real app
                enrolledCount: 0,
                status: 'scheduled',
            }),
        onSuccess: (newSession) => {
            queryClient.invalidateQueries({ queryKey: scheduleKeys.weeks() });
            toast.success(`"${newSession.title}" has been scheduled!`);
        },
        onError: () => {
            toast.error('Failed to create session. Please try again.');
        },
    });
}
