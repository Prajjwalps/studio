
"use client";
import { useAppData } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Hourglass, History as HistoryIcon } from "lucide-react";
import type { TransferRequest } from "@/lib/types";

const statusStyles = {
  Pending: "border-yellow-500 text-yellow-600",
  Accepted: "border-green-500 text-green-600 bg-green-50",
  Completed: "border-green-500 text-green-600 bg-green-50",
  Rejected: "border-red-500 text-red-600 bg-red-50",
};

const statusIcons = {
  Pending: <Hourglass className="mr-1 h-3 w-3" />,
  Accepted: <CheckCircle2 className="mr-1 h-3 w-3" />,
  Completed: <CheckCircle2 className="mr-1 h-3 w-3" />,
  Rejected: <XCircle className="mr-1 h-3 w-3" />,
};

export function TransferHistoryTable() {
  const { transferRequests, getLocationNameById } = useAppData();

  if (transferRequests.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><HistoryIcon /> No Transfer History</CardTitle>
          <CardDescription>There are no transfer records available yet.</CardDescription>
        </CardHeader>
         <CardContent>
            <div className="text-center py-8">
                <HistoryIcon className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-lg text-muted-foreground">Start a transfer to see history here.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Transfer Request History</CardTitle>
        <CardDescription>A log of all past and current laptop transfer requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Serial No.</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Last Action</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transferRequests.map((request: TransferRequest) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-xs">{request.id}</TableCell>
                <TableCell className="font-medium">{request.serialNumber}</TableCell>
                <TableCell>{request.modelNumber}</TableCell>
                <TableCell>{getLocationNameById(request.fromLocation)}</TableCell>
                <TableCell>{getLocationNameById(request.toLocation)}</TableCell>
                <TableCell>{format(new Date(request.requestTimestamp), 'MMM d, yyyy HH:mm')}</TableCell>
                <TableCell>
                  {request.actionTimestamp ? format(new Date(request.actionTimestamp), 'MMM d, yyyy HH:mm') : '-'}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`capitalize ${statusStyles[request.status]}`}>
                    {statusIcons[request.status]}
                    {request.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
