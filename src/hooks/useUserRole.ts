import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(r => r.role);
    },
    enabled: !!user?.id,
  });

  return {
    roles: roles || [],
    isLoading,
    hasSubmitterRole: roles?.includes('submitter') || false,
    hasUserRole: roles?.includes('user') || false,
    hasAdminRole: roles?.includes('admin') || false,
    hasViewerAccess: roles?.includes('user') || roles?.includes('admin') || false,
  };
};
