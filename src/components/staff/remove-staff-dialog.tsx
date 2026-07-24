'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { StaffMember } from '@/types/staff';
import { Loader2 } from 'lucide-react';

interface RemoveStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: StaffMember | null;
    isRemoving?: boolean;
    onConfirm: () => void;
}

export function RemoveStaffDialog({
    open,
    onOpenChange,
    staff,
    isRemoving = false,
    onConfirm,
}: RemoveStaffDialogProps) {
    const name = staff
        ? `${staff.firstName} ${staff.lastName}`.trim() || staff.email
        : 'this staff member';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove team member?</DialogTitle>
                    <DialogDescription>
                        This will permanently remove <span className="font-medium text-zinc-800">{name}</span> from
                        your staff. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isRemoving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isRemoving || !staff}
                    >
                        {isRemoving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing…
                            </>
                        ) : (
                            'Remove'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
