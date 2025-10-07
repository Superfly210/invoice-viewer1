import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AppRole = 'admin' | 'user' | 'submitter';

interface RoleManagementDialogProps {
  userId: string;
  userName: string;
  currentRoles: AppRole[];
}

export const RoleManagementDialog = ({
  userId,
  userName,
  currentRoles,
}: RoleManagementDialogProps) => {
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: 'grant' | 'revoke';
    role: AppRole;
  } | null>(null);
  const { grantRole, revokeRole, isGranting, isRevoking } = useRoleManagement();

  const hasRole = (role: AppRole) => currentRoles.includes(role);

  const handleGrant = (role: AppRole) => {
    setConfirmAction({ action: 'grant', role });
  };

  const handleRevoke = (role: AppRole) => {
    setConfirmAction({ action: 'revoke', role });
  };

  const confirmRoleChange = () => {
    if (!confirmAction) return;
    
    if (confirmAction.action === 'grant') {
      grantRole({ userId, role: confirmAction.role });
    } else {
      revokeRole({ userId, role: confirmAction.role });
    }
    
    setConfirmAction(null);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Roles for {userName}</DialogTitle>
            <DialogDescription>
              Grant or revoke viewer and admin access for this user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Viewer Access</p>
                <p className="text-sm text-muted-foreground">
                  Can access the invoice viewer portal
                </p>
              </div>
              {hasRole('user') ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke('user')}
                  disabled={isRevoking}
                >
                  Revoke
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleGrant('user')}
                  disabled={isGranting}
                >
                  Grant
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Admin Access</p>
                <p className="text-sm text-muted-foreground">
                  Full access including user management
                </p>
              </div>
              {hasRole('admin') ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke('admin')}
                  disabled={isRevoking}
                >
                  Revoke
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleGrant('admin')}
                  disabled={isGranting}
                >
                  Grant
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.action === 'grant' ? 'grant' : 'revoke'}{' '}
              {confirmAction?.role === 'user' ? 'viewer' : 'admin'} access{' '}
              {confirmAction?.action === 'grant' ? 'to' : 'from'} {userName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
