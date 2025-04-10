
import { useState } from "react";
import { FileCheck, FileText, FilePieChart, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { label: "Invoice Signer", icon: FileCheck, active: false },
    { label: "Invoice Reviewer", icon: FileText, active: true },
    { label: "Invoice Summary", icon: FilePieChart, active: false },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col h-screen relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        {!collapsed && (
          <h2 className="font-bold text-slate-800 text-lg">Invoice Viewer</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-slate-500" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                className={cn(
                  "flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 transition-colors",
                  item.active && "bg-blue-50 border-l-4 border-blue-500 font-semibold text-blue-700"
                )}
              >
                <item.icon className={cn("h-5 w-5", item.active ? "text-blue-600" : "text-slate-500")} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        {!collapsed && (
          <div className="text-xs text-slate-500">
            Invoice Viewer v1.0
          </div>
        )}
      </div>
    </aside>
  );
};
