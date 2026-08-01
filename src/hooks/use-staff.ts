import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchStaffFromApi,
    fetchStaffMemberFromApi,
    createStaffMemberApi,
    updateStaffMemberApi,
    deleteStaffMemberApi,
} from '@/lib/api/staff-api';
import {
    fetchStaffDetailedSchedulingFromApi,
    fetchUserDetailedSchedulingFromApi,
    toggleUserDeactivateApi,
} from '@/lib/api/clients-api';
import type { StaffMember, CreateStaffInput, UpdateStaffInput } from '@/types/staff';

// Query keys
export const staffKeys = {
    all: ['staff'] as const,
    lists: () => [...staffKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...staffKeys.lists(), filters] as const,
    details: () => [...staffKeys.all, 'detail'] as const,
    detail: (id: string) => [...staffKeys.details(), id] as const,
    detailedList: (params: Record<string, unknown>) =>
        [...staffKeys.all, 'detailed-list', params] as const,
    detailedScheduling: (id: string) =>
        [...staffKeys.detail(id), 'detailed-scheduling'] as const,
};

// Fetch all staff members
export function useStaffMembers(filters?: { role?: string; status?: string }) {
    return useQuery({
        queryKey: staffKeys.list(filters || {}),
        queryFn: async () => {
            let data = await fetchStaffFromApi();

            // Apply client-side filters if needed
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
        queryFn: () => fetchStaffMemberFromApi(id),
        enabled: !!id,
    });
}

// Create staff member
export function useCreateStaffMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStaffInput) => createStaffMemberApi(data),
        onSuccess: (newStaff) => {
            // Invalidate and refetch staff list
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
            toast.success(`${newStaff.firstName} ${newStaff.lastName} has been added to your team!`);
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to add staff member';
            toast.error(message);
            console.error('Create staff error:', error);
        },
    });
}

// Update staff member
export function useUpdateStaffMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStaffInput }) =>
            updateStaffMemberApi(id, data),
        onSuccess: (updatedStaff) => {
            if (updatedStaff) {
                queryClient.setQueryData(staffKeys.detail(updatedStaff.id), updatedStaff);
                queryClient.setQueriesData<StaffMember[]>(
                    { queryKey: staffKeys.lists() },
                    (old) => {
                        if (!old) return old;
                        return old.map((member) =>
                            member.id === updatedStaff.id
                                ? { ...member, ...updatedStaff }
                                : member
                        );
                    }
                );
                queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
                toast.success('Staff member updated successfully!');
            }
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to update staff member';
            toast.error(message);
            console.error('Update staff error:', error);
        },
    });
}

// Delete staff member
export function useDeleteStaffMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteStaffMemberApi(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
            queryClient.removeQueries({ queryKey: staffKeys.detail(id) });
            toast.success('Staff member removed.');
        },
        onError: (error) => {
            const message = error instanceof Error ? error.message : 'Failed to remove staff member';
            toast.error(message);
            console.error('Delete staff error:', error);
        },
    });
}

export function useStaffDetailedSchedulingList(params?: {
    page?: number;
    page_size?: number;
    search?: string;
}) {
    return useQuery({
        queryKey: staffKeys.detailedList(params || {}),
        queryFn: () => fetchStaffDetailedSchedulingFromApi(params),
    });
}

export function useStaffDetailedScheduling(id: string, enabled = true) {
    return useQuery({
        queryKey: staffKeys.detailedScheduling(id),
        queryFn: () => fetchUserDetailedSchedulingFromApi(id),
        enabled: enabled && !!id,
    });
}

export function useToggleStaffDeactivate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => toggleUserDeactivateApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
            toast.success('Staff account status updated.');
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : 'Failed to update staff status'
            );
        },
    });
}
