
"use client";
import Link from "next/link";
import { Bell, UserCircle, Menu, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppData } from "@/contexts/AppDataContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const { getNotifications, markNotificationAsRead, currentUser, logout } = useAppData();
  const unreadNotifications = getNotifications(false).filter(n => !n.read);
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {isMobile && (
         <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
           <Menu className="h-6 w-6" />
           <span className="sr-only">Toggle Sidebar</span>
         </Button>
      )}
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
            <line x1="6" y1="11" x2="6" y2="11"></line>
            <line x1="10" y1="11" x2="10" y2="11"></line>
          </svg>
          <span className="text-xl font-semibold font-headline">Laptop Trackr</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 min-w-0 p-0 flex items-center justify-center text-xs">
                    {unreadNotifications.length}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {unreadNotifications.length > 0 && <Badge variant="secondary">{unreadNotifications.length} New</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {getNotifications().length === 0 ? (
                  <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
                ) : (
                  getNotifications().map((notif) => (
                    <DropdownMenuItem key={notif.id} onClick={() => markNotificationAsRead(notif.id)} className={`flex flex-col items-start gap-1 whitespace-normal ${!notif.read ? 'bg-accent/10' : ''}`}>
                      <p className="text-sm font-medium">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                      </p>
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <UserCircle className="h-6 w-6" />
                <span className="text-sm font-medium hidden md:inline">{currentUser.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account ({currentUser.role})</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile (Soon)</DropdownMenuItem>
              <DropdownMenuItem>Settings (Soon)</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => router.push('/login')} variant="outline">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
