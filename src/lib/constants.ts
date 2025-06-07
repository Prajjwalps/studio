
import type { Store, Laptop, TransferRequest, Notification } from './types';

export const WAREHOUSE_ID = 'MAIN_WAREHOUSE';
export const WAREHOUSE_NAME = 'Main Warehouse';

export const INITIAL_STORES: Store[] = Array.from({ length: 30 }, (_, i) => ({
  id: `STORE_${String(i + 1).padStart(3, '0')}`,
  name: `Store ${String(i + 1).padStart(3, '0')}`,
  manager: `Manager ${String.fromCharCode(65 + (i % 26))}${i + 1}`,
}));

export const INITIAL_LAPTOPS: Laptop[] = [
  { id: 'SN00001', serialNumber: 'SN00001', modelNumber: 'Latitude 7400', status: 'In Warehouse', currentLocation: WAREHOUSE_ID },
  { id: 'SN00002', serialNumber: 'SN00002', modelNumber: 'XPS 13', status: 'In Warehouse', currentLocation: WAREHOUSE_ID },
  { id: 'SN00003', serialNumber: 'SN00003', modelNumber: 'MacBook Pro 16', status: 'In Warehouse', currentLocation: WAREHOUSE_ID },
  { id: 'SN00004', serialNumber: 'SN00004', modelNumber: 'ThinkPad X1', status: 'In Store', currentLocation: INITIAL_STORES[0].id },
  { id: 'SN00005', serialNumber: 'SN00005', modelNumber: 'Surface Laptop 4', status: 'In Store', currentLocation: INITIAL_STORES[1].id },
  { id: 'SN00006', serialNumber: 'SN00006', modelNumber: 'Latitude 7400', status: 'In Transit', currentLocation: INITIAL_STORES[2].id, lastTransferId: 'TRN001' },
  { id: 'SN00007', serialNumber: 'SN00007', modelNumber: 'XPS 15', status: 'In Warehouse', currentLocation: WAREHOUSE_ID },
  { id: 'SN00008', serialNumber: 'SN00008', modelNumber: 'MacBook Air M2', status: 'In Warehouse', currentLocation: WAREHOUSE_ID },
  { id: 'SN00009', serialNumber: 'SN00009', modelNumber: 'ThinkPad T14', status: 'In Store', currentLocation: INITIAL_STORES[3].id },
  { id: 'SN00010', serialNumber: 'SN00010', modelNumber: 'Surface Pro 8', status: 'In Store', currentLocation: INITIAL_STORES[4].id },
];

export const INITIAL_TRANSFER_REQUESTS: TransferRequest[] = [
  {
    id: 'TRN001',
    laptopId: 'SN00006',
    serialNumber: 'SN00006',
    modelNumber: 'Latitude 7400',
    fromLocation: WAREHOUSE_ID,
    toLocation: INITIAL_STORES[2].id,
    requestTimestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: 'Pending',
    requestedBy: 'Warehouse Manager',
  },
  {
    id: 'TRN002',
    laptopId: 'SN00004',
    serialNumber: 'SN00004',
    modelNumber: 'ThinkPad X1',
    fromLocation: WAREHOUSE_ID,
    toLocation: INITIAL_STORES[0].id,
    requestTimestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    actionTimestamp: new Date(Date.now() - 80000000).toISOString(),
    status: 'Completed',
    requestedBy: 'Warehouse Manager',
    approvedBy: INITIAL_STORES[0].manager,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { 
    id: 'NOTIF001', 
    message: `Laptop SN00006 (Latitude 7400) transfer to ${INITIAL_STORES[2].name} is pending your approval.`, 
    timestamp: new Date(Date.now() - 3600000).toISOString(), 
    read: false, 
    type: 'info',
    relatedTransferId: 'TRN001'
  },
];

export const ALL_LOCATIONS = [
  { id: WAREHOUSE_ID, name: WAREHOUSE_NAME },
  ...INITIAL_STORES.map(store => ({ id: store.id, name: store.name }))
];

