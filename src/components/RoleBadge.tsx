import { Badge } from "@/components/ui/badge";

type AppRole = 'admin' | 'user' | 'submitter';

interface RoleBadgeProps {
  role: AppRole;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const variants = {
    admin: { variant: "destructive" as const, label: "Admin" },
    user: { variant: "default" as const, label: "Viewer" },
    submitter: { variant: "secondary" as const, label: "Submitter" },
  };

  const config = variants[role];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};
