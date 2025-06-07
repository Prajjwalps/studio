
"use client";
import { useAppData } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Warehouse as WarehouseIcon } from "lucide-react";
import type { Laptop as LaptopType } from "@/lib/types";
import { WAREHOUSE_ID, WAREHOUSE_NAME } from "@/lib/constants";

const statusColors: { [key: string]: string } = {
  'In Warehouse': 'bg-blue-100 text-blue-700 border-blue-300',
  'In Store': 'bg-green-100 text-green-700 border-green-300',
  'In Transit': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Received': 'bg-teal-100 text-teal-700 border-teal-300',
};

export default function WarehousePage() {
  const { laptops } = useAppData();
  const warehouseLaptops = laptops.filter(laptop => laptop.currentLocation === WAREHOUSE_ID);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
        <WarehouseIcon className="h-8 w-8" /> {WAREHOUSE_NAME} View
      </h1>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Laptops in Warehouse ({warehouseLaptops.filter(l => l.status === 'In Warehouse').length})</CardTitle>
          <CardDescription>Current inventory within the main warehouse.</CardDescription>
        </CardHeader>
        <CardContent>
          {warehouseLaptops.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Warehouse is empty.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Model Number</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseLaptops.map((laptop: LaptopType) => (
                  <TableRow key={laptop.id}>
                    <TableCell className="font-medium">{laptop.serialNumber}</TableCell>
                    <TableCell>{laptop.modelNumber}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className={`capitalize ${statusColors[laptop.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                        {laptop.status}
                      </Badge>
                    </TableCell>
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
