'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCreateStaffMember } from '@/hooks/use-staff';
import type { StaffRole, StaffPermission } from '@/types/staff';
import { roleLabels, permissionLabels } from '@/types/staff';
import { ChevronLeft, ChevronRight, CheckCircle2, User, Briefcase, Shield } from 'lucide-react';

// Form schema
const staffFormSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    role: z.enum(['trainer', 'receptionist', 'manager', 'nutritionist', 'physiotherapist']),
    specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
    permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

interface AddStaffModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Role & Skills', icon: Briefcase },
    { id: 3, title: 'Permissions', icon: Shield },
];

const specializationOptions = [
    'Strength Training',
    'HIIT',
    'Weight Loss',
    'Yoga',
    'Pilates',
    'Flexibility',
    'CrossFit',
    'Functional Training',
    'Boxing',
    'Cardio',
    'Sports Nutrition',
    'Diet Planning',
    'Rehabilitation',
    'Pain Management',
    'Customer Service',
    'Scheduling',
];

export function AddStaffModal({ open, onOpenChange }: AddStaffModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const createStaff = useCreateStaffMember();

    const form = useForm<StaffFormData>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            role: 'trainer',
            specializations: [],
            permissions: [],
        },
    });

    const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
    const selectedSpecializations = watch('specializations');
    const selectedPermissions = watch('permissions');
    const selectedRole = watch('role');

    const toggleSpecialization = (spec: string) => {
        const current = selectedSpecializations || [];
        if (current.includes(spec)) {
            setValue('specializations', current.filter((s) => s !== spec));
        } else {
            setValue('specializations', [...current, spec]);
        }
    };

    const togglePermission = (perm: string) => {
        const current = selectedPermissions || [];
        if (current.includes(perm)) {
            setValue('permissions', current.filter((p) => p !== perm));
        } else {
            setValue('permissions', [...current, perm]);
        }
    };

    const onSubmit = async (data: StaffFormData) => {
        try {
            await createStaff.mutateAsync({
                ...data,
                role: data.role as StaffRole,
                permissions: data.permissions as StaffPermission[],
            });
            onOpenChange(false);
            form.reset();
            setCurrentStep(1);
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    const canProceed = () => {
        if (currentStep === 1) {
            return !errors.firstName && !errors.lastName && !errors.email &&
                watch('firstName') && watch('lastName') && watch('email');
        }
        if (currentStep === 2) {
            return selectedSpecializations && selectedSpecializations.length > 0;
        }
        return true;
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            form.reset();
            setCurrentStep(1);
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-100">
                    <DialogTitle className="text-xl font-semibold">Add Team Member</DialogTitle>
                    <DialogDescription>
                        Invite a new staff member to your gym.
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-zinc-50/50">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex items-center">
                                    <div
                                        className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                                            currentStep >= step.id
                                                ? "border-violet-600 bg-violet-600 text-white"
                                                : "border-zinc-300 bg-white text-zinc-400"
                                        )}
                                    >
                                        {currentStep > step.id ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "ml-3 text-sm font-medium hidden sm:block",
                                            currentStep >= step.id ? "text-zinc-900" : "text-zinc-500"
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "mx-4 h-0.5 w-12 transition-colors duration-300",
                                            currentStep > step.id ? "bg-violet-600" : "bg-zinc-200"
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="px-6 py-5 min-h-[280px]">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="Sarah"
                                            {...register('firstName')}
                                            className={cn(errors.firstName && "border-red-500")}
                                        />
                                        {errors.firstName && (
                                            <p className="text-xs text-red-500">{errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Johnson"
                                            {...register('lastName')}
                                            className={cn(errors.lastName && "border-red-500")}
                                        />
                                        {errors.lastName && (
                                            <p className="text-xs text-red-500">{errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="sarah.johnson@example.com"
                                        {...register('email')}
                                        className={cn(errors.email && "border-red-500")}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+1 555-0123"
                                        {...register('phone')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Role & Specializations */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={selectedRole}
                                        onValueChange={(value) => setValue('role', value as StaffRole)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(roleLabels).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Specializations</Label>
                                    <p className="text-xs text-zinc-500">Select skills and areas of expertise</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {specializationOptions.map((spec) => (
                                            <Badge
                                                key={spec}
                                                variant="outline"
                                                className={cn(
                                                    "cursor-pointer transition-all duration-200",
                                                    selectedSpecializations?.includes(spec)
                                                        ? "border-violet-500 bg-violet-50 text-violet-700"
                                                        : "border-zinc-200 hover:border-zinc-300"
                                                )}
                                                onClick={() => toggleSpecialization(spec)}
                                            >
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                    {errors.specializations && (
                                        <p className="text-xs text-red-500 mt-1">{errors.specializations.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Permissions */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <Label>Access Permissions</Label>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Define what this team member can do in the system
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {(Object.entries(permissionLabels) as [StaffPermission, string][]).map(
                                        ([value, label]) => (
                                            <div
                                                key={value}
                                                onClick={() => togglePermission(value)}
                                                className={cn(
                                                    "flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all duration-200",
                                                    selectedPermissions?.includes(value)
                                                        ? "border-violet-500 bg-violet-50/50"
                                                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                                )}
                                            >
                                                <span className="font-medium text-sm">{label}</span>
                                                <div
                                                    className={cn(
                                                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                        selectedPermissions?.includes(value)
                                                            ? "border-violet-600 bg-violet-600"
                                                            : "border-zinc-300"
                                                    )}
                                                >
                                                    {selectedPermissions?.includes(value) && (
                                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                {errors.permissions && (
                                    <p className="text-xs text-red-500">{errors.permissions.message}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 bg-zinc-50/50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                            disabled={currentStep === 1}
                            className="gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
                                disabled={!canProceed()}
                                className="gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={createStaff.isPending || selectedPermissions?.length === 0}
                                className="gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                {createStaff.isPending ? 'Adding...' : 'Add Team Member'}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
