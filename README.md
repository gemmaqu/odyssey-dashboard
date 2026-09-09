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

Install these first:

- **Node ≥ 20** — https://nodejs.org
- **pnpm** — `npm install -g pnpm` (or `corepack enable`)
- **Docker Desktop** — https://www.docker.com/products/docker-desktop — and make sure
  it is **running** before step 4 (the whale icon in the menu bar is steady). Docker
  runs the local Postgres.

## Quick start

Run these one line at a time from a terminal. Steps 1–6 are one terminal; step 7 is a
**second** terminal.

```bash
git clone https://github.com/gemmaqu/odyssey-dashboard.git
```

```bash
cd odyssey-dashboard
```

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
pnpm db:up
```

```bash
pnpm db:migrate
```

```bash
pnpm db:seed
```

```bash
pnpm dev:backend
```

Leave that running. Open a **new terminal**, then:

```bash
cd odyssey-dashboard
```

```bash
pnpm dev:dashboard
```

Now open **http://localhost:8081** in your browser. The first load takes ~10–30s while
it builds. Visit **UI Kit** in the sidebar for the design-system showcase, and the API
docs (Swagger UI) are at **http://localhost:8787/docs**.

> Steps 5–7 combined: `pnpm db:reset` re-creates + migrates + seeds in one command.
> The generated API client is already committed; to regenerate it run `pnpm gen:contract`.
>
> **If `pnpm db:up` errors:** Docker Desktop isn't running — start it, wait for the whale
> icon to settle, then re-run. **If a port is in use:** free ports 5432 (Postgres),
> 8787 (backend), 8081 (dashboard).

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
