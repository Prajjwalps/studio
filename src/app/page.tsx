
"use client";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTransfers } from "@/components/dashboard/RecentTransfers";
import { useAppData } from "@/contexts/AppDataContext";
import { Laptop, Warehouse, Store, Hourglass, Users, ShieldAlert } from "lucide-react";
import { WAREHOUSE_ID } from "@/lib/constants";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { laptops, stores, transferRequests, currentUser } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'distributor') {
        router.replace('/distributor');
      } else if (currentUser.role === 'store-owner') {
        router.replace('/store-user');
      }
      // If 'admin', stay on this page
    }
    // If !currentUser, AuthGuard in layout handles redirect to /login
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') {
    // Show a loading or minimal state while redirecting or if not admin
    // This helps prevent flicker of admin content for non-admin users
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
            <Hourglass className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading user dashboard...</p>
        </div>
    );
  }

  // Admin Dashboard Content
  const laptopsInWarehouse = laptops.filter(l => l.currentLocation === WAREHOUSE_ID && l.status === 'In Warehouse').length;
  const laptopsInStores = laptops.filter(l => l.currentLocation !== WAREHOUSE_ID && (l.status === 'In Store' || l.status === 'Received')).length;
  const pendingTransfers = transferRequests.filter(req => req.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline text-primary">Admin Dashboard</h1>
        <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
            <Users className="h-4 w-4" /> Role: {currentUser.role}
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Laptops" 
          value={laptops.length} 
          icon={Laptop} 
          description="All laptops in inventory"
        />
        <StatCard 
          title="Laptops in Warehouse" 
          value={laptopsInWarehouse} 
          icon={Warehouse} 
          description="Currently in main warehouse"
        />
        <StatCard 
          title="Laptops in Stores" 
          value={laptopsInStores} 
          icon={Store} 
          description={`Across ${stores.length} stores`}
        />
        <StatCard 
          title="Pending Transfers" 
          value={pendingTransfers} 
          icon={Hourglass} 
          description="Awaiting approval"
        />
      </div>

      <RecentTransfers />
      
      <Card className="bg-secondary/30 border-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-primary"/>Admin Tools</CardTitle>
          <CardDescription>Quick access to management sections.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/inventory"><Laptop className="mr-2"/> Laptop Inventory</Link></Button>
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/stores"><Store className="mr-2"/> Manage Stores</Link></Button>
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/warehouse"><Warehouse className="mr-2"/> Warehouse View</Link></Button>
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/transfer"><Send className="mr-2"/> New Transfer</Link></Button>
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/receive"><Download className="mr-2"/> Process Receipts</Link></Button>
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/history"><History className="mr-2"/> Transfer History</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
