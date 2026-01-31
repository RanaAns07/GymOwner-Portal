import { Session } from '@/types/schedule';

// Generate dates for current week
function getCurrentWeekDates(): Date[] {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function formatDateTime(date: Date, hour: number, minute: number = 0): string {
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
}

const weekDates = getCurrentWeekDates();

export const mockSessions: Session[] = [
    // Monday
    {
        id: '1',
        title: 'Morning HIIT',
        type: 'group-class',
        trainerId: '1',
        trainerName: 'Sarah Johnson',
        startTime: formatDateTime(new Date(weekDates[0]), 7, 0),
        endTime: formatDateTime(new Date(weekDates[0]), 8, 0),
        capacity: 20,
        enrolledCount: 18,
        location: 'Studio A',
        status: 'scheduled',
    },
    {
        id: '2',
        title: 'Personal Training',
        type: 'personal-training',
        trainerId: '1',
        trainerName: 'Sarah Johnson',
        startTime: formatDateTime(new Date(weekDates[0]), 9, 0),
        endTime: formatDateTime(new Date(weekDates[0]), 10, 0),
        capacity: 1,
        enrolledCount: 1,
        location: 'Training Zone',
        status: 'scheduled',
    },
    {
        id: '3',
        title: 'Yoga Flow',
        type: 'group-class',
        trainerId: '2',
        trainerName: 'Michael Chen',
        startTime: formatDateTime(new Date(weekDates[0]), 10, 0),
        endTime: formatDateTime(new Date(weekDates[0]), 11, 30),
        capacity: 15,
        enrolledCount: 12,
        location: 'Studio B',
        status: 'scheduled',
    },
    {
        id: '4',
        title: 'Strength Basics',
        type: 'group-class',
        trainerId: '8',
        trainerName: 'Robert Martinez',
        startTime: formatDateTime(new Date(weekDates[0]), 17, 0),
        endTime: formatDateTime(new Date(weekDates[0]), 18, 0),
        capacity: 12,
        enrolledCount: 10,
        location: 'Weight Room',
        status: 'scheduled',
    },

    // Tuesday
    {
        id: '5',
        title: 'Pilates Core',
        type: 'group-class',
        trainerId: '2',
        trainerName: 'Michael Chen',
        startTime: formatDateTime(new Date(weekDates[1]), 8, 0),
        endTime: formatDateTime(new Date(weekDates[1]), 9, 0),
        capacity: 15,
        enrolledCount: 14,
        location: 'Studio B',
        status: 'scheduled',
    },
    {
        id: '6',
        title: 'Boxing Fundamentals',
        type: 'group-class',
        trainerId: '8',
        trainerName: 'Robert Martinez',
        startTime: formatDateTime(new Date(weekDates[1]), 12, 0),
        endTime: formatDateTime(new Date(weekDates[1]), 13, 0),
        capacity: 10,
        enrolledCount: 8,
        location: 'Boxing Ring',
        status: 'scheduled',
    },
    {
        id: '7',
        title: 'Personal Training',
        type: 'personal-training',
        trainerId: '1',
        trainerName: 'Sarah Johnson',
        startTime: formatDateTime(new Date(weekDates[1]), 14, 0),
        endTime: formatDateTime(new Date(weekDates[1]), 15, 0),
        capacity: 1,
        enrolledCount: 1,
        location: 'Training Zone',
        status: 'scheduled',
    },
    {
        id: '8',
        title: 'Evening HIIT',
        type: 'group-class',
        trainerId: '1',
        trainerName: 'Sarah Johnson',
        startTime: formatDateTime(new Date(weekDates[1]), 18, 0),
        endTime: formatDateTime(new Date(weekDates[1]), 19, 0),
        capacity: 20,
        enrolledCount: 16,
        location: 'Studio A',
        status: 'scheduled',
    },

    // Wednesday
    {
        id: '9',
        title: 'Sunrise Yoga',
        type: 'group-class',
        trainerId: '2',
        trainerName: 'Michael Chen',
        startTime: formatDateTime(new Date(weekDates[2]), 6, 30),
        endTime: formatDateTime(new Date(weekDates[2]), 7, 30),
        capacity: 15,
        enrolledCount: 10,
        location: 'Studio B',
        status: 'scheduled',
    },
    {
        id: '10',
        title: 'Nutrition Workshop',
        type: 'workshop',
        trainerId: '3',
        trainerName: 'Emma Williams',
        startTime: formatDateTime(new Date(weekDates[2]), 11, 0),
        endTime: formatDateTime(new Date(weekDates[2]), 12, 30),
        capacity: 25,
        enrolledCount: 20,
        location: 'Conference Room',
        status: 'scheduled',
    },
    {
        id: '11',
        title: 'Open Gym',
        type: 'open-gym',
        trainerId: '6',
        trainerName: 'David Kim',
        startTime: formatDateTime(new Date(weekDates[2]), 14, 0),
        endTime: formatDateTime(new Date(weekDates[2]), 17, 0),
        capacity: 50,
        enrolledCount: 22,
        location: 'Main Floor',
        status: 'scheduled',
    },

    // Thursday
    {
        id: '12',
        title: 'CrossFit WOD',
        type: 'group-class',
        trainerId: '1',
        trainerName: 'Sarah Johnson',
        startTime: formatDateTime(new Date(weekDates[3]), 7, 0),
        endTime: formatDateTime(new Date(weekDates[3]), 8, 0),
        capacity: 12,
        enrolledCount: 12,
        location: 'CrossFit Area',
        status: 'scheduled',
    },
    {
        id: '13',
        title: 'Personal Training',
        type: 'personal-training',
        trainerId: '8',
        trainerName: 'Robert Martinez',
        startTime: formatDateTime(new Date(weekDates[3]), 10, 0),
        endTime: formatDateTime(new Date(weekDates[3]), 11, 0),
        capacity: 1,
        enrolledCount: 1,
        location: 'Training Zone',
        status: 'scheduled',
    },
    {
        id: '14',
        title: 'Cardio Kickboxing',
        type: 'group-class',
        trainerId: '8',
        trainerName: 'Robert Martinez',
        startTime: formatDateTime(new Date(weekDates[3]), 17, 30),
        endTime: formatDateTime(new Date(weekDates[3]), 18, 30),
        capacity: 15,
        enrolledCount: 13,
        location: 'Studio A',
        status: 'scheduled',
    },

    // Friday
    {
        id: '15',
        title: 'Power Yoga',
        type: 'group-class',
        trainerId: '2',
        trainerName: 'Michael Chen',
        startTime: formatDateTime(new Date(weekDates[4]), 9, 0),
        endTime: formatDateTime(new Date(weekDates[4]), 10, 0),
        capacity: 15,
        enrolledCount: 11,
        location: 'Studio B',
        status: 'scheduled',
    },
    {
        id: '16',
        title: 'HIIT Circuit',
        type: 'group-class',
        trainerId: '1',
        trainerName: 'Sarah Johnson',
        startTime: formatDateTime(new Date(weekDates[4]), 12, 0),
        endTime: formatDateTime(new Date(weekDates[4]), 13, 0),
        capacity: 20,
        enrolledCount: 15,
        location: 'Studio A',
        status: 'scheduled',
    },
    {
        id: '17',
        title: 'Open Gym',
        type: 'open-gym',
        trainerId: '6',
        trainerName: 'David Kim',
        startTime: formatDateTime(new Date(weekDates[4]), 15, 0),
        endTime: formatDateTime(new Date(weekDates[4]), 20, 0),
        capacity: 50,
        enrolledCount: 30,
        location: 'Main Floor',
        status: 'scheduled',
    },

    // Saturday
    {
        id: '18',
        title: 'Weekend Warriors',
        type: 'group-class',
        trainerId: '1',
        trainerName: 'Sarah Johnson',
        startTime: formatDateTime(new Date(weekDates[5]), 9, 0),
        endTime: formatDateTime(new Date(weekDates[5]), 10, 30),
        capacity: 25,
        enrolledCount: 22,
        location: 'Studio A',
        status: 'scheduled',
    },
    {
        id: '19',
        title: 'Meditation & Stretch',
        type: 'group-class',
        trainerId: '2',
        trainerName: 'Michael Chen',
        startTime: formatDateTime(new Date(weekDates[5]), 11, 0),
        endTime: formatDateTime(new Date(weekDates[5]), 12, 0),
        capacity: 15,
        enrolledCount: 8,
        location: 'Studio B',
        status: 'scheduled',
    },

    // Sunday
    {
        id: '20',
        title: 'Open Gym',
        type: 'open-gym',
        trainerId: '6',
        trainerName: 'David Kim',
        startTime: formatDateTime(new Date(weekDates[6]), 10, 0),
        endTime: formatDateTime(new Date(weekDates[6]), 16, 0),
        capacity: 50,
        enrolledCount: 18,
        location: 'Main Floor',
        status: 'scheduled',
    },
];

export async function fetchSessions(weekStart?: Date): Promise<Session[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockSessions;
}

export async function createSession(
    data: Omit<Session, 'id'>
): Promise<Session> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newSession: Session = {
        ...data,
        id: String(mockSessions.length + 1),
    };
    mockSessions.push(newSession);
    return newSession;
}
