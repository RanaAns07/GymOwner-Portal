import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchStaffMembers,
    fetchStaffMember,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
} from '@/lib/mock-data/staff';
import type { StaffMember, CreateStaffInput, UpdateStaffInput } from '@/types/staff';

// Query keys
export const staffKeys = {
    all: ['staff'] as const,
    lists: () => [...staffKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...staffKeys.lists(), filters] as const,
    details: () => [...staffKeys.all, 'detail'] as const,
    detail: (id: string) => [...staffKeys.details(), id] as const,
};

// Fetch all staff members
export function useStaffMembers(filters?: { role?: string; status?: string }) {
    return useQuery({
        queryKey: staffKeys.list(filters || {}),
        queryFn: async () => {
            let data = await fetchStaffMembers();

            // Apply filters
            if (filters?.role) {
                data = data.filter((staff) => staff.role === filters.role);
            }
            if (filters?.status) {
                data = data.filter((staff) => staff.status === filters.status);
            }

            return data;
        },
    });
}

// Fetch single staff member
export function useStaffMember(id: string) {
    return useQuery({
        queryKey: staffKeys.detail(id),
        queryFn: () => fetchStaffMember(id),
        enabled: !!id,
    });
}

// Create staff member
export function useCreateStaffMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStaffInput) =>
            createStaffMember({
                ...data,
                status: 'active' as const,
                avatar: undefined,
            }),
        onSuccess: (newStaff) => {
            // Invalidate and refetch staff list
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
            toast.success(`${newStaff.firstName} ${newStaff.lastName} has been added to your team!`);
        },
        onError: (error) => {
            toast.error('Failed to add staff member. Please try again.');
            console.error('Create staff error:', error);
        },
    });
}

// Update staff member
export function useUpdateStaffMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStaffInput }) =>
            updateStaffMember(id, data),
        onSuccess: (updatedStaff) => {
            if (updatedStaff) {
                queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
                queryClient.setQueryData(staffKeys.detail(updatedStaff.id), updatedStaff);
                toast.success('Staff member updated successfully!');
            }
        },
        onError: (error) => {
            toast.error('Failed to update staff member. Please try again.');
            console.error('Update staff error:', error);
        },
    });
}

// Delete staff member
export function useDeleteStaffMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteStaffMember(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
            queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
            toast.success('Staff member removed successfully.');
        },
        onError: (error) => {
            toast.error('Failed to remove staff member. Please try again.');
            console.error('Delete staff error:', error);
        },
    });
}
