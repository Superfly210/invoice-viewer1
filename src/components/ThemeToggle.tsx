
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Toggle } from "./ui/toggle";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-2">
      {theme === "dark" ? (
        <Toggle pressed aria-label="Switch to light mode" onClick={toggleTheme} size="sm">
          <SunIcon className="h-4 w-4" />
          <span className="ml-2">Light Mode</span>
        </Toggle>
      ) : (
        <Toggle aria-label="Switch to dark mode" onClick={toggleTheme} size="sm">
          <MoonIcon className="h-4 w-4" />
          <span className="ml-2">Dark Mode</span>
        </Toggle>
      )}
    </div>
  );
}
