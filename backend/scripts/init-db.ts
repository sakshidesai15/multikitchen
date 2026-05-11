import "dotenv/config";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const connection = new URL(connectionString);
connection.searchParams.delete("sslmode");
connection.searchParams.delete("pgbouncer");
connection.searchParams.delete("connection_limit");

const client = new Client({
  connectionString: connection.toString(),
  ssl: { rejectUnauthorized: false },
});

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
  `CREATE TABLE IF NOT EXISTS "KitchenStation" (
    "station_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "restaurant_id" text,
    "station_name" text NOT NULL,
    "display_name" text NOT NULL,
    "station_code" text NOT NULL UNIQUE,
    "color_code" text NOT NULL,
    "icon" text,
    "priority" integer NOT NULL DEFAULT 0,
    "expected_time_minutes" integer NOT NULL DEFAULT 10,
    "max_parallel_capacity" integer NOT NULL DEFAULT 5,
    "auto_accept_orders" boolean NOT NULL DEFAULT true,
    "allow_manual_assignment" boolean NOT NULL DEFAULT true,
    "sound_alert_enabled" boolean NOT NULL DEFAULT true,
    "printer_enabled" boolean NOT NULL DEFAULT false,
    "sort_order" integer NOT NULL DEFAULT 0,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "Order" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_number" text NOT NULL UNIQUE,
    "table_no" text,
    "status" text NOT NULL DEFAULT 'OPEN',
    "total_items" integer NOT NULL DEFAULT 0,
    "completed_items" integer NOT NULL DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "uid" text NOT NULL UNIQUE,
    "name" text NOT NULL,
    "role" text NOT NULL,
    "pin" text,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "ChefStationMapping" (
    "mapping_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "chef_id" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "station_id" uuid NOT NULL REFERENCES "KitchenStation"("station_id") ON DELETE CASCADE,
    "role" text NOT NULL DEFAULT 'CHEF',
    "shift_start" text,
    "shift_end" text,
    "is_primary" boolean NOT NULL DEFAULT false,
    "skill_level" integer NOT NULL DEFAULT 1,
    "max_order_load" integer NOT NULL DEFAULT 5,
    "current_active_orders" integer NOT NULL DEFAULT 0,
    "auto_assign_enabled" boolean NOT NULL DEFAULT true,
    "status" text NOT NULL DEFAULT 'offline',
    "last_seen_at" timestamptz,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "ChefStationMapping_chef_id_station_id_key" UNIQUE ("chef_id", "station_id")
  );`,
  `CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "category" text NOT NULL,
    "price" double precision NOT NULL,
    "station_id" uuid REFERENCES "KitchenStation"("station_id") ON DELETE SET NULL,
    "prep_time_minutes" integer NOT NULL DEFAULT 10,
    "is_active" boolean NOT NULL DEFAULT true
  );`,
  `CREATE TABLE IF NOT EXISTS "OrderItemStation" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" text NOT NULL,
    "order_record_id" uuid REFERENCES "Order"("id") ON DELETE CASCADE,
    "order_item_id" text NOT NULL,
    "station_id" uuid NOT NULL REFERENCES "KitchenStation"("station_id") ON DELETE CASCADE,
    "chef_id" uuid,
    "status" text NOT NULL DEFAULT 'PENDING',
    "priority" integer NOT NULL DEFAULT 2,
    "quantity" integer NOT NULL DEFAULT 1,
    "started_at" timestamptz,
    "accepted_at" timestamptz,
    "ready_at" timestamptz,
    "served_at" timestamptz,
    "expected_ready_time" timestamptz,
    "actual_preparation_seconds" integer,
    "delay_reason" text,
    "notes" text,
    "timer_started" boolean NOT NULL DEFAULT false,
    "escalated" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "ChefActivityLog" (
    "log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "chef_id" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "station_id" uuid NOT NULL REFERENCES "KitchenStation"("station_id") ON DELETE CASCADE,
    "order_item_id" uuid NOT NULL REFERENCES "OrderItemStation"("id") ON DELETE CASCADE,
    "action_type" text NOT NULL,
    "old_status" text,
    "new_status" text NOT NULL,
    "action_time" timestamptz NOT NULL DEFAULT now(),
    "device_id" text,
    "notes" text,
    "ip_address" text,
    "session_id" text
  );`,
  `CREATE TABLE IF NOT EXISTS "StationPerformance" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "station_id" uuid NOT NULL REFERENCES "KitchenStation"("station_id") ON DELETE CASCADE,
    "date" timestamptz NOT NULL DEFAULT now(),
    "total_orders" integer NOT NULL DEFAULT 0,
    "avg_preparation_time" double precision NOT NULL DEFAULT 0,
    "max_preparation_time" double precision NOT NULL DEFAULT 0,
    "delayed_orders" integer NOT NULL DEFAULT 0,
    "completed_orders" integer NOT NULL DEFAULT 0,
    "cancelled_orders" integer NOT NULL DEFAULT 0,
    "utilization_percentage" double precision NOT NULL DEFAULT 0,
    "peak_hour" text,
    "avg_queue_length" double precision NOT NULL DEFAULT 0,
    "chef_efficiency_score" double precision NOT NULL DEFAULT 0,
    "generated_at" timestamptz NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "StationQueue" (
    "queue_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "station_id" uuid NOT NULL REFERENCES "KitchenStation"("station_id") ON DELETE CASCADE,
    "order_item_id" uuid NOT NULL UNIQUE REFERENCES "OrderItemStation"("id") ON DELETE CASCADE,
    "queue_position" integer NOT NULL,
    "queued_at" timestamptz NOT NULL DEFAULT now(),
    "started_at" timestamptz,
    "status" text NOT NULL DEFAULT 'QUEUED'
  );`,
  `CREATE TABLE IF NOT EXISTS "KitchenAlert" (
    "alert_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "station_id" uuid NOT NULL REFERENCES "KitchenStation"("station_id") ON DELETE CASCADE,
    "alert_type" text NOT NULL,
    "severity" text NOT NULL,
    "message" text NOT NULL,
    "triggered_at" timestamptz NOT NULL DEFAULT now(),
    "resolved_at" timestamptz
  );`,
];

async function main() {
  await client.connect();
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    console.log("PostgreSQL schema created successfully.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
