
"use client";
import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { QrCode, Edit3, AlertTriangle, Info } from "lucide-react";
import { useAppData } from '@/contexts/AppDataContext';
import { QrScannerModal } from '@/components/shared/QrScannerModal';
import { WAREHOUSE_ID, WAREHOUSE_NAME, ALL_LOCATIONS } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const transferSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  modelNumber: z.string().min(1, "Model number is required"),
  fromLocation: z.string().min(1, "Source location is required"),
  toLocation: z.string().min(1, "Destination location is required"),
}).refine(data => data.fromLocation !== data.toLocation, {
  message: "Source and destination cannot be the same",
  path: ["toLocation"],
});

type TransferFormValues = z.infer<typeof transferSchema>;

export function TransferForm() {
  const { addTransferRequest, getLaptopById, stores } = useAppData();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { control, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      serialNumber: '',
      modelNumber: '',
      fromLocation: WAREHOUSE_ID, // Default from warehouse
      toLocation: '',
    }
  });

  const watchedSerialNumber = watch("serialNumber");

  const handleQrScanSuccess = (scannedValue: { serialNumber: string, modelNumber: string }) => {
    setValue('serialNumber', scannedValue.serialNumber, { shouldValidate: true });
    setValue('modelNumber', scannedValue.modelNumber, { shouldValidate: true });
    const laptop = getLaptopById(scannedValue.serialNumber);
    if (laptop) {
      setValue('fromLocation', laptop.currentLocation, { shouldValidate: true });
    }
    setIsQrModalOpen(false);
    setFormError(null);
  };

  const handleSerialNumberChange = (serial: string) => {
    setValue('serialNumber', serial, { shouldValidate: true });
    const laptop = getLaptopById(serial);
    if (laptop) {
      setValue('modelNumber', laptop.modelNumber, { shouldValidate: true });
      setValue('fromLocation', laptop.currentLocation, { shouldValidate: true });
      setFormError(null);
    } else if (serial) {
      setValue('modelNumber', '', { shouldValidate: true }); // Clear model if laptop not found
      setFormError("Laptop with this serial number not found in inventory. Please verify or add it first.");
    } else {
      setFormError(null);
    }
  };

  const onSubmit: SubmitHandler<TransferFormValues> = async (data) => {
    setFormError(null);
    setFormSuccess(null);
    const laptop = getLaptopById(data.serialNumber);
    if (!laptop) {
      setFormError("Laptop not found. Cannot create transfer request.");
      return;
    }
    if (laptop.status === 'In Transit') {
      setFormError(`Laptop ${data.serialNumber} is already in transit (Request ID: ${laptop.lastTransferId}).`);
      return;
    }
    if (laptop.currentLocation !== data.fromLocation) {
      setFormError(`Laptop ${data.serialNumber} is currently at ${laptop.currentLocation}, not ${data.fromLocation}. Please update 'From Location' or check inventory.`);
      return;
    }

    try {
      addTransferRequest({
        laptopId: laptop.id,
        serialNumber: data.serialNumber,
        modelNumber: data.modelNumber,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        requestedBy: "Current Manager (Demo)", // Placeholder for actual user
      });
      setFormSuccess(`Transfer request for ${data.modelNumber} (SN: ${data.serialNumber}) created successfully.`);
      reset();
    } catch (error) {
      console.error("Transfer request failed:", error);
      setFormError("Failed to create transfer request. Please try again.");
    }
  };

  const availableFromLocations = ALL_LOCATIONS;
  const availableToLocations = stores.filter(store => store.id !== watch('fromLocation'));

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2"><Edit3 /> Initiate Laptop Transfer</CardTitle>
          <CardDescription>Fill in the details to request a laptop transfer. Use QR Scan for speed.</CardDescription>
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
                    onChange={(e) => handleSerialNumberChange(e.target.value)} 
                    className={errors.serialNumber ? 'border-destructive' : ''}
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
                    placeholder="Laptop model (auto-filled if SN found)" 
                    {...field} 
                    readOnly={!!getLaptopById(watchedSerialNumber)} // Read-only if SN found a laptop
                    className={errors.modelNumber ? 'border-destructive' : ''}
                  />
                )}
              />
              {errors.modelNumber && <p className="text-sm text-destructive">{errors.modelNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromLocation">From Location</Label>
              <Controller
                name="fromLocation"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!getLaptopById(watchedSerialNumber)}>
                    <SelectTrigger id="fromLocation" className={errors.fromLocation ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select source location" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFromLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fromLocation && <p className="text-sm text-destructive">{errors.fromLocation.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="toLocation">To Location</Label>
              <Controller
                name="toLocation"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="toLocation" className={errors.toLocation ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select destination store" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToLocations.map(store => (
                        <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.toLocation && <p className="text-sm text-destructive">{errors.toLocation.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Create Transfer Request'}
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
