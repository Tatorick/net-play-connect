import {
  BarChart3,
  Calendar,
  Home,
  Settings,
  Trophy,
  Users,
  UserCheck,
  Shield,
  MessageSquare,
  Target,
  Building,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";


const getNavigationItems = (role: string) => {
  const baseItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
  ];

  switch (role) {
    case "admin":
      return [
        ...baseItems,
        { title: "Panel Admin", url: "/admin", icon: Shield },
        { title: "Solicitudes", url: "/admin/coach-requests", icon: Users },
        { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
        { title: "Settings", url: "/admin/settings", icon: Settings },
      ];
    case "coach":
    case "coach_main":
    case "coach_team":
      return [
        ...baseItems,
        { title: "Mi Club", url: "/coach/club", icon: Building },
        { title: "Jugadores", url: "/coach/players", icon: Users },
        { title: "Equipos", url: "/coach/teams", icon: Trophy },
        { title: "Partidos", url: "/coach/matches", icon: Target },
        { title: "Estadísticas", url: "/coach/statistics", icon: BarChart3 },
        { title: "Calendario", url: "/coach/calendar", icon: Calendar },
        { title: "Mensajes", url: "/coach/messages", icon: MessageSquare },
      ];
    
    case "player":
      return [
        ...baseItems,
        { title: "My Team", url: "/player/team", icon: Users },
        { title: "Training", url: "/player/training", icon: Calendar },
        { title: "My Stats", url: "/player/statistics", icon: BarChart3 },
        { title: "Tournaments", url: "/player/tournaments", icon: Trophy },
        { title: "Messages", url: "/player/messages", icon: MessageSquare },
      ];
    
    case "parent":
      return [
        ...baseItems,
        { title: "My Children", url: "/parent/children", icon: UserCheck },
        { title: "Schedule", url: "/parent/schedule", icon: Calendar },
        { title: "Progress", url: "/parent/progress", icon: BarChart3 },
        { title: "Messages", url: "/parent/messages", icon: MessageSquare },
      ];
    
    default:
      return baseItems;
  }
};

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const { profile } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const userRole = profile?.role || "player";
  const navigationItems = getNavigationItems(userRole);

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-accent/50 hover:text-accent-foreground";

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={open ? "" : "sr-only"}>
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavClass}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}