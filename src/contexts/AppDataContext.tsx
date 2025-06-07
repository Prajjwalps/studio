
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Laptop, Store, TransferRequest, Notification, TransferStatus } from '@/lib/types';
import { INITIAL_LAPTOPS, INITIAL_STORES, INITIAL_TRANSFER_REQUESTS, INITIAL_NOTIFICATIONS, WAREHOUSE_ID } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";

interface AppDataContextType {
  laptops: Laptop[];
  stores: Store[];
  transferRequests: TransferRequest[];
  notifications: Notification[];
  addTransferRequest: (request: Omit<TransferRequest, 'id' | 'requestTimestamp' | 'status'>) => string;
  updateTransferStatus: (requestId: string, status: TransferStatus, approvedBy?: string) => void;
  getLaptopById: (id: string) => Laptop | undefined;
  getStoreById: (id: string) => Store | undefined;
  getLocationNameById: (id: string) => string;
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  getNotifications: (read?: boolean) => Notification[];
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [laptops, setLaptops] = useState<Laptop[]>(INITIAL_LAPTOPS);
  const [stores] = useState<Store[]>(INITIAL_STORES);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(INITIAL_TRANSFER_REQUESTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const { toast } = useToast();

  const getLaptopById = useCallback((id: string) => laptops.find(laptop => laptop.id === id), [laptops]);
  const getStoreById = useCallback((id: string) => stores.find(store => store.id === id), [stores]);
  
  const getLocationNameById = useCallback((id: string) => {
    if (id === WAREHOUSE_ID) return "Main Warehouse";
    const store = getStoreById(id);
    return store ? store.name : "Unknown Location";
  }, [getStoreById]);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `NOTIF${String(notifications.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [notifications.length]);
  
  const addTransferRequest = useCallback((requestData: Omit<TransferRequest, 'id' | 'requestTimestamp' | 'status'>) => {
    const newRequestId = `TRN${String(transferRequests.length + 1).padStart(3, '0')}`;
    const newRequest: TransferRequest = {
      ...requestData,
      id: newRequestId,
      requestTimestamp: new Date().toISOString(),
      status: 'Pending',
    };
    setTransferRequests(prevRequests => [newRequest, ...prevRequests]);
    setLaptops(prevLaptops =>
      prevLaptops.map(laptop =>
        laptop.id === requestData.laptopId
          ? { ...laptop, status: 'In Transit', lastTransferId: newRequestId, currentLocation: requestData.toLocation } // Optimistically update current location for UI
          : laptop
      )
    );
    
    const toLocationName = getLocationNameById(requestData.toLocation);
    const fromLocationName = getLocationNameById(requestData.fromLocation);

    toast({
      title: "Transfer Request Created",
      description: `Request for ${requestData.modelNumber} (SN: ${requestData.serialNumber}) to ${toLocationName} has been submitted.`,
      variant: "default",
    });

    addNotification({
      message: `Laptop ${requestData.serialNumber} transfer from ${fromLocationName} to ${toLocationName} is pending approval.`,
      type: 'info',
      relatedTransferId: newRequestId,
    });
    return newRequestId;
  }, [transferRequests.length, toast, addNotification, getLocationNameById]);

  const updateTransferStatus = useCallback((requestId: string, status: TransferStatus, approvedBy?: string) => {
    setTransferRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId
          ? { ...req, status, approvedBy: approvedBy ?? req.approvedBy, actionTimestamp: new Date().toISOString() }
          : req
      )
    );

    const updatedRequest = transferRequests.find(req => req.id === requestId);
    if (updatedRequest) {
      setLaptops(prevLaptops =>
        prevLaptops.map(laptop => {
          if (laptop.id === updatedRequest.laptopId) {
            if (status === 'Accepted' || status === 'Completed') {
              return { ...laptop, status: 'Received', currentLocation: updatedRequest.toLocation };
            } else if (status === 'Rejected') {
              // Revert status, ideally to its original location before transit.
              // This simplified version keeps it as 'In Transit' or original 'In Warehouse' / 'In Store' status
              // For a real app, you'd need to track original location or handle returns.
              return { ...laptop, status: 'In Store', currentLocation: updatedRequest.fromLocation }; // simplified return
            }
          }
          return laptop;
        })
      );
      
      const toLocationName = getLocationNameById(updatedRequest.toLocation);
      const fromLocationName = getLocationNameById(updatedRequest.fromLocation);
      let toastMessage = "";
      let notificationType: Notification['type'] = 'info';

      if (status === 'Accepted' || status === 'Completed') {
        toastMessage = `Transfer of ${updatedRequest.modelNumber} (SN: ${updatedRequest.serialNumber}) to ${toLocationName} has been accepted.`;
        notificationType = 'success';
      } else if (status === 'Rejected') {
        toastMessage = `Transfer of ${updatedRequest.modelNumber} (SN: ${updatedRequest.serialNumber}) to ${toLocationName} has been rejected.`;
        notificationType = 'error';
      }
      
      if (toastMessage) {
        toast({
          title: `Transfer ${status}`,
          description: toastMessage,
          variant: status === 'Rejected' ? "destructive" : "default",
        });
        addNotification({
          message: `Laptop ${updatedRequest.serialNumber} transfer from ${fromLocationName} to ${toLocationName} was ${status.toLowerCase()}.`,
          type: notificationType,
          relatedTransferId: requestId,
        });
      }
    }
  }, [transferRequests, toast, addNotification, getLocationNameById]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);
  
  const getNotifications = useCallback((read?: boolean) => {
    if (typeof read === 'undefined') return notifications;
    return notifications.filter(n => n.read === read);
  }, [notifications]);

  return (
    <AppDataContext.Provider value={{ 
      laptops, 
      stores, 
      transferRequests, 
      notifications,
      addTransferRequest, 
      updateTransferStatus,
      getLaptopById,
      getStoreById,
      getLocationNameById,
      markNotificationAsRead,
      addNotification,
      getNotifications
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
