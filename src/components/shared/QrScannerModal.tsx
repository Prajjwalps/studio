
"use client";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, CheckCircle } from "lucide-react";
import Image from 'next/image';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedValue: { serialNumber: string, modelNumber: string }) => void;
}

export function QrScannerModal({ isOpen, onClose, onScanSuccess }: QrScannerModalProps) {
  const [simulatingScan, setSimulatingScan] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scannedData, setScannedData] = useState({ serialNumber: "", modelNumber: "" });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simulatingScan && !scanComplete) {
      // Simulate scanning process
      timer = setTimeout(() => {
        const mockSerialNumber = `SN-QR${Math.floor(1000 + Math.random() * 9000)}`;
        const mockModelNumber = ["XPS 13", "Latitude 7420", "MacBook Pro 14", "ThinkPad P1"][Math.floor(Math.random()*4)];
        setScannedData({ serialNumber: mockSerialNumber, modelNumber: mockModelNumber });
        setScanComplete(true);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [simulatingScan, scanComplete]);

  const handleStartScan = () => {
    setSimulatingScan(true);
    setScanComplete(false);
    setScannedData({ serialNumber: "", modelNumber: "" });
  };

  const handleConfirmScan = () => {
    onScanSuccess(scannedData);
    resetAndClose();
  };

  const resetAndClose = () => {
    setSimulatingScan(false);
    setScanComplete(false);
    setScannedData({ serialNumber: "", modelNumber: "" });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline">
            <QrCode className="h-6 w-6 text-primary" /> QR Code Scanner
          </DialogTitle>
          <DialogDescription>
            Position the QR code in front of the camera. For this demo, click "Simulate Scan".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!simulatingScan && (
            <div className="flex justify-center">
              <Image src="https://placehold.co/200x200.png?text=Align+QR+Code" alt="QR Code Placeholder" width={200} height={200} data-ai-hint="qr code" />
            </div>
          )}
          {simulatingScan && !scanComplete && (
            <div className="flex flex-col items-center justify-center h-[200px] space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Simulating scan...</p>
            </div>
          )}
          {scanComplete && (
            <div className="flex flex-col items-center justify-center h-[200px] space-y-3 p-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-green-700">Scan Successful!</p>
              <p className="text-sm text-green-600">Serial: {scannedData.serialNumber}</p>
              <p className="text-sm text-green-600">Model: {scannedData.modelNumber}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {!scanComplete && !simulatingScan && (
             <Button onClick={handleStartScan} className="w-full bg-accent hover:bg-accent/90">
                <QrCode className="mr-2 h-4 w-4" /> Simulate Scan
             </Button>
          )}
           {scanComplete && (
             <Button onClick={handleConfirmScan} className="w-full">
                Confirm and Use Data
             </Button>
          )}
          <Button variant="outline" onClick={resetAndClose} className="w-full mt-2 sm:mt-0">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
