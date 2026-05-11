import type { KitchenStation, MenuItem, Order, OrderItem } from '../types';

const STORAGE_KEY = 'kf_demo_state_v1';
const EVENT_NAME = 'kf-demo-data-updated';

type DemoState = {
  stations: KitchenStation[];
  menuItems: MenuItem[];
  orders: Order[];
  activeItems: OrderItem[];
};

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSeedState(): DemoState {
  const fryStation: KitchenStation = {
    station_id: 'station-fry',
    station_name: 'Fry',
    display_name: 'Fry Station',
    color_code: '#f97316',
    icon: 'Flame',
    expected_time_minutes: 8,
    is_active: true,
    _count: { order_items: 3 },
  };
  const grillStation: KitchenStation = {
    station_id: 'station-grill',
    station_name: 'Grill',
    display_name: 'Grill & Roast',
    color_code: '#ef4444',
    icon: 'Beef',
    expected_time_minutes: 15,
    is_active: true,
    _count: { order_items: 2 },
  };
  const coldStation: KitchenStation = {
    station_id: 'station-cold',
    station_name: 'Cold',
    display_name: 'Salad & Cold Station',
    color_code: '#22c55e',
    icon: 'Leaf',
    expected_time_minutes: 5,
    is_active: true,
    _count: { order_items: 2 },
  };

  const stations = [fryStation, grillStation, coldStation];

  const menuItems: MenuItem[] = [
    { id: makeId('menu'), name: 'French Fries', category: 'Appetizers', price: 4.99, station_id: fryStation.station_id, prep_time_minutes: 6, is_active: true, station: fryStation },
    { id: makeId('menu'), name: 'Cheeseburger', category: 'Mains', price: 12.99, station_id: grillStation.station_id, prep_time_minutes: 12, is_active: true, station: grillStation },
    { id: makeId('menu'), name: 'Chicken Nuggets', category: 'Starters', price: 7.49, station_id: fryStation.station_id, prep_time_minutes: 8, is_active: true, station: fryStation },
    { id: makeId('menu'), name: 'Caesar Salad', category: 'Salads', price: 9.99, station_id: coldStation.station_id, prep_time_minutes: 5, is_active: true, station: coldStation },
    { id: makeId('menu'), name: 'Grilled Steak', category: 'Mains', price: 24.99, station_id: grillStation.station_id, prep_time_minutes: 20, is_active: true, station: grillStation },
    { id: makeId('menu'), name: 'Club Sandwich', category: 'Sandwiches', price: 10.49, station_id: grillStation.station_id, prep_time_minutes: 10, is_active: true, station: grillStation },
    { id: makeId('menu'), name: 'Mozzarella Sticks', category: 'Appetizers', price: 6.99, station_id: fryStation.station_id, prep_time_minutes: 7, is_active: true, station: fryStation },
    { id: makeId('menu'), name: 'Iced Lemon Tea', category: 'Drinks', price: 3.49, station_id: coldStation.station_id, prep_time_minutes: 2, is_active: true, station: coldStation },
    { id: makeId('menu'), name: 'Margherita Pizza Slice', category: 'Mains', price: 8.99, station_id: grillStation.station_id, prep_time_minutes: 14, is_active: true, station: grillStation },
    { id: makeId('menu'), name: 'Chocolate Cake', category: 'Desserts', price: 5.99, station_id: coldStation.station_id, prep_time_minutes: 4, is_active: true, station: coldStation },
  ];

  const orderA: Order = {
    id: makeId('order'),
    order_id: 'ORD-1284',
    tableNo: 'T-12',
    status: 'IN_PROGRESS',
    totalItems: 3,
    completedItems: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    items: [],
  };
  const orderB: Order = {
    id: makeId('order'),
    order_id: 'ORD-4427',
    tableNo: 'T-7',
    status: 'OPEN',
    totalItems: 2,
    completedItems: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    items: [],
  };

  const activeItems: OrderItem[] = [
    {
      id: makeId('item'),
      order_id: orderA.order_id,
      order_item_id: 'Cheeseburger',
      station_id: grillStation.station_id,
      status: 'PENDING',
      priority: 2,
      quantity: 2,
      notes: 'No onions',
      expected_ready_time: new Date(Date.now() + 12 * 60000).toISOString(),
      created_at: nowIso(),
      station: grillStation,
    },
    {
      id: makeId('item'),
      order_id: orderA.order_id,
      order_item_id: 'French Fries',
      station_id: fryStation.station_id,
      status: 'STARTED',
      priority: 2,
      quantity: 1,
      started_at: new Date(Date.now() - 4 * 60000).toISOString(),
      expected_ready_time: new Date(Date.now() + 6 * 60000).toISOString(),
      created_at: nowIso(),
      station: fryStation,
    },
    {
      id: makeId('item'),
      order_id: orderA.order_id,
      order_item_id: 'Caesar Salad',
      station_id: coldStation.station_id,
      status: 'READY',
      priority: 2,
      quantity: 1,
      started_at: new Date(Date.now() - 9 * 60000).toISOString(),
      ready_at: new Date(Date.now() - 1 * 60000).toISOString(),
      expected_ready_time: new Date(Date.now() - 2 * 60000).toISOString(),
      created_at: nowIso(),
      station: coldStation,
    },
    {
      id: makeId('item'),
      order_id: orderB.order_id,
      order_item_id: 'Grilled Steak',
      station_id: grillStation.station_id,
      status: 'ACCEPTED',
      priority: 2,
      quantity: 1,
      accepted_at: new Date(Date.now() - 3 * 60000).toISOString(),
      expected_ready_time: new Date(Date.now() + 17 * 60000).toISOString(),
      created_at: nowIso(),
      station: grillStation,
    },
    {
      id: makeId('item'),
      order_id: orderB.order_id,
      order_item_id: 'Chocolate Cake',
      station_id: coldStation.station_id,
      status: 'PENDING',
      priority: 2,
      quantity: 2,
      notes: 'Extra cream',
      expected_ready_time: new Date(Date.now() + 4 * 60000).toISOString(),
      created_at: nowIso(),
      station: coldStation,
    },
  ];

  orderA.items = activeItems.filter((item) => item.order_id === orderA.order_id);
  orderB.items = activeItems.filter((item) => item.order_id === orderB.order_id);

  return {
    stations,
    menuItems,
    orders: [orderA, orderB],
    activeItems,
  };
}

function readState(): DemoState {
  if (typeof window === 'undefined') {
    return createSeedState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as DemoState;
    return normalizeState(parsed);
  } catch {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function normalizeState(state: Partial<DemoState>): DemoState {
  const seed = createSeedState();
  const stationsSource = state.stations !== undefined ? state.stations : seed.stations;
  const menuSource = state.menuItems !== undefined ? state.menuItems : seed.menuItems;
  const ordersSource = state.orders !== undefined ? state.orders : seed.orders;
  const activeSource = state.activeItems !== undefined ? state.activeItems : seed.activeItems;

  const stations = stationsSource.map((station) => ({
    ...station,
    _count: { order_items: 0 },
  }));

  const stationMap = new Map(stations.map((station) => [station.station_id, station]));

  const menuItems = menuSource.map((item) => ({
    ...item,
    station: item.station_id ? stationMap.get(item.station_id) ?? null : undefined,
  }));

  const activeItems = activeSource.map((item) => ({
    ...item,
    station: item.station_id ? stationMap.get(item.station_id) ?? item.station : item.station,
  }));

  const orders = ordersSource.map((order) => ({
    ...order,
    items: activeItems.filter((item) => item.order_id === order.order_id),
  }));

  const countMap = new Map<string, number>();
  activeItems.forEach((item) => {
    countMap.set(item.station_id, (countMap.get(item.station_id) || 0) + 1);
  });
  stations.forEach((station) => {
    station._count = { order_items: countMap.get(station.station_id) || 0 };
  });

  return { stations, menuItems, orders, activeItems };
}

function saveState(state: DemoState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getDemoState() {
  return readState();
}

export function subscribeDemoState(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}

export function getDemoStations() {
  return getDemoState().stations;
}

export function getDemoMenuItems() {
  return getDemoState().menuItems;
}

export function getDemoOrders() {
  return getDemoState().orders;
}

export function getDemoActiveItems() {
  return getDemoState().activeItems.filter((item) => item.status !== 'SERVED');
}

export function getDemoSummary() {
  const state = getDemoState();
  const activeItems = state.activeItems.filter((item) => item.status !== 'SERVED');
  const delayedItems = activeItems.filter((item) => item.expected_ready_time && new Date() > new Date(item.expected_ready_time) && item.status !== 'READY').length;
  const readyItems = activeItems.filter((item) => item.status === 'READY').length;
  const openOrders = state.orders.filter((order) => order.status === 'OPEN').length;
  const completedOrders = state.orders.filter((order) => order.status === 'COMPLETED').length;

  return {
    stationCount: state.stations.length,
    activeItems: activeItems.length,
    delayedItems,
    readyItems,
    openOrders,
    completedOrders,
  };
}

export async function createDemoMenuItem(input: {
  name: string;
  category: string;
  price: number;
  prep_time_minutes: number;
  station_id?: string | null;
}) {
  const state = getDemoState();
  const station = input.station_id ? state.stations.find((entry) => entry.station_id === input.station_id) : undefined;
  const newItem: MenuItem = {
    id: makeId('menu'),
    name: input.name,
    category: input.category,
    price: input.price,
    prep_time_minutes: input.prep_time_minutes,
    station_id: input.station_id || undefined,
    is_active: true,
    station,
  };
  const next = normalizeState({
    ...state,
    menuItems: [newItem, ...state.menuItems],
  });
  saveState(next);
  return newItem;
}

export async function assignDemoMenuStation(itemIds: string[], stationId: string) {
  const state = getDemoState();
  const station = state.stations.find((entry) => entry.station_id === stationId);
  const nextMenu = state.menuItems.map((item) =>
    itemIds.includes(item.id)
      ? { ...item, station_id: stationId, station }
      : item,
  );
  const next = normalizeState({ ...state, menuItems: nextMenu });
  saveState(next);
  return nextMenu;
}

export async function createDemoOrder(tableNo: string, items: { menu_item_id: string; quantity: number; notes?: string }[]) {
  const state = getDemoState();
  const menuMap = new Map(state.menuItems.map((item) => [item.id, item]));
  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = makeId('order');

  const createdItems: OrderItem[] = items.flatMap((entry) => {
    const menuItem = menuMap.get(entry.menu_item_id);
    if (!menuItem || !menuItem.station_id) return [];
    const quantity = Math.max(1, Number(entry.quantity || 1));
    const created: OrderItem = {
      id: makeId('item'),
      order_id: orderNumber,
      order_item_id: menuItem.name,
      station_id: menuItem.station_id,
      quantity,
      notes: entry.notes || '',
      status: 'PENDING',
      priority: 2,
      expected_ready_time: new Date(Date.now() + menuItem.prep_time_minutes * 60000).toISOString(),
      created_at: nowIso(),
      station: menuItem.station,
    };
    return [created];
  });

  const order: Order = {
    id: orderId,
    order_id: orderNumber,
    tableNo,
    status: 'OPEN',
    totalItems: createdItems.length,
    completedItems: 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    items: createdItems,
  };

  const next = normalizeState({
    ...state,
    orders: [order, ...state.orders],
    activeItems: [...createdItems, ...state.activeItems],
  });
  saveState(next);

  return { orderId: orderNumber, tableNo, items: createdItems };
}

export async function updateDemoMenuStation(itemId: string, stationId: string) {
  const state = getDemoState();
  const station = state.stations.find((entry) => entry.station_id === stationId);
  const next = normalizeState({
    ...state,
    menuItems: state.menuItems.map((item) => (item.id === itemId ? { ...item, station_id: stationId, station } : item)),
  });
  saveState(next);
}

export async function updateDemoItemStatus(itemId: string, status: OrderItem['status']) {
  const state = getDemoState();
  const updatedItems = state.activeItems.map((item) => {
    if (item.id !== itemId) return item;
    const patch: Partial<OrderItem> = { status };
    if (status === 'STARTED') patch.started_at = nowIso();
    if (status === 'ACCEPTED') patch.accepted_at = nowIso();
    if (status === 'READY') patch.ready_at = nowIso();
    if (status === 'SERVED') patch.served_at = nowIso();
    return { ...item, ...patch };
  });

  const nextOrders = state.orders.map((order) => ({
    ...order,
    items: updatedItems.filter((item) => item.order_id === order.order_id),
    completedItems: updatedItems.filter((item) => item.order_id === order.order_id && item.status === 'SERVED').length,
    totalItems: updatedItems.filter((item) => item.order_id === order.order_id).length,
  }));

  const next = normalizeState({ ...state, activeItems: updatedItems, orders: nextOrders });
  saveState(next);
  return updatedItems.find((item) => item.id === itemId);
}
