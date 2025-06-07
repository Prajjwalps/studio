
"use client";
import { useAppData } from "@/contexts/AppDataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const statusIcons = {
  Pending: <Hourglass className="h-4 w-4 text-yellow-500" />,
  Accepted: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  Completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  Rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

export function RecentTransfers() {
  const { transferRequests, getLocationNameById } = useAppData();
  const recentRequests = transferRequests.slice(0, 10); // Display latest 10

  return (
    <Card className="shadow-lg col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Recent Transfers</CardTitle>
        <CardDescription>Overview of the latest laptop movements and requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {recentRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent transfers.</p>
          ) : (
            <ul className="space-y-4">
              {recentRequests.map((request) => (
                <li key={request.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">
                        {request.modelNumber} (SN: {request.serialNumber})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        From: {getLocationNameById(request.fromLocation)} <ArrowRightLeft className="inline h-3 w-3 mx-1" /> To: {getLocationNameById(request.toLocation)}
                      </p>
                       <p className="text-xs text-muted-foreground">
                        Requested: {formatDistanceToNow(new Date(request.requestTimestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcons[request.status]}
                    <Badge variant={
                      request.status === 'Pending' ? 'outline' : 
                      request.status === 'Accepted' || request.status === 'Completed' ? 'default' : 
                      'destructive'
                    } className="text-xs capitalize w-20 text-center justify-center py-1">
                      {request.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
