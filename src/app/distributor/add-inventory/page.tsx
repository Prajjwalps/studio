
"use client";
import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { QrCode, PackagePlus, AlertTriangle, Info, Hourglass } from "lucide-react";
import { useAppData } from '@/contexts/AppDataContext';
import { QrScannerModal } from '@/components/shared/QrScannerModal';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';

const addInventorySchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  modelNumber: z.string().min(1, "Model number is required"),
});

type AddInventoryFormValues = z.infer<typeof addInventorySchema>;

export default function AddInventoryPage() {
  const { addLaptopToInventory, currentUser, getLaptopById } = useAppData();
  const router = useRouter();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { control, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<AddInventoryFormValues>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      serialNumber: '',
      modelNumber: '',
    }
  });

  useEffect(() => {
    if (currentUser && currentUser.role !== 'distributor') {
      if (currentUser.role === 'admin') router.replace('/');
      else if (currentUser.role === 'store-owner') router.replace('/store-user');
      else router.replace('/login');
    }
  }, [currentUser, router]);

  const watchedSerialNumber = watch("serialNumber");

  useEffect(() => {
    if (watchedSerialNumber) {
      const existingLaptop = getLaptopById(watchedSerialNumber);
      if (existingLaptop) {
        setFormError(`Laptop with Serial Number ${watchedSerialNumber} already exists. Model: ${existingLaptop.modelNumber}.`);
      } else {
        setFormError(null);
      }
    } else {
      setFormError(null);
    }
  }, [watchedSerialNumber, getLaptopById]);

  const handleQrScanSuccess = (scannedValue: { serialNumber: string, modelNumber: string }) => {
    setValue('serialNumber', scannedValue.serialNumber, { shouldValidate: true });
    setValue('modelNumber', scannedValue.modelNumber, { shouldValidate: true });
    setIsQrModalOpen(false);
    const existingLaptop = getLaptopById(scannedValue.serialNumber);
    if (existingLaptop) {
        setFormError(`Laptop with Serial Number ${scannedValue.serialNumber} already exists. Model: ${existingLaptop.modelNumber}.`);
    } else {
        setFormError(null);
    }
  };

  const onSubmit: SubmitHandler<AddInventoryFormValues> = async (data) => {
    setFormError(null);
    setFormSuccess(null);

    const existingLaptop = getLaptopById(data.serialNumber);
    if (existingLaptop) {
      setFormError(`Error: Laptop with Serial Number ${data.serialNumber} already exists.`);
      return;
    }

    try {
      const success = addLaptopToInventory({
        serialNumber: data.serialNumber,
        modelNumber: data.modelNumber,
      });
      if (success) {
        setFormSuccess(`Laptop ${data.modelNumber} (SN: ${data.serialNumber}) added to inventory successfully.`);
        reset();
      } else {
        // Error toast is handled by addLaptopToInventory for "already exists"
        // setFormError might be set if addLaptopToInventory explicitly returns false for other reasons.
      }
    } catch (error) {
      console.error("Add inventory failed:", error);
      setFormError("Failed to add laptop to inventory. Please try again.");
    }
  };
  
  if (!currentUser || currentUser.role !== 'distributor') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
        <Hourglass className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2"><PackagePlus /> Add New Laptop to Inventory</CardTitle>
          <CardDescription>Enter laptop details manually or use the QR scanner.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {formError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            {formSuccess && (
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-700">
                <Info className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{formSuccess}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="button" onClick={() => setIsQrModalOpen(true)} variant="outline" className="w-full sm:w-auto flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                <QrCode className="mr-2 h-5 w-5" /> Scan QR Code
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Controller
                name="serialNumber"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="serialNumber" 
                    placeholder="Enter or scan serial number" 
                    {...field}
                    className={errors.serialNumber || formError?.includes(field.value) ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelNumber">Model Number</Label>
               <Controller
                name="modelNumber"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="modelNumber" 
                    placeholder="Enter laptop model" 
                    {...field} 
                    className={errors.modelNumber ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.modelNumber && <p className="text-sm text-destructive">{errors.modelNumber.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !!formError}>
              {isSubmitting ? 'Adding...' : 'Add Laptop to Warehouse'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <QrScannerModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)}
        onScanSuccess={handleQrScanSuccess} 
      />
    </>
  );
}
