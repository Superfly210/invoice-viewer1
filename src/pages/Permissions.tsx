
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleBadge } from "@/components/RoleBadge";
import { RoleManagementDialog } from "@/components/RoleManagementDialog";

type AppRole = 'admin' | 'user' | 'submitter';

type UserWithRoles = {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string;
  roles: AppRole[];
};

export default function Permissions() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['user_profiles'],
    queryFn: async () => {
      // Get all profiles with user roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username');
      
      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Combine data (we'll use username as email placeholder for now)
      const usersWithRoles: UserWithRoles[] = profiles.map(profile => {
        const roles = (userRoles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole);
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          email: profile.username ? `${profile.username}@example.com` : 'N/A',
          roles,
        };
      });

      return usersWithRoles;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">User Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Manage user roles and access levels
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name || 'N/A'}</TableCell>
              <TableCell>{user.username || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {user.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <RoleManagementDialog
                  userId={user.id}
                  userName={user.full_name || user.username || user.email}
                  currentRoles={user.roles}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
