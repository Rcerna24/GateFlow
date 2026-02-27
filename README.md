# GateFlow – Smart Campus Security System

A centralized platform for campus entry monitoring, visitor control, incident management, and emergency operations at Visayas State University.

## Tech Stack

| Layer     | Stack                                      |
| --------- | ------------------------------------------ |
| Front-end | React 19 · TypeScript · Vite · Tailwind CSS |
| Back-end  | NestJS · Prisma · PostgreSQL (Supabase)     |

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **PostgreSQL** database (Supabase or local)

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd GateFlow
```

### 2. Back-end setup

```bash
cd back-end
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your database credentials (see `.env.example` for the required variables).

Generate the Prisma client and push the schema:

```bash
npx prisma generate
npx prisma db push
```

Seed the database (optional):

```bash
npm run db:seed
```

Start the dev server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:5000`.

### 3. Front-end setup

```bash
cd front-end
npm install
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Project Structure

```
GateFlow/
├── back-end/          # NestJS API
│   ├── prisma/        # Schema & seed
│   └── src/           # Modules, controllers, services
├── front-end/         # React SPA
│   └── src/
│       ├── components/ui/   # Reusable UI components
│       └── pages/           # Route pages
└── README.md
```

## Available Scripts

### Back-end (`back-end/`)

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `npm run start:dev` | Start in watch mode             |
| `npm run build`     | Build for production            |
| `npm run db:push`   | Push Prisma schema to database  |
| `npm run db:seed`   | Seed the database               |
| `npm run db:studio` | Open Prisma Studio              |

### Front-end (`front-end/`)

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start Vite dev server    |
| `npm run build` | Production build         |

## Environment Variables

Copy `.env.example` → `.env` in the `back-end/` directory. Required variables:

| Variable             | Description                    |
| -------------------- | ------------------------------ |
| `DATABASE_URL`       | PostgreSQL connection string   |
| `JWT_ACCESS_SECRET`  | Secret for access tokens       |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens      |
| `PORT`               | API port (default: 5000)       |
| `CORS_ORIGIN`        | Allowed origin for CORS        |
