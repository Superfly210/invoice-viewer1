import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppRole = 'admin' | 'user' | 'submitter';

export const useRoleManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const grantRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profiles'] });
      toast({
        title: "Role granted",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error granting role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_profiles'] });
      toast({
        title: "Role revoked",
        description: "User role has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error revoking role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    grantRole: grantRole.mutate,
    revokeRole: revokeRole.mutate,
    isGranting: grantRole.isPending,
    isRevoking: revokeRole.isPending,
  };
};
