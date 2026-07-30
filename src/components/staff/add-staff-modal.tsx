'use client';

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
import { cn } from '@/lib/utils';
import { useCreateStaffMember } from '@/hooks/use-staff';
import { Loader2 } from 'lucide-react';

/**
 * Matches POST /api/v1/users/profiles/create_staff/
 * Body: { email, password, role: "trainer"|"gym_manager", nickname }
 */
const staffFormSchema = z.object({
    nickname: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),
    role: z.enum(['trainer', 'manager']),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

interface AddStaffModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddStaffModal({ open, onOpenChange }: AddStaffModalProps) {
    const createStaff = useCreateStaffMember();

    const form = useForm<StaffFormData>({
        resolver: zodResolver(staffFormSchema),
        defaultValues: {
            nickname: '',
            email: '',
            password: '',
            role: 'trainer',
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = form;

    const onSubmit = async (data: StaffFormData) => {
        const nameParts = data.nickname.trim().split(/\s+/);
        const firstName = nameParts[0] || data.nickname;
        const lastName = nameParts.slice(1).join(' ') || '';

        try {
            await createStaff.mutateAsync({
                firstName,
                lastName,
                email: data.email,
                password: data.password,
                role: data.role,
            });
            onOpenChange(false);
            reset();
        } catch {
            // Toast handled in hook
        }
    };

    const handleClose = (nextOpen: boolean) => {
        if (!nextOpen) {
            reset();
        }
        onOpenChange(nextOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Invite a new staff member to your gym.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nickname">Name</Label>
                        <Input
                            id="nickname"
                            placeholder="Sarah Johnson"
                            autoComplete="name"
                            {...register('nickname')}
                            className={cn(errors.nickname && 'border-red-500')}
                        />
                        {errors.nickname && (
                            <p className="text-xs text-red-500">{errors.nickname.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="sarah@gym.com"
                            autoComplete="email"
                            {...register('email')}
                            className={cn(errors.email && 'border-red-500')}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            {...register('password')}
                            className={cn(errors.password && 'border-red-500')}
                        />
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                            value={watch('role')}
                            onValueChange={(value) =>
                                setValue('role', value as 'trainer' | 'manager', {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="trainer">Trainer</SelectItem>
                                <SelectItem value="manager">Gym Manager</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={createStaff.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createStaff.isPending}

                        >
                            {createStaff.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating…
                                </>
                            ) : (
                                'Add Team Member'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
