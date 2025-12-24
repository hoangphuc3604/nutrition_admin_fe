import { useState, useEffect } from 'react';
import { UserRole, RoleLabels } from '@/enum/role.enum';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EditUserRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  currentRoles: UserRole[];
  onSave: (userId: string, roles: UserRole[]) => Promise<void>;
}

export function EditUserRolesDialog({
  open,
  onOpenChange,
  userId,
  userEmail,
  currentRoles,
  onSave,
}: EditUserRolesDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(currentRoles);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedRoles(currentRoles);
      setError(null);
    }
  }, [open, currentRoles]);

  const availableRoles = [UserRole.ADMIN, UserRole.USER];

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        // Nếu bỏ chọn role, đảm bảo còn ít nhất 1 role
        const newRoles = prev.filter((r) => r !== role);
        if (newRoles.length === 0) {
          setError('User must have at least one role');
          return prev;
        }
        setError(null);
        return newRoles;
      } else {
        setError(null);
        return [...prev, role];
      }
    });
  };

  const handleSave = async () => {
    if (selectedRoles.length === 0) {
      setError('User must have at least one role');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(userId, selectedRoles);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user roles');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Roles</DialogTitle>
          <DialogDescription>
            Update roles for <span className="font-medium">{userEmail}</span>. 
            User must have at least one role.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {availableRoles.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleToggle(role)}
                  disabled={selectedRoles.length === 1 && selectedRoles.includes(role)}
                />
                <Label
                  htmlFor={role}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {RoleLabels[role]}
                </Label>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedRoles.length === 0}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

