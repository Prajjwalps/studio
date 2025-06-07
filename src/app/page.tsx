
"use client";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentTransfers } from "@/components/dashboard/RecentTransfers";
import { useAppData } from "@/contexts/AppDataContext";
import { Laptop, Warehouse, Store, Hourglass } from "lucide-react";
import { WAREHOUSE_ID } from "@/lib/constants";

export default function DashboardPage() {
  const { laptops, stores, transferRequests } = useAppData();

  const laptopsInWarehouse = laptops.filter(l => l.currentLocation === WAREHOUSE_ID && l.status === 'In Warehouse').length;
  const laptopsInStores = laptops.filter(l => l.currentLocation !== WAREHOUSE_ID && (l.status === 'In Store' || l.status === 'Received')).length;
  const pendingTransfers = transferRequests.filter(req => req.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline text-primary">Dashboard</h1>
      
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
      
      {/* Placeholder for more dashboard components */}
      {/* 
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild><Link href="/transfer">New Transfer Request</Link></Button>
            <Button asChild variant="outline"><Link href="/receive">Process Incoming Laptops</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">All systems operational.</p>
          </CardContent>
        </Card>
      </div>
      */}
    </div>
  );
}
