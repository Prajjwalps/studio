
"use client";
import React, { useEffect } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageSearch, CheckCircle, ListChecks, Hourglass, UserCheck, ShieldAlert, Store as StoreIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function StoreUserDashboardPage() {
  const { currentUser, stores, laptops } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'store-owner') {
      if (currentUser.role === 'admin') router.replace('/');
      else if (currentUser.role === 'distributor') router.replace('/distributor');
      else router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'store-owner') {
    return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <Hourglass className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading store dashboard...</p>
      </div>
    );
  }

  const myStore = stores.find(s => s.id === currentUser.storeId);
  const myStoreLaptops = laptops.filter(l => l.currentLocation === currentUser.storeId && (l.status === 'In Store' || l.status === 'Received')).length;
  const pendingReceipts = laptops.filter(l => l.currentLocation === currentUser.storeId && l.status === 'In Transit').length;


  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline text-primary">
          {myStore ? `${myStore.name} Dashboard` : 'Store Dashboard'}
        </h1>
        <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
            <UserCheck className="h-4 w-4" /> Role: {currentUser.role}
        </Badge>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {currentUser.name}!</CardTitle>
          <CardDescription>Manage your store's inventory and incoming transfers.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild variant="default" size="lg" className="justify-start text-base py-8">
            <Link href="/receive">
              <CheckCircle className="mr-3 h-6 w-6" /> Confirm Laptop Receipts ({pendingReceipts})
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-8">
             <Link href={`/inventory?storeId=${currentUser.storeId}`}> {/* We'll need to update inventory page to filter by store */}
              <PackageSearch className="mr-3 h-6 w-6" /> View My Store Inventory ({myStoreLaptops})
            </Link>
          </Button>
        </CardContent>
      </Card>
       <Card className="bg-secondary/30 border-secondary">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-primary"/>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/history"><History className="mr-2"/> My Transfer History</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

