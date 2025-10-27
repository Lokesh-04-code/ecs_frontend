import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  MessageSquare, // ✅ new icon for AI Chat
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const { setTheme, theme } = useTheme();

  // ✅ Added AI Chat to the navigation list
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Alerts", href: "/alerts", icon: AlertTriangle },
    { name: "AI Report", href: "/aichat", icon: MessageSquare }, // ✅ added AI Chat
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-sidebar to-sidebar/80 backdrop-blur-sm border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">IoT Monitor</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Switcher */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              {theme === "light" && <Sun className="h-4 w-4 mr-2" />}
              {theme === "dark" && <Moon className="h-4 w-4 mr-2" />}
              {theme === "system" && <Monitor className="h-4 w-4 mr-2" />}
              Theme
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="h-4 w-4 mr-2" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout */}
      <div className="p-4">
        <Button
          onClick={logout}
          variant="destructive"
          size="sm"
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
