
"use client";
import { useAppData } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Laptop } from "lucide-react";
import type { Laptop as LaptopType } from "@/lib/types";
import { WAREHOUSE_ID } from "@/lib/constants";
import { useSearchParams } from 'next/navigation';
import React from "react";

const statusColors: { [key: string]: string } = {
  'In Warehouse': 'bg-blue-100 text-blue-700 border-blue-300',
  'In Store': 'bg-green-100 text-green-700 border-green-300',
  'In Transit': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Received': 'bg-teal-100 text-teal-700 border-teal-300',
};


export default function InventoryPage() {
  const { laptops, getLocationNameById, currentUser } = useAppData();
  const searchParams = useSearchParams();
  const storeIdQuery = searchParams.get('storeId');

  let displayedLaptops = laptops;
  let pageTitle = "Laptop Inventory";
  let pageDescription = "Overview of all laptops in the system, their status, and location.";

  if (currentUser?.role === 'store-owner' && currentUser.storeId) {
    // If store owner, always filter by their storeId, ignore query param for security/simplicity
    displayedLaptops = laptops.filter(laptop => laptop.currentLocation === currentUser.storeId);
    pageTitle = `${getLocationNameById(currentUser.storeId)} Inventory`;
    pageDescription = `Laptops currently at ${getLocationNameById(currentUser.storeId)}.`;
  } else if (storeIdQuery) {
    // For admins/distributors, allow filtering by storeId via query param
    displayedLaptops = laptops.filter(laptop => laptop.currentLocation === storeIdQuery);
    pageTitle = `${getLocationNameById(storeIdQuery)} Inventory`;
    pageDescription = `Laptops currently at ${getLocationNameById(storeIdQuery)}.`;
  }


  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
        <Laptop className="h-8 w-8" /> {pageTitle}
      </h1>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Laptops ({displayedLaptops.length})</CardTitle>
          <CardDescription>{pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {displayedLaptops.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No laptops match the current filter.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Model Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedLaptops.map((laptop: LaptopType) => (
                  <TableRow key={laptop.id}>
                    <TableCell className="font-medium">{laptop.serialNumber}</TableCell>
                    <TableCell>{laptop.modelNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${statusColors[laptop.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                        {laptop.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getLocationNameById(laptop.currentLocation)}</TableCell>
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
