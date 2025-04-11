
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Switch } from "./ui/switch";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-2">
      <SunIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      <Switch 
        checked={theme === "dark"} 
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <MoonIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
    </div>
  );
}
