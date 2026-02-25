# Rivalry

**Rival-based goal accountability platform** — Set personal goals, get matched with rivals pursuing similar targets, deposit credits as stakes, follow structured roadmaps with milestones, submit proof of progress, and compete for prize pools.

Think "Duolingo meets sports betting for self-improvement."

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Backend | NestJS 11 |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT + Passport + bcrypt |
| Real-time | Socket.IO |
| Styling | Vanilla CSS (dark glassmorphism) |

## Project Structure

```
rivalry/
├── backend/          # NestJS API server
│   ├── src/          # 12 modules (auth, users, goals, rooms, wallet, etc.)
│   └── prisma/       # Schema, migrations, seed
├── frontend/         # Next.js app
│   └── src/
│       ├── app/      # 15 routes (pages)
│       ├── components/
│       ├── context/  # Auth context
│       └── lib/      # API client
└── package.json      # Monorepo root with workspace scripts
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** database (or Supabase)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd rivalry
npm install          # installs all workspaces
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL, JWT_SECRET, etc.

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your API URL
```

### 3. Database setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start development

```bash
npm run dev          # starts both backend and frontend
```

- **Backend**: http://localhost:4000/api
- **Frontend**: http://localhost:3000

## Available Scripts (root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend in dev mode |
| `npm run build` | Build both projects |
| `npm run lint` | Lint both projects |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |

## Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@rivalry.app | password123 |
| Admin | mod@rivalry.app | password123 |
