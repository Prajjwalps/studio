
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Laptop, Store, TransferRequest, Notification, TransferStatus, User, UserRole } from '@/lib/types';
import { INITIAL_LAPTOPS, INITIAL_STORES, INITIAL_TRANSFER_REQUESTS, INITIAL_NOTIFICATIONS, WAREHOUSE_ID } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';

// Mock Users for Demo
const MOCK_USERS: User[] = [
  { id: 'user-admin-001', name: 'Admin User', role: 'admin' },
  { id: 'user-dist-001', name: 'Distributor Dave', role: 'distributor' },
  { id: 'user-store-001', name: 'Alice (Store_001 Owner)', role: 'store-owner', storeId: 'STORE_001' },
  { id: 'user-store-002', name: 'Bob (Store_002 Owner)', role: 'store-owner', storeId: 'STORE_002' },
];

interface AppDataContextType {
  laptops: Laptop[];
  stores: Store[];
  transferRequests: TransferRequest[];
  notifications: Notification[];
  currentUser: User | null;
  mockUsers: User[]; // Expose mock users for login page
  login: (userId: string) => void;
  logout: () => void;
  addTransferRequest: (request: Omit<TransferRequest, 'id' | 'requestTimestamp' | 'status'>) => string;
  updateTransferStatus: (requestId: string, status: TransferStatus, approvedBy?: string) => void;
  getLaptopById: (id: string) => Laptop | undefined;
  getStoreById: (id: string) => Store | undefined;
  getLocationNameById: (id: string) => string;
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  getNotifications: (read?: boolean) => Notification[];
  addLaptopToInventory: (laptop: Omit<Laptop, 'status' | 'currentLocation' | 'lastTransferId'>) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [laptops, setLaptops] = useState<Laptop[]>(INITIAL_LAPTOPS);
  const [stores] = useState<Store[]>(INITIAL_STORES);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(INITIAL_TRANSFER_REQUESTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      // Validate user against MOCK_USERS to prevent issues if MOCK_USERS changes
      const validUser = MOCK_USERS.find(mu => mu.id === user.id);
      if (validUser) {
        setCurrentUser(validUser);
      } else {
        localStorage.removeItem('currentUser'); // Clear invalid stored user
      }
    }
  }, []);
  
  const login = useCallback((userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast({ title: "Login Successful", description: `Welcome, ${user.name}!` });
      // Redirection will be handled by the page/layout based on role
      if (user.role === 'admin') router.push('/');
      else if (user.role === 'distributor') router.push('/distributor');
      else if (user.role === 'store-owner') router.push('/store-user');
      else router.push('/'); // Fallback
    } else {
      toast({ title: "Login Failed", description: "User not found.", variant: "destructive" });
    }
  }, [router, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  }, [router, toast]);

  const getLaptopById = useCallback((id: string) => laptops.find(laptop => laptop.id === id || laptop.serialNumber === id), [laptops]);
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
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20 notifications
  }, [notifications.length]);
  
  const addTransferRequest = useCallback((requestData: Omit<TransferRequest, 'id' | 'requestTimestamp' | 'status'>) => {
    const newRequestId = `TRN${String(transferRequests.length + 1).padStart(3, '0')}`;
    const requestingUser = currentUser ? currentUser.name : "System";
    const newRequest: TransferRequest = {
      ...requestData,
      id: newRequestId,
      requestTimestamp: new Date().toISOString(),
      status: 'Pending',
      requestedBy: requestingUser,
    };
    setTransferRequests(prevRequests => [newRequest, ...prevRequests]);
    setLaptops(prevLaptops =>
      prevLaptops.map(laptop =>
        laptop.id === requestData.laptopId
          ? { ...laptop, status: 'In Transit', lastTransferId: newRequestId, currentLocation: requestData.toLocation } 
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
  }, [transferRequests.length, toast, addNotification, getLocationNameById, currentUser]);

  const updateTransferStatus = useCallback((requestId: string, status: TransferStatus, approverName?: string) => {
    const actingUser = approverName || (currentUser ? currentUser.name : "System");
    setTransferRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId
          ? { ...req, status, approvedBy: actingUser, actionTimestamp: new Date().toISOString() }
          : req
      )
    );

    const updatedRequest = transferRequests.find(req => req.id === requestId); // Find from existing state before update
     if (updatedRequest) { // Check if updatedRequest is found
      setLaptops(prevLaptops =>
        prevLaptops.map(laptop => {
          if (laptop.id === updatedRequest.laptopId) {
            if (status === 'Accepted' || status === 'Completed') {
              return { ...laptop, status: 'Received', currentLocation: updatedRequest.toLocation };
            } else if (status === 'Rejected') {
              return { ...laptop, status: laptop.currentLocation === WAREHOUSE_ID ? 'In Warehouse' : 'In Store', currentLocation: updatedRequest.fromLocation };
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
        toastMessage = `Transfer of ${updatedRequest.modelNumber} (SN: ${updatedRequest.serialNumber}) to ${toLocationName} has been ${status.toLowerCase()}.`;
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
  }, [transferRequests, toast, addNotification, getLocationNameById, currentUser]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);
  
  const getNotifications = useCallback((read?: boolean) => {
    if (typeof read === 'undefined') return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return notifications.filter(n => n.read === read).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications]);

  const addLaptopToInventory = useCallback((laptopData: Omit<Laptop, 'status' | 'currentLocation' | 'lastTransferId'>) => {
    const newLaptop: Laptop = {
      ...laptopData,
      status: 'In Warehouse',
      currentLocation: WAREHOUSE_ID,
    };
    setLaptops(prevLaptops => [newLaptop, ...prevLaptops]);
    toast({
      title: "Laptop Added",
      description: `${laptopData.modelNumber} (SN: ${laptopData.serialNumber}) added to warehouse.`,
    });
    addNotification({
      message: `New Laptop ${laptopData.serialNumber} (${laptopData.modelNumber}) added to warehouse by ${currentUser?.name || 'System'}.`,
      type: 'success',
    });
  }, [toast, addNotification, currentUser]);

  return (
    <AppDataContext.Provider value={{ 
      laptops, 
      stores, 
      transferRequests, 
      notifications,
      currentUser,
      mockUsers: MOCK_USERS,
      login,
      logout,
      addTransferRequest, 
      updateTransferStatus,
      getLaptopById,
      getStoreById,
      getLocationNameById,
      markNotificationAsRead,
      addNotification,
      getNotifications,
      addLaptopToInventory
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
