import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Bus, MapPin, Truck, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Bookings", url: "/admin/bookings", icon: BookOpen },
  { title: "Trips", url: "/admin/trips", icon: Bus },
  { title: "Routes", url: "/admin/routes", icon: MapPin },
  { title: "Vehicles", url: "/admin/vehicles", icon: Truck },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup defaultOpen>
          <SidebarGroupLabel>
            {!collapsed && "ShuttleGo Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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

export default function AdminLayout() {
  const location = useLocation();
  const current = navItems.find(
    (n) => n.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(n.url)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">{current?.title ?? "Admin"}</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
