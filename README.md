# KitchenFlow KDS

This repo is now split into two separate apps:

- `frontend/` for the Vite + React UI
- `backend/` for the Express + Prisma + PostgreSQL API

## Local setup

1. Install frontend deps:
   `cd frontend && npm install`
2. Install backend deps:
   `cd backend && npm install`
3. Configure env files:
   - `frontend/.env` from `frontend/.env.example`
   - `backend/.env` from `backend/.env.example`
4. Generate Prisma client:
   `cd backend && npm run prisma:generate`
5. Push the schema to PostgreSQL:
   `cd backend && npm run db:push`
6. Start the backend:
   `cd backend && npm run dev`
7. Start the frontend:
   `cd frontend && npm run dev`

## PostgreSQL connection

The backend connects to PostgreSQL through Prisma using `DATABASE_URL` in `backend/.env`.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

For Supabase, use the **Transaction pooler** connection string from the dashboard for the app runtime:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:YOUR_PASSWORD@aws-1-<region>.pooler.supabase.com:6543/postgres?schema=public&sslmode=require&pgbouncer=true&connection_limit=1"
```

If you later want a direct database connection for migrations or admin tools, Supabase also shows a separate **Direct** connection string in the dashboard.

After setting it, run:

```bash
cd backend
npm run prisma:generate
npm run db:push
```

## Vercel deployment

- If you deploy the repo root to Vercel, it will use [vercel.json](./vercel.json) to build `frontend/` and serve the static app.
- Deploy `backend/` as a separate project or API service. Do not deploy the current Express + Socket.IO backend as-is to Vercel.
- Set `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in the frontend project to your backend URL.
- If you deploy `frontend/` as its own Vercel project, set the same env vars there and leave the backend on another host.

## Root helpers

From the repo root:

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build:frontend`
