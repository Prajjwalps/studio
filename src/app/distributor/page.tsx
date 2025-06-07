
"use client";
import React, { useEffect } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, PackagePlus, ListChecks, Hourglass, UserCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DistributorDashboardPage() {
  const { currentUser } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.role !== 'distributor') {
      // If not a distributor, redirect to their appropriate dashboard or login
      if (currentUser.role === 'admin') router.replace('/');
      else if (currentUser.role === 'store-owner') router.replace('/store-user');
      else router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'distributor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <Hourglass className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading distributor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline text-primary">Distributor Dashboard</h1>
        <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
            <UserCheck className="h-4 w-4" /> Role: {currentUser.role}
        </Badge>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {currentUser.name}!</CardTitle>
          <CardDescription>Manage incoming inventory and distributions.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild variant="default" size="lg" className="justify-start text-base py-8">
            <Link href="/distributor/add-inventory">
              <PackagePlus className="mr-3 h-6 w-6" /> Add New Inventory (QR Scan Soon)
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="justify-start text-base py-8">
            <Link href="/transfer">
              <ListChecks className="mr-3 h-6 w-6" /> Initiate Transfers to Stores
            </Link>
          </Button>
           <Button asChild variant="outline" size="lg" className="justify-start text-base py-8 col-span-1 md:col-span-2">
            <Link href="/inventory">
              <QrCode className="mr-3 h-6 w-6" /> View Full Inventory
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-secondary/30 border-secondary">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-primary"/>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/history"><History className="mr-2"/> Transfer History</Link></Button>
            <Button asChild variant="outline" size="lg" className="justify-start text-base py-6"><Link href="/warehouse"><Warehouse className="mr-2"/> Warehouse Stock</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
