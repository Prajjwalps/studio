
"use client";
import { useAppData } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store as StoreIcon, User } from "lucide-react";
import type { Store } from "@/lib/types";

export default function StoresPage() {
  const { stores, laptops } = useAppData();

  const getStoreLaptopCount = (storeId: string) => {
    return laptops.filter(laptop => laptop.currentLocation === storeId && (laptop.status === 'In Store' || laptop.status === 'Received')).length;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
        <StoreIcon className="h-8 w-8" /> Manage Stores
      </h1>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Stores ({stores.length})</CardTitle>
          <CardDescription>List of all distributor stores and their managers.</CardDescription>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No stores configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store ID</TableHead>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Laptops in Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store: Store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-mono text-xs">{store.id}</TableCell>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" /> {store.manager}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{getStoreLaptopCount(store.id)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
