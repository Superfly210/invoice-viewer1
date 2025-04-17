
import { useState } from "react";
import { 
  FileCheck, FileText, FilePieChart, ChevronLeft, ChevronRight,
  UserCog, Settings, Shield, PauseCircle, FileSpreadsheet, Building, Table as TableIcon,
  Sun, Moon // Import the correct icons from lucide-react
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useTheme } from "./ThemeProvider";

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
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const [adminOpen, setAdminOpen] = useState(false);

  const menuItems = [
    { id: "signer", label: "Invoice Signer", icon: FileCheck, active: activeSection === "signer" },
    { id: "reviewer", label: "Invoice Reviewer", icon: FileText, active: activeSection === "reviewer" },
    { id: "summary", label: "Invoice Summary", icon: FilePieChart, active: activeSection === "summary" },
    { id: "afe", label: "AFE", icon: FileSpreadsheet, active: activeSection === "afe" },
  ];

  const adminMenuItems = [
    { id: "cost-centers", label: "Cost Centers", icon: Building, active: activeSection === "cost-centers" },
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
                  "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 font-semibold text-blue-700 dark:text-blue-400"
                )}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5", 
                    item.active 
                      ? "text-blue-600 dark:text-blue-400" 
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
                          item.active && "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
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
