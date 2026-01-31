// Staff member type definitions

export interface StaffMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: StaffRole;
    status: StaffStatus;
    avatar?: string;
    specializations: string[];
    hireDate: string;
    permissions: StaffPermission[];
}

export type StaffRole =
    | 'trainer'
    | 'receptionist'
    | 'manager'
    | 'nutritionist'
    | 'physiotherapist';

export type StaffStatus = 'active' | 'on-leave' | 'inactive';

export type StaffPermission =
    | 'manage_clients'
    | 'manage_schedule'
    | 'view_reports'
    | 'manage_pricing'
    | 'manage_staff'
    | 'full_access';

export interface CreateStaffInput {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: StaffRole;
    specializations: string[];
    permissions: StaffPermission[];
}

export interface UpdateStaffInput extends Partial<CreateStaffInput> {
    status?: StaffStatus;
}

// Role display labels
export const roleLabels: Record<StaffRole, string> = {
    trainer: 'Personal Trainer',
    receptionist: 'Receptionist',
    manager: 'Manager',
    nutritionist: 'Nutritionist',
    physiotherapist: 'Physiotherapist',
};

// Status display config
export const statusConfig: Record<StaffStatus, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    'on-leave': { label: 'On Leave', color: 'bg-amber-100 text-amber-700' },
    inactive: { label: 'Inactive', color: 'bg-zinc-100 text-zinc-600' },
};

// Permission labels
export const permissionLabels: Record<StaffPermission, string> = {
    manage_clients: 'Manage Clients',
    manage_schedule: 'Manage Schedule',
    view_reports: 'View Reports',
    manage_pricing: 'Manage Pricing',
    manage_staff: 'Manage Staff',
    full_access: 'Full Access',
};
