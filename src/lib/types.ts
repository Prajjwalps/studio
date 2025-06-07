
export type UserRole = 'admin' | 'distributor' | 'store-owner';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  storeId?: string; // Only relevant for store-owners
}

export interface Laptop {
  id: string; // Unique identifier, could be serial number
  serialNumber: string;
  modelNumber: string;
  status: 'In Warehouse' | 'In Store' | 'In Transit' | 'Received';
  currentLocation: string; // Warehouse ID or Store ID
  lastTransferId?: string;
}

export interface Store {
  id: string;
  name: string;
  manager: string; // Manager's name or ID
}

export type TransferStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export interface TransferRequest {
  id: string;
  laptopId: string;
  serialNumber: string;
  modelNumber: string;
  fromLocation: string; // Warehouse ID or Store ID
  toLocation: string; // Store ID
  requestTimestamp: string; // ISO Date string
  actionTimestamp?: string; // ISO Date string for accept/reject
  status: TransferStatus;
  requestedBy: string; // Manager initiating
  approvedBy?: string; // Manager approving
}

export interface Notification {
  id:string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  relatedTransferId?: string;
}
