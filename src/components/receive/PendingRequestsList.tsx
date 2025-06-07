
"use client";
import { useAppData } from "@/contexts/AppDataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, Hourglass, Truck } from "lucide-react";
import { format } from 'date-fns';
import type { TransferRequest } from "@/lib/types";

export function PendingRequestsList() {
  const { transferRequests, updateTransferStatus, getLocationNameById } = useAppData();
  // In a real app, filter for requests where current user's store is the destination
  // For demo, we show all pending requests.
  const pending = transferRequests.filter(req => req.status === 'Pending');

  const handleAction = (requestId: string, action: 'Accepted' | 'Rejected') => {
    updateTransferStatus(requestId, action, "Current Manager (Demo)");
  };

  if (pending.length === 0) {
    return (
       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Hourglass /> No Pending Transfers</CardTitle>
            <CardDescription>There are no incoming laptops awaiting your confirmation at this time.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-8">
                <Truck className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-lg text-muted-foreground">All clear!</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Incoming Laptop Transfers</CardTitle>
        <CardDescription>Review and confirm receipt of laptops transferred to your location.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial No.</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((request: TransferRequest) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.serialNumber}</TableCell>
                <TableCell>{request.modelNumber}</TableCell>
                <TableCell>{getLocationNameById(request.fromLocation)}</TableCell>
                <TableCell>{format(new Date(request.requestTimestamp), 'MMM d, yyyy HH:mm')}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="capitalize border-yellow-500 text-yellow-600">
                    <Hourglass className="mr-1 h-3 w-3" />
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAction(request.id, 'Accepted')}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Accept
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleAction(request.id, 'Rejected')}
                  >
                    <XCircle className="mr-1 h-4 w-4" /> Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
