import { useState, useEffect } from 'react';
import { UserRole } from '@/enum/role.enum';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
          setError(t('users.editUserRoles.atLeastOneRole'));
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
      setError(t('users.editUserRoles.atLeastOneRole'));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(userId, selectedRoles);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.editUserRoles.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('users.editUserRoles.title')}</DialogTitle>
          <DialogDescription>
            {t('users.editUserRoles.description', { email: userEmail })}
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
                  {t(`roles.${role}`)}
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
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedRoles.length === 0}>
            {isSaving ? t('users.editUserRoles.saving') : t('users.editUserRoles.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

