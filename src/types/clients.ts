// Client type definitions

export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    membershipId?: string;
    membershipName?: string;
    assignedStaffId?: string;
    assignedStaffName?: string;
    status: ClientStatus;
    joinDate: string;
    lastVisit?: string;
}

export type ClientStatus = 'active' | 'inactive' | 'pending';

export const clientStatusConfig: Record<ClientStatus, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    inactive: { label: 'Inactive', color: 'bg-zinc-100 text-zinc-600' },
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
};
