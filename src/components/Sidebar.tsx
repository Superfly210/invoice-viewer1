import { useState } from "react";
import { 
  FileCheck, FileText, FilePieChart, ChevronLeft, ChevronRight,
  UserCog, Settings, Shield, PauseCircle, FileSpreadsheet, Building, Table as TableIcon,
  Sun, Moon, Store, LogOut, Package, Calendar // Import LogOut icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
};

export const Sidebar = ({ 
  collapsed, 
  setCollapsed, 
  activeSection,
  onSectionChange 
}: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { hasAdminRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get user profile information
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single();
      
      return profile;
    },
    enabled: !!user?.id,
  });
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      });
    }
  };

  const [adminOpen, setAdminOpen] = useState(false);

  const displayName = userProfile?.full_name || userProfile?.username || user?.email || 'User';

  const menuItems = [
    { id: "signer", label: "Invoice Signer", icon: FileCheck, active: activeSection === "signer" },
    { id: "reviewer", label: "Invoice Reviewer", icon: FileText, active: activeSection === "reviewer" },
    { id: "summary", label: "Invoice Summary", icon: FilePieChart, active: activeSection === "summary" },
    { id: "afe", label: "AFE", icon: FileSpreadsheet, active: activeSection === "afe" },
    { id: "vendor", label: "Vendor", icon: Store, active: activeSection === "vendor" },
    { id: "inventory", label: "Inventory Tracker", icon: Package, active: activeSection === "inventory" },
    { id: "ops-daily", label: "Ops Daily", icon: Calendar, active: activeSection === "ops-daily" },
  ];

  const adminMenuItems = [
    { id: "cost-centers", label: "Cost Centers", icon: Building, active: activeSection === "cost-centers" },
    { id: "cost-codes", label: "Cost Codes", icon: TableIcon, active: activeSection === "cost-codes" },
    { id: "permissions", label: "Permissions", icon: Shield, active: activeSection === "permissions" },
  ];

  return (
    <aside
      className={cn(
        "transition-all duration-300 ease-in-out flex flex-col h-screen relative",
        "bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Invoice Viewer</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
                  item.active && 
                  "bg-[rgb(15,23,41)] !important text-white font-semibold"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5", 
                    item.active 
                      ? "text-white !important" 
                      : "text-slate-500 dark:text-slate-400"
                  )} 
                />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-slate-200 dark:border-slate-700">
        {hasAdminRole && (
          <>
            {!collapsed ? (
              <Collapsible
                open={adminOpen}
                onOpenChange={setAdminOpen}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <button
                    className="flex items-center w-full px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <UserCog className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <span className="ml-3 font-medium">Administrator</span>
                    <ChevronRight
                      className={cn(
                        "ml-auto h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform",
                        adminOpen && "rotate-90"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pl-6 pr-4 pb-2">
                    <ul className="space-y-1 pt-1">
                      {adminMenuItems.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => onSectionChange(item.id)}
                            className={cn(
                              "flex items-center w-full py-2 px-3 text-sm text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700",
                              item.active && "bg-[rgb(15,23,41)] !important text-white"
                            )}
                          >
                            <item.icon className={cn("h-4 w-4 mr-2", item.active ? "text-white !important" : "text-slate-500 dark:text-slate-400")} />
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <button
                className="w-full py-3 flex justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setCollapsed(false)}
                title="Administrator"
              >
                <UserCog className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </button>
            )}
          </>
        )}

        {/* User info and logout section */}
        <div className="border-t border-slate-200 dark:border-slate-700">
          {!collapsed && (
            <div className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <div className="truncate">{displayName}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
              collapsed ? "justify-center" : "justify-start"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>

        {/* Theme toggle section */}
        <div className={cn(
          "p-4 flex justify-center border-t border-slate-200 dark:border-slate-700",
          collapsed ? "px-2" : "px-4"
        )}>
          {collapsed ? (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              ) : (
                <Sun className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              )}
            </button>
          ) : (
            <ThemeToggle />
          )}
        </div>
      </div>
    </aside>
  );
};