import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { KitchenStation, MenuItem, Order, OrderItem } from '../types';
import { apiUrl } from '../lib/api';

export function useKitchenData() {
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderItems, setActiveOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [sRes, mRes, oRes, aRes] = await Promise.all([
        fetch(apiUrl('/api/stations')),
        fetch(apiUrl('/api/menu')),
        fetch(apiUrl('/api/orders')),
        fetch(apiUrl('/api/active-items')),
      ]);

      const [sData, mData, oData, aData] = await Promise.all([
        sRes.json(),
        mRes.json(),
        oRes.json(),
        aRes.json(),
      ]);

      setStations(sData);
      setMenuItems(mData);
      setOrders(oData);
      setActiveOrderItems(aData);
    } catch (error) {
      console.error('Failed to fetch kitchen data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const socketBaseUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const newSocket = io(socketBaseUrl);
    setSocket(newSocket);

    newSocket.on('new-item', (item: OrderItem) => {
      setActiveOrderItems((prev) => [...prev, item]);
    });

    newSocket.on('item-updated', (updatedItem: OrderItem) => {
      setActiveOrderItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    });

    newSocket.on('order-created', fetchData);
    newSocket.on('order-updated', fetchData);

    return () => {
      newSocket.disconnect();
    };
  }, [fetchData]);

  const addOrder = async (tableNo: string, items: { menu_item_id: string; quantity: number; notes?: string }[]) => {
    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNo, items }),
      });
      return await res.json();
    } catch (error) {
      console.error('Failed to add order:', error);
    }
  };

  const updateStationMapping = async (itemId: string, stationId: string) => {
    try {
      await fetch(apiUrl(`/api/menu/${itemId}/station`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: stationId }),
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to update station mapping:', error);
    }
  };

  const updateItemStatus = async (itemId: string, status: string, chefId?: string) => {
    try {
      const res = await fetch(apiUrl(`/api/items/${itemId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, chef_id: chefId }),
      });
      return await res.json();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return {
    stations,
    menuItems,
    orders,
    activeOrderItems,
    loading,
    socket,
    addOrder,
    updateStationMapping,
    updateItemStatus,
    refreshData: fetchData,
  };
}
