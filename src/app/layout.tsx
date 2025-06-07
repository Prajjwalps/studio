
"use client";
import type { Metadata } from 'next'; // Keep for static metadata generation if needed later
import './globals.css';
import { AppDataProvider, useAppData } from '@/contexts/AppDataContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Progress } from '@/components/ui/progress'; // For loading state

// Static metadata (can be uncommented if needed, but dynamic title might be better)
// export const metadata: Metadata = {
// title: 'Laptop Trackr',
// description: 'Track laptop inventory and movements effortlessly.',
// };

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAppData();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Check if currentUser is loaded from localStorage (AppDataContext handles this)
    // Give a brief moment for AppDataContext to initialize currentUser from localStorage
    const timer = setTimeout(() => {
      if (!currentUser && pathname !== '/login') {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }, 100); // Adjust delay if needed, allows context to populate

    return () => clearTimeout(timer);
  }, [currentUser, pathname, router]);
  
  // If loading currentUser or already on login page, don't show main layout yet or content
  if ((isLoading && pathname !== '/login') || (!currentUser && pathname !== '/login')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary animate-pulse mb-4">
          <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
          <line x1="6" y1="11" x2="6" y2="11"></line>
          <line x1="10" y1="11" x2="10" y2="11"></line>
        </svg>
        <Progress value={50} className="w-1/4 transition-all duration-500 ease-in-out" />
        <p className="text-muted-foreground mt-2">Loading application...</p>
      </div>
    );
  }
  
  // If on login page, don't render the main app shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader />
          <SidebarInset>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Laptop Trackr</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppDataProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}
