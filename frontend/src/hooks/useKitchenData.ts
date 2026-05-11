import { useCallback, useEffect, useState } from 'react';
import {
  createDemoOrder,
  getDemoActiveItems,
  getDemoMenuItems,
  getDemoOrders,
  getDemoStations,
  subscribeDemoState,
  updateDemoItemStatus,
  updateDemoMenuStation,
} from '../lib/demoData';
import { KitchenStation, MenuItem, Order, OrderItem } from '../types';

export function useKitchenData() {
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderItems, setActiveOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setStations(getDemoStations());
    setMenuItems(getDemoMenuItems());
    setOrders(getDemoOrders());
    setActiveOrderItems(getDemoActiveItems());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    return subscribeDemoState(fetchData);
  }, [fetchData]);

  const addOrder = async (tableNo: string, items: { menu_item_id: string; quantity: number; notes?: string }[]) => {
    return createDemoOrder(tableNo, items);
  };

  const updateStationMapping = async (itemId: string, stationId: string) => {
    await updateDemoMenuStation(itemId, stationId);
    await fetchData();
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    return updateDemoItemStatus(itemId, status as OrderItem['status']);
  };

  return {
    stations,
    menuItems,
    orders,
    activeOrderItems,
    loading,
    socket: null,
    addOrder,
    updateStationMapping,
    updateItemStatus,
    refreshData: fetchData,
  };
}
