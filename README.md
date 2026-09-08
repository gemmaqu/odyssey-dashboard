# Odyssey — Restaurant Operations Dashboard

A small full-stack restaurant operations product: a polished dashboard backed by a
real ordering system. Built on the required stack with an end-to-end **generated
contract** so the frontend never hand-writes types for backend data.

```
Drizzle schema → drizzle-zod → Hono/OpenAPI → Orval → generated React Query hooks
```

---

## Stack

| Layer            | Choice                                                        |
| ---------------- | ------------------------------------------------------------- |
| Monorepo         | pnpm workspace + Turborepo                                    |
| Dashboard        | Expo (React Native + Web), Expo Router, React Query           |
| Backend          | Hono on Cloudflare Workers (`@hono/zod-openapi`)              |
| Database         | PostgreSQL + Drizzle ORM (via Hyperdrive / postgres-js)       |
| Contract         | drizzle-zod → OpenAPI 3.1 → Orval (fetch + React Query hooks) |
| Design system    | Token-driven RN primitives (`@odyssey/ui`), web-first         |

## Repository layout

```
apps/
  dashboard/          Expo app (web-first). Pages, feature hooks, app components.
services/
  backend/            Hono API, Drizzle schema, drizzle-zod schemas, services, tests.
packages/
  types/              Order status enum + state machine (single source of truth).
  api-client/         Orval-generated client + typed fetch mutator (never hand-edited).
  ui/                 Design system: tokens, theme, primitives.
  shared/             Framework-agnostic utilities (money, dates).
```

## Prerequisites

- Node ≥ 20 and **pnpm** (`corepack enable` or `npm i -g pnpm`)
- **Docker** (for local Postgres)

## Quick start

```bash
# 1. Install
pnpm install

# 2. Copy env (defaults match docker-compose)
cp .env.example .env

# 3. Start Postgres, run migrations, and seed demo data
pnpm db:up
pnpm db:migrate
pnpm db:seed
# (or do all three + reset in one go: pnpm db:reset)

# 4. Generate the API contract + client (already committed, but this refreshes it)
pnpm gen:contract

# 5. Run the backend (Cloudflare Worker via wrangler dev, on http://localhost:8787)
pnpm dev:backend

# 6. In another terminal, run the dashboard (web, on http://localhost:8081)
pnpm dev:dashboard
```

Open the dashboard, and visit **UI Kit** in the sidebar for the design-system
showcase. The API docs (Swagger UI) are at `http://localhost:8787/docs`.

## Seeding

`pnpm db:seed` loads a deterministic dataset: 5 categories, 15 menu items (one
intentionally unavailable), 8 customers, and 28 orders spread across every status
and the last 12 days — enough to populate KPIs, CRM spend, and popular items. It is
re-runnable (it truncates first). `pnpm db:reset` drops the volume and rebuilds from
scratch.

## Scripts

| Script                | What it does                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `pnpm dev:dashboard`  | Expo web dev server                                              |
| `pnpm dev:backend`    | `wrangler dev` (local Cloudflare Worker + Hyperdrive → Postgres) |
| `pnpm gen:contract`   | Emit `openapi.json` from Hono, then run Orval                    |
| `pnpm lint`           | ESLint across the workspace                                      |
| `pnpm typecheck`      | `tsc --noEmit` in every package                                  |
| `pnpm test`           | Vitest (backend order flows, state machine, cart, money)         |
| `pnpm db:up/down`     | Start / stop Postgres                                            |
| `pnpm db:migrate`     | Apply Drizzle migrations                                         |
| `pnpm db:seed`        | Load demo data                                                   |
| `pnpm db:reset`       | Recreate volume + migrate + seed                                 |

## Environment

| Var                   | Default                                          | Used by                    |
| --------------------- | ------------------------------------------------ | -------------------------- |
| `DATABASE_URL`        | `postgres://odyssey:odyssey@localhost:5432/...`  | migrations, seed, tests    |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8787`                          | dashboard → backend calls  |

## Testing

- **Backend** (`services/backend`): order-flow tests against a dedicated
  `odyssey_test` database (created + migrated automatically) — server-side totals,
  unavailable-item and validation rejection, and the full status state machine.
- **State machine** (`packages/types`): transition legality, terminal states.
- **Cart / money** (`apps/dashboard`, `packages/shared`): pricing math and parsing.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and tradeoffs.
