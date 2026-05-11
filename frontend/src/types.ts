export type UserRole = 'admin' | 'chef' | 'waiter' | 'supervisor';

export interface User {
  id: string; // Internal UUID
  uid: string; // Firebase or external ID
  name: string;
  role: string;
  station_id?: string;
  pin?: string;
}

export interface KitchenStation {
  station_id: string;
  station_name: string;
  display_name: string;
  color_code: string;
  icon?: string;
  expected_time_minutes: number;
  is_active: boolean;
  _count?: {
    order_items: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  station_id?: string;
  prep_time_minutes: number;
  is_active?: boolean;
  station?: KitchenStation;
}

export interface Order {
  id: string;
  order_id: string;
  tableNo: string;
  status: string;
  totalItems: number;
  completedItems: number;
  createdAt: string | number;
  updatedAt?: string | number;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  order_item_id: string;
  station_id: string;
  chef_id?: string;
  status: 'PENDING' | 'ACCEPTED' | 'STARTED' | 'READY' | 'SERVED';
  priority: number;
  quantity: number;
  started_at?: string;
  accepted_at?: string;
  ready_at?: string;
  served_at?: string;
  expected_ready_time?: string;
  notes?: string;
  created_at: string;
  station?: KitchenStation;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
