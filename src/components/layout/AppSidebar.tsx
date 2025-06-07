
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Send,
  Download,
  History,
  Warehouse,
  Store as StoreIcon,
  Settings,
  Laptop,
  Users,
  UserCheck,
  Building,
  PackagePlus,
  LayoutDashboard
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/contexts/AppDataContext";
import type { UserRole } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[]; // Roles that can see this item
}

const allNavItems: NavItem[] = [
  // Admin specific
  { href: "/", label: "Admin Dashboard", icon: LayoutDashboard, roles: ['admin'] },
  { href: "/stores", label: "Manage Stores", icon: Building, roles: ['admin'] },
  // Distributor specific
  { href: "/distributor", label: "Distributor Dashboard", icon: LayoutDashboard, roles: ['distributor'] },
  { href: "/distributor/add-inventory", label: "Add New Stock", icon: PackagePlus, roles: ['distributor'] }, // Placeholder for future QR page
  // Store Owner specific
  { href: "/store-user", label: "Store Dashboard", icon: LayoutDashboard, roles: ['store-owner'] },
  // Shared or general
  { href: "/transfer", label: "Transfer Laptop", icon: Send, roles: ['admin', 'distributor'] },
  { href: "/receive", label: "Receive Laptop", icon: Download, roles: ['admin', 'store-owner'] },
  { href: "/history", label: "Transfer History", icon: History, roles: ['admin', 'distributor', 'store-owner'] },
  { href: "/inventory", label: "Laptop Inventory", icon: Laptop, roles: ['admin', 'distributor', 'store-owner'] },
  { href: "/warehouse", label: "Warehouse View", icon: Warehouse, roles: ['admin', 'distributor'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser } = useAppData();

  const getRoleIcon = (role: UserRole | undefined) => {
    if (role === 'admin') return Users;
    if (role === 'distributor') return UserCheck;
    if (role === 'store-owner') return StoreIcon;
    return Home; // Default
  };

  const MainDashboardIcon = getRoleIcon(currentUser?.role);

  const getFilteredNavItems = () => {
    if (!currentUser) return [];
    
    let dashboardLink: NavItem = { href: "/", label: "Dashboard", icon: MainDashboardIcon, roles: [currentUser.role] };
    if (currentUser.role === 'distributor') {
        dashboardLink = { href: "/distributor", label: "My Dashboard", icon: MainDashboardIcon, roles: ['distributor']};
    } else if (currentUser.role === 'store-owner') {
        dashboardLink = { href: "/store-user", label: "My Dashboard", icon: MainDashboardIcon, roles: ['store-owner']};
    } else if (currentUser.role === 'admin') {
         dashboardLink = { href: "/", label: "Admin Dashboard", icon: MainDashboardIcon, roles: ['admin']};
    }


    const primaryNav = allNavItems.filter(item => 
        item.roles.includes(currentUser.role) && 
        (item.href === dashboardLink.href || // include the specific dashboard link
         !item.href.endsWith("board")) // include others that are not dashboards (or refine this logic)
    ).filter(item => item.href !== dashboardLink.href); // remove duplicates if any general dashboard matched

    const managementNav = allNavItems.filter(item => 
      item.roles.includes(currentUser.role) &&
      (item.href === '/inventory' || item.href === '/stores' || item.href === '/warehouse') &&
      item.href !== dashboardLink.href // Ensure it's not the main dashboard link again
    );
    
    // Filter out items that are already in dashboardLink or primaryNav from managementNav
    const uniqueManagementNav = managementNav.filter(mItem => 
        mItem.href !== dashboardLink.href && !primaryNav.find(pItem => pItem.href === mItem.href)
    );

    return {
        dashboardLink,
        primaryNav: allNavItems.filter(item => item.roles.includes(currentUser.role) && item.label !== dashboardLink.label && !uniqueManagementNav.find(m => m.href === item.href)),
        managementNav: uniqueManagementNav
    };
  };

  const { dashboardLink, primaryNav, managementNav } = getFilteredNavItems();
  
  if (!currentUser) {
    return null; // Sidebar shouldn't render if no user or on login page (handled by AuthGuard)
  }

  const displayedPrimaryNav = primaryNav.filter(item => 
    item.label !== "Admin Dashboard" && 
    item.label !== "Distributor Dashboard" && 
    item.label !== "Store Dashboard" &&
    !managementNav.some(m => m.href === item.href) // ensure no overlap with managementNav
  );


  return (
    <Sidebar collapsible="icon" defaultOpen={true} className="border-r">
      <SidebarHeader className="p-4 flex items-center justify-between">
        <Link href={dashboardLink?.href || "/"} className="flex items-center gap-2 flex-grow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-sidebar-primary">
             <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
            <line x1="6" y1="11" x2="6" y2="11"></line>
            <line x1="10" y1="11" x2="10" y2="11"></line>
          </svg>
          <span className="text-lg font-semibold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">Laptop Trackr</span>
        </Link>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden text-sidebar-foreground hover:text-sidebar-accent-foreground" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        {dashboardLink && (
            <SidebarMenu>
                 <SidebarMenuItem key={dashboardLink.href}>
                    <Link href={dashboardLink.href} passHref legacyBehavior>
                        <SidebarMenuButton
                        isActive={pathname === dashboardLink.href}
                        tooltip={dashboardLink.label}
                        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                        >
                        <dashboardLink.icon className="h-5 w-5" />
                        <span>{dashboardLink.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        )}
        
        <SidebarMenu className="mt-2">
          {displayedPrimaryNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && item.href !== '/'}
                  tooltip={item.label}
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {managementNav.length > 0 && (
          <SidebarGroup className="mt-4">
             <SidebarGroupLabel className="text-sidebar-foreground/70">Management</SidebarGroupLabel>
             <SidebarMenu>
              {managementNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4">
         <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            <Settings className="h-5 w-5" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
