// Schedule/Session type definitions

export interface Session {
    id: string;
    title: string;
    type: SessionType;
    trainerId: string;
    trainerName: string;
    startTime: string; // ISO date string
    endTime: string;
    capacity: number;
    enrolledCount: number;
    location: string;
    status: SessionStatus;
    color?: string;
}

export type SessionType =
    | 'group-class'
    | 'personal-training'
    | 'workshop'
    | 'open-gym';

export type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface CreateSessionInput {
    title: string;
    type: SessionType;
    trainerId: string;
    startTime: string;
    endTime: string;
    capacity: number;
    location: string;
}

// Display labels
export const sessionTypeLabels: Record<SessionType, string> = {
    'group-class': 'Group Class',
    'personal-training': 'Personal Training',
    workshop: 'Workshop',
    'open-gym': 'Open Gym',
};

export const sessionTypeColors: Record<SessionType, string> = {
    'group-class': 'bg-violet-500',
    'personal-training': 'bg-emerald-500',
    workshop: 'bg-amber-500',
    'open-gym': 'bg-blue-500',
};

export const sessionStatusConfig: Record<SessionStatus, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
    'in-progress': { label: 'In Progress', color: 'bg-emerald-100 text-emerald-700' },
    completed: { label: 'Completed', color: 'bg-zinc-100 text-zinc-600' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};
