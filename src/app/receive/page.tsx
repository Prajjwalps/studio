
"use client";
import { PendingRequestsList } from "@/components/receive/PendingRequestsList";
import { useAppData } from "@/contexts/AppDataContext";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Hourglass } from "lucide-react";

export default function ReceivePage() {
  const { currentUser } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && !(currentUser.role === 'admin' || currentUser.role === 'store-owner')) {
      // Redirect if not admin or store-owner
      if (currentUser.role === 'distributor') router.replace('/distributor');
      else router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser || !(currentUser.role === 'admin' || currentUser.role === 'store-owner')) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <Hourglass className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8 space-y-8">
      <PendingRequestsList />
      {/* 
      <Separator />
      <DirectReceiveForm /> 
      */}
    </div>
  );
}
