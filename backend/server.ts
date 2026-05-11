import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const PORT = Number(process.env.PORT || 3000);
const ACTIVE_STATUSES = ["PENDING", "ACCEPTED", "STARTED", "READY"] as const;
const FINAL_STATUSES = ["SERVED"] as const;

app.use(express.json());
app.use(cors({ origin: true }));

function makeOrderNumber() {
  return `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
}

function makeTableNo() {
  return `T-${Math.floor(1 + Math.random() * 24)}`;
}

async function seedStationsIfNeeded() {
  const stationCount = await prisma.kitchenStation.count();
  if (stationCount > 0) {
    return prisma.kitchenStation.findMany({ orderBy: [{ sort_order: "asc" }, { station_name: "asc" }] });
  }

  const admin = await prisma.user.create({
    data: { uid: "demo-admin", name: "Demo Admin", role: "admin", pin: "1234" },
  });

  const chef = await prisma.user.create({
    data: { uid: "demo-chef", name: "Demo Chef", role: "chef", pin: "2468" },
  });

  await prisma.kitchenStation.createMany({
    data: [
      {
        station_name: "Fry",
        display_name: "Fry Station",
        station_code: "FRY-01",
        color_code: "#f97316",
        expected_time_minutes: 8,
        icon: "Flame",
        sort_order: 1,
      },
      {
        station_name: "Grill",
        display_name: "Grill & Roast",
        station_code: "GRL-01",
        color_code: "#ef4444",
        expected_time_minutes: 15,
        icon: "Beef",
        sort_order: 2,
      },
      {
        station_name: "Cold",
        display_name: "Salad & Cold Station",
        station_code: "CLD-01",
        color_code: "#22c55e",
        expected_time_minutes: 5,
        icon: "Leaf",
        sort_order: 3,
      },
    ],
  });

  const stations = await prisma.kitchenStation.findMany({
    orderBy: [{ sort_order: "asc" }, { station_name: "asc" }],
  });

  const fryStation = stations.find((station) => station.station_name.toLowerCase().includes("fry")) ?? stations[0];
  if (fryStation) {
    await prisma.chefStationMapping.create({
      data: {
        chef_id: chef.id,
        station_id: fryStation.station_id,
        is_primary: true,
        status: "online",
        last_seen_at: new Date(),
      },
    });
  }

  console.log(`Seeded demo users: ${admin.name}, ${chef.name}`);
  return stations;
}

async function seedMenuItemsIfNeeded(stations: Awaited<ReturnType<typeof prisma.kitchenStation.findMany>>) {
  const menuCount = await prisma.menuItem.count();
  if (menuCount > 0) {
    return;
  }

  const stationMap = new Map(stations.map((station) => [station.station_name.toLowerCase(), station]));
  const fallbackStation = stations[0];
  const fryStation = stationMap.get("fry") ?? fallbackStation;
  const grillStation = stationMap.get("grill") ?? fallbackStation;
  const coldStation = stationMap.get("cold") ?? fallbackStation;

  if (!fallbackStation) {
    return;
  }

  await prisma.menuItem.createMany({
    data: [
      { name: "French Fries", category: "Appetizers", price: 4.99, station_id: fryStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 6 },
      { name: "Cheeseburger", category: "Mains", price: 12.99, station_id: grillStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 12 },
      { name: "Chicken Nuggets", category: "Starters", price: 7.49, station_id: fryStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 8 },
      { name: "Caesar Salad", category: "Salads", price: 9.99, station_id: coldStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 5 },
      { name: "Grilled Steak", category: "Mains", price: 24.99, station_id: grillStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 20 },
      { name: "Club Sandwich", category: "Sandwiches", price: 10.49, station_id: grillStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 10 },
      { name: "Mozzarella Sticks", category: "Appetizers", price: 6.99, station_id: fryStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 7 },
      { name: "Iced Lemon Tea", category: "Drinks", price: 3.49, station_id: coldStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 2 },
      { name: "Margherita Pizza Slice", category: "Mains", price: 8.99, station_id: grillStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 14 },
      { name: "Chocolate Cake", category: "Desserts", price: 5.99, station_id: coldStation?.station_id ?? fallbackStation.station_id, prep_time_minutes: 4 },
    ],
  });

  console.log("Seeded demo menu items");
}

async function seedDemoOrdersIfNeeded(stations: Awaited<ReturnType<typeof prisma.kitchenStation.findMany>>) {
  const activeCount = await prisma.orderItemStation.count();
  if (activeCount > 0) {
    return;
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      name: {
        in: [
          "French Fries",
          "Cheeseburger",
          "Chicken Nuggets",
          "Caesar Salad",
          "Grilled Steak",
          "Club Sandwich",
          "Mozzarella Sticks",
          "Iced Lemon Tea",
          "Margherita Pizza Slice",
          "Chocolate Cake",
        ],
      },
    },
  });

  const menuMap = new Map(menuItems.map((item) => [item.name, item]));
  const fallbackStation = stations[0];
  const fryStation = stations.find((station) => station.station_name.toLowerCase().includes("fry")) ?? fallbackStation;
  const grillStation = stations.find((station) => station.station_name.toLowerCase().includes("grill")) ?? fallbackStation;
  const coldStation = stations.find((station) => station.station_name.toLowerCase().includes("cold")) ?? fallbackStation;

  if (!fallbackStation || menuItems.length === 0) {
    return;
  }

  const orderA = await prisma.order.create({
    data: {
      order_number: makeOrderNumber(),
      table_no: "T-12",
      status: "OPEN",
      total_items: 3,
      completed_items: 0,
    },
  });

  const orderB = await prisma.order.create({
    data: {
      order_number: makeOrderNumber(),
      table_no: "T-7",
      status: "IN_PROGRESS",
      total_items: 2,
      completed_items: 1,
    },
  });

  const now = Date.now();
  await prisma.orderItemStation.createMany({
    data: [
      {
        order_id: orderA.order_number,
        order_record_id: orderA.id,
        order_item_id: menuMap.get("Cheeseburger")?.name ?? "Cheeseburger",
        station_id: menuMap.get("Cheeseburger")?.station_id ?? grillStation?.station_id ?? fallbackStation.station_id,
        quantity: 2,
        notes: "No onions",
        status: "PENDING",
        expected_ready_time: new Date(now + 12 * 60000),
      },
      {
        order_id: orderA.order_number,
        order_record_id: orderA.id,
        order_item_id: menuMap.get("French Fries")?.name ?? "French Fries",
        station_id: menuMap.get("French Fries")?.station_id ?? fryStation?.station_id ?? fallbackStation.station_id,
        quantity: 1,
        status: "STARTED",
        started_at: new Date(now - 4 * 60000),
        expected_ready_time: new Date(now + 6 * 60000),
      },
      {
        order_id: orderA.order_number,
        order_record_id: orderA.id,
        order_item_id: menuMap.get("Caesar Salad")?.name ?? "Caesar Salad",
        station_id: menuMap.get("Caesar Salad")?.station_id ?? coldStation?.station_id ?? fallbackStation.station_id,
        quantity: 1,
        status: "READY",
        started_at: new Date(now - 9 * 60000),
        ready_at: new Date(now - 1 * 60000),
        expected_ready_time: new Date(now - 2 * 60000),
      },
      {
        order_id: orderB.order_number,
        order_record_id: orderB.id,
        order_item_id: menuMap.get("Grilled Steak")?.name ?? "Grilled Steak",
        station_id: menuMap.get("Grilled Steak")?.station_id ?? grillStation?.station_id ?? fallbackStation.station_id,
        quantity: 1,
        status: "ACCEPTED",
        accepted_at: new Date(now - 3 * 60000),
        expected_ready_time: new Date(now + 17 * 60000),
      },
      {
        order_id: orderB.order_number,
        order_record_id: orderB.id,
        order_item_id: menuMap.get("Chocolate Cake")?.name ?? "Chocolate Cake",
        station_id: menuMap.get("Chocolate Cake")?.station_id ?? coldStation?.station_id ?? fallbackStation.station_id,
        quantity: 2,
        status: "PENDING",
        notes: "Extra cream",
        expected_ready_time: new Date(now + 4 * 60000),
      },
    ],
  });

  await prisma.order.update({
    where: { id: orderA.id },
    data: { total_items: 3, completed_items: 1, status: "IN_PROGRESS" },
  });

  await prisma.order.update({
    where: { id: orderB.id },
    data: { total_items: 2, completed_items: 0, status: "OPEN" },
  });

  console.log("Seeded demo orders and active kitchen tickets");
}

async function seedData() {
  const stations = await seedStationsIfNeeded();
  await seedMenuItemsIfNeeded(stations);
  await seedDemoOrdersIfNeeded(stations);
}

async function getStationOverview() {
  return prisma.kitchenStation.findMany({
    orderBy: [{ sort_order: "asc" }, { station_name: "asc" }],
    include: {
      chef_mappings: {
        include: {
          chef: true,
        },
      },
      _count: {
        select: {
          order_items: {
            where: {
              status: {
                in: Array.from(ACTIVE_STATUSES),
              },
            },
          },
        },
      },
    },
  });
}

async function getMenuItems() {
  return prisma.menuItem.findMany({
    where: { is_active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      station: true,
    },
  });
}

async function getActiveItems() {
  return prisma.orderItemStation.findMany({
    where: {
      status: {
        in: Array.from(ACTIVE_STATUSES),
      },
    },
    orderBy: { created_at: "asc" },
    include: {
      station: true,
      order: true,
    },
  });
}

async function getOrders() {
  const orderRecords = await prisma.order.findMany({
    orderBy: { created_at: "desc" },
    include: {
      order_items: {
        include: {
          station: true,
        },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (orderRecords.length > 0) {
    return orderRecords.map((order) => ({
      id: order.id,
      order_id: order.order_number,
      tableNo: order.table_no,
      status: order.status,
      totalItems: order.total_items,
      completedItems: order.completed_items,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.order_items,
    }));
  }

  const fallbackItems = await prisma.orderItemStation.findMany({
    orderBy: { created_at: "desc" },
    include: { station: true },
  });

  const grouped = new Map<string, typeof fallbackItems>();
  for (const item of fallbackItems) {
    const current = grouped.get(item.order_id) || [];
    current.push(item);
    grouped.set(item.order_id, current);
  }

  return Array.from(grouped.entries()).map(([orderNumber, items]) => {
    const completedItems = items.filter((item) => FINAL_STATUSES.includes(item.status as (typeof FINAL_STATUSES)[number])).length;
    return {
      id: orderNumber,
      order_id: orderNumber,
      tableNo: null,
      status: completedItems === items.length ? "COMPLETED" : "OPEN",
      totalItems: items.length,
      completedItems,
      createdAt: items[0]?.created_at ?? new Date(),
      updatedAt: items[0]?.created_at ?? new Date(),
      items,
    };
  });
}

async function syncOrderAggregate(orderRecordId: string | null | undefined) {
  if (!orderRecordId) {
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderRecordId },
    include: { order_items: true },
  });

  if (!order) {
    return;
  }

  const completedItems = order.order_items.filter((item) => FINAL_STATUSES.includes(item.status as (typeof FINAL_STATUSES)[number])).length;
  const totalItems = order.order_items.length;
  const status = completedItems === totalItems && totalItems > 0 ? "COMPLETED" : completedItems > 0 ? "IN_PROGRESS" : "OPEN";

  await prisma.order.update({
    where: { id: order.id },
    data: {
      completed_items: completedItems,
      total_items: totalItems,
      status,
    },
  });
}

async function createOrderFromPayload(req: express.Request, res: express.Response) {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const tableNo = req.body?.tableNo || makeTableNo();

  if (items.length === 0) {
    return res.status(400).json({ error: "At least one menu item is required" });
  }

  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: items.map((item: { menu_item_id: string }) => item.menu_item_id),
        },
      },
    });

    if (menuItems.length === 0) {
      return res.status(400).json({ error: "No valid menu items were found" });
    }

    const orderNumber = makeOrderNumber();
    const orderRecord = await prisma.order.create({
      data: {
        order_number: orderNumber,
        table_no: tableNo,
        status: "OPEN",
        total_items: 0,
        completed_items: 0,
      },
    });

    const createdItems = [];

    for (const payload of items as Array<{ menu_item_id: string; quantity?: number; notes?: string }>) {
      const menuItem = menuItems.find((item) => item.id === payload.menu_item_id);
      if (!menuItem || !menuItem.station_id) {
        continue;
      }

      const quantity = Math.max(1, Number(payload.quantity || 1));
      const expectedReadyTime = new Date(Date.now() + menuItem.prep_time_minutes * 60000);
      const createdItem = await prisma.orderItemStation.create({
        data: {
          order_id: orderNumber,
          order_record_id: orderRecord.id,
          order_item_id: menuItem.name,
          station_id: menuItem.station_id,
          quantity,
          notes: payload.notes || "",
          expected_ready_time: expectedReadyTime,
        },
        include: {
          station: true,
          order: true,
        },
      });

      createdItems.push(createdItem);
      io.to(`station-${createdItem.station_id}`).emit("new-item", createdItem);
    }

    await prisma.order.update({
      where: { id: orderRecord.id },
      data: {
        total_items: createdItems.length,
      },
    });

    const response = {
      orderId: orderNumber,
      tableNo,
      items: createdItems,
    };

    io.emit("order-created", response);
    res.status(201).json(response);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/auth/login", async (req, res) => {
  const { uid, name, role, pin } = req.body ?? {};

  if (!uid || !name || !role) {
    return res.status(400).json({ error: "uid, name, and role are required" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { uid },
      create: {
        uid,
        name,
        role,
        pin: pin || null,
      },
      update: {
        name,
        role,
        pin: pin || null,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

app.get("/api/stations", async (_req, res) => {
  try {
    const stations = await getStationOverview();
    res.json(stations);
  } catch (error) {
    console.error("Failed to fetch stations:", error);
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

app.get("/api/menu", async (_req, res) => {
  try {
    const menu = await getMenuItems();
    res.json(menu);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

app.post("/api/menu", async (req, res) => {
  const { name, category, price, prep_time_minutes, station_id } = req.body ?? {};

  if (!name || !category || price === undefined || prep_time_minutes === undefined) {
    return res.status(400).json({ error: "name, category, price, and prep_time_minutes are required" });
  }

  try {
    const createdItem = await prisma.menuItem.create({
      data: {
        name: String(name).trim(),
        category: String(category).trim(),
        price: Number(price),
        prep_time_minutes: Number(prep_time_minutes),
        station_id: station_id || null,
        is_active: true,
      },
      include: {
        station: true,
      },
    });

    io.emit("menu-updated", createdItem);
    res.status(201).json(createdItem);
  } catch (error) {
    console.error("Failed to create menu item:", error);
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

app.get("/api/active-items", async (_req, res) => {
  try {
    const items = await getActiveItems();
    res.json(items);
  } catch (error) {
    console.error("Failed to fetch active items:", error);
    res.status(500).json({ error: "Failed to fetch active items" });
  }
});

app.get("/api/orders", async (_req, res) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/api/analytics/summary", async (_req, res) => {
  try {
    const [stations, activeItems, orders] = await Promise.all([
      getStationOverview(),
      getActiveItems(),
      getOrders(),
    ]);

    const delayedItems = activeItems.filter((item) => {
      if (!item.expected_ready_time) {
        return false;
      }
      return new Date() > new Date(item.expected_ready_time) && item.status !== "READY";
    }).length;

    res.json({
      stationCount: stations.length,
      activeItems: activeItems.length,
      delayedItems,
      readyItems: activeItems.filter((item) => item.status === "READY").length,
      openOrders: orders.filter((order) => order.status !== "COMPLETED").length,
      completedOrders: orders.filter((order) => order.status === "COMPLETED").length,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.post("/api/orders", createOrderFromPayload);

app.post("/api/orders/mock", createOrderFromPayload);

app.patch("/api/items/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, chef_id } = req.body ?? {};

  if (!ACTIVE_STATUSES.includes(status) && !FINAL_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Unsupported status value" });
  }

  try {
    const current = await prisma.orderItemStation.findUnique({
      where: { id },
    });

    if (!current) {
      return res.status(404).json({ error: "Order item not found" });
    }

    const updated = await prisma.orderItemStation.update({
      where: { id },
      data: {
        status,
        chef_id: chef_id || current.chef_id,
        started_at: status === "STARTED" ? new Date() : current.started_at,
        accepted_at: status === "ACCEPTED" ? new Date() : current.accepted_at,
        ready_at: status === "READY" ? new Date() : current.ready_at,
        served_at: status === "SERVED" ? new Date() : current.served_at,
      },
      include: {
        station: true,
        order: true,
      },
    });

    await syncOrderAggregate(updated.order_record_id);

    io.emit("item-updated", updated);
    io.to(`station-${updated.station_id}`).emit("item-updated", updated);
    io.emit("order-updated", updated.order_record_id);

    res.json(updated);
  } catch (error) {
    console.error("Failed to update item:", error);
    res.status(500).json({ error: "Update failed" });
  }
});

app.patch("/api/menu/:id/station", async (req, res) => {
  const { id } = req.params;
  const { station_id } = req.body ?? {};

  if (!station_id) {
    return res.status(400).json({ error: "station_id is required" });
  }

  try {
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: { station_id },
      include: { station: true },
    });
    res.json(updatedItem);
  } catch (error) {
    console.error("Failed to update menu mapping:", error);
    res.status(500).json({ error: "Failed to update mapping" });
  }
});

app.patch("/api/stations/:id/chef", async (req, res) => {
  const { id } = req.params;
  const { chef_uid, online } = req.body ?? {};

  if (!chef_uid) {
    return res.status(400).json({ error: "chef_uid is required" });
  }

  try {
    const chef = await prisma.user.findUnique({ where: { uid: chef_uid } });
    if (!chef) {
      return res.status(404).json({ error: "Chef not found" });
    }

    const mapping = await prisma.chefStationMapping.upsert({
      where: {
        chef_id_station_id: {
          chef_id: chef.id,
          station_id: id,
        },
      },
      create: {
        chef_id: chef.id,
        station_id: id,
        is_primary: true,
        status: online ? "online" : "offline",
        last_seen_at: new Date(),
      },
      update: {
        status: online ? "online" : "offline",
        last_seen_at: new Date(),
      },
      include: {
        chef: true,
        station: true,
      },
    });

    res.json(mapping);
  } catch (error) {
    console.error("Failed to update chef mapping:", error);
    res.status(500).json({ error: "Failed to update station assignment" });
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-station", (stationId) => {
    socket.join(`station-${stationId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

async function startServer() {
  await seedData();

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
