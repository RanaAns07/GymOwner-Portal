import { StaffMember, StaffRole, StaffStatus } from '@/types/staff';

// Mock data for development - ready to be replaced with real API calls

export const mockStaffMembers: StaffMember[] = [
    {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@gymflow.com',
        phone: '+1 555-0123',
        role: 'trainer',
        status: 'active',
        avatar: undefined,
        specializations: ['Strength Training', 'HIIT', 'Weight Loss'],
        hireDate: '2023-03-15',
        permissions: ['manage_clients', 'manage_schedule'],
    },
    {
        id: '2',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@gymflow.com',
        phone: '+1 555-0124',
        role: 'trainer',
        status: 'active',
        avatar: undefined,
        specializations: ['Yoga', 'Pilates', 'Flexibility'],
        hireDate: '2023-05-20',
        permissions: ['manage_clients', 'manage_schedule'],
    },
    {
        id: '3',
        firstName: 'Emma',
        lastName: 'Williams',
        email: 'emma.williams@gymflow.com',
        phone: '+1 555-0125',
        role: 'nutritionist',
        status: 'active',
        avatar: undefined,
        specializations: ['Diet Planning', 'Sports Nutrition', 'Weight Management'],
        hireDate: '2023-01-10',
        permissions: ['manage_clients', 'view_reports'],
    },
    {
        id: '4',
        firstName: 'James',
        lastName: 'Rodriguez',
        email: 'james.rodriguez@gymflow.com',
        phone: '+1 555-0126',
        role: 'physiotherapist',
        status: 'on-leave',
        avatar: undefined,
        specializations: ['Sports Injuries', 'Rehabilitation', 'Pain Management'],
        hireDate: '2022-09-01',
        permissions: ['manage_clients', 'manage_schedule', 'view_reports'],
    },
    {
        id: '5',
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'lisa.thompson@gymflow.com',
        phone: '+1 555-0127',
        role: 'receptionist',
        status: 'active',
        avatar: undefined,
        specializations: ['Customer Service', 'Scheduling'],
        hireDate: '2023-07-01',
        permissions: ['manage_schedule'],
    },
    {
        id: '6',
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@gymflow.com',
        phone: '+1 555-0128',
        role: 'manager',
        status: 'active',
        avatar: undefined,
        specializations: ['Operations', 'Team Leadership', 'Business Development'],
        hireDate: '2022-01-15',
        permissions: ['full_access'],
    },
    {
        id: '7',
        firstName: 'Amanda',
        lastName: 'Foster',
        email: 'amanda.foster@gymflow.com',
        phone: '+1 555-0129',
        role: 'trainer',
        status: 'inactive',
        avatar: undefined,
        specializations: ['CrossFit', 'Functional Training'],
        hireDate: '2023-02-20',
        permissions: ['manage_clients', 'manage_schedule'],
    },
    {
        id: '8',
        firstName: 'Robert',
        lastName: 'Martinez',
        email: 'robert.martinez@gymflow.com',
        phone: '+1 555-0130',
        role: 'trainer',
        status: 'active',
        avatar: undefined,
        specializations: ['Boxing', 'Cardio', 'Self-Defense'],
        hireDate: '2023-08-10',
        permissions: ['manage_clients', 'manage_schedule'],
    },
];

// Simulated API functions - these will be replaced with real API calls
export async function fetchStaffMembers(): Promise<StaffMember[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockStaffMembers;
}

export async function fetchStaffMember(id: string): Promise<StaffMember | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStaffMembers.find((staff) => staff.id === id);
}

export async function createStaffMember(data: Omit<StaffMember, 'id' | 'hireDate'>): Promise<StaffMember> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newStaff: StaffMember = {
        ...data,
        id: String(mockStaffMembers.length + 1),
        hireDate: new Date().toISOString().split('T')[0],
    };
    mockStaffMembers.push(newStaff);
    return newStaff;
}

export async function updateStaffMember(
    id: string,
    data: Partial<StaffMember>
): Promise<StaffMember | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockStaffMembers.findIndex((staff) => staff.id === id);
    if (index !== -1) {
        mockStaffMembers[index] = { ...mockStaffMembers[index], ...data };
        return mockStaffMembers[index];
    }
    return undefined;
}

export async function deleteStaffMember(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockStaffMembers.findIndex((staff) => staff.id === id);
    if (index !== -1) {
        mockStaffMembers.splice(index, 1);
        return true;
    }
    return false;
}
