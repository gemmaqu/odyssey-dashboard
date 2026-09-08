# Architecture & decisions

## The contract pipeline (the core idea)

Types for backend data are **generated, never duplicated**:

```
Drizzle schema  →  drizzle-zod  →  @hono/zod-openapi  →  openapi.json  →  Orval  →  React Query hooks + TS types
   (truth)          (validation)     (typed routes)        (contract)       (@odyssey/api-client)
```

1. **`services/backend/src/db/schema.ts`** is the single persisted source of truth.
   Money is stored as integer **cents** to avoid float drift.
2. **drizzle-zod** derives Zod schemas from the tables; they're refined into request
   / response shapes in `src/schemas/*`. Wire dates are ISO strings.
3. **`@hono/zod-openapi`** registers each route with those Zod schemas and produces an
   OpenAPI 3.1 document. `pnpm gen:contract` introspects the Hono app in Node and
   writes `openapi.json` (no server or DB required).
4. **Orval** turns `openapi.json` into `@odyssey/api-client`: typed models, React
   Query hooks, and a small fetch mutator. **These files are never hand-edited.**
5. The dashboard consumes **only** generated hooks/types. Changing a column and
   re-running `gen:contract` propagates the type through to the UI, where `tsc`
   catches any break.

### No duplicated enums

Order status values and the legal transitions between them live once, in
**`packages/types`**. The Postgres `pgEnum`, the backend state-machine service, and
the frontend badges/buttons all import from there — so the database, API, and UI can
never disagree on the allowed statuses.

## Layering

- **Presentational UI** lives in `packages/ui` (design system) and app components.
- **Data fetching + business logic** live in **feature hooks** (`apps/dashboard/src/features/*`)
  that wrap the generated hooks (unwrapping the response envelope via React Query's
  `select`, invalidating on mutation). Pages stay thin and declarative.
- **Backend business logic** lives in **services** (`services/backend/src/services/*`),
  not in route handlers. Routes only wire validation → service → response.

## Deliberate backend behavior

Status is **not** a client-settable field. Orders advance only through
`POST /orders/:id/transitions` with an *action*, validated against the shared state
machine; illegal transitions return `409`. Order creation:

- validates the customer and every referenced item exists,
- **rejects unavailable items** (`422`),
- **computes totals server-side** from live prices (the client sends only item ids +
  quantities and never money),
- snapshots item name + unit price onto the order line so history stays stable,
- optionally auto-accepts based on settings.

Errors use one typed envelope (`{ error: { code, message, details? } }`) surfaced to
the client as a typed `ApiError`.

## Database on Cloudflare Workers

The Worker talks to Postgres through a **Hyperdrive** binding using **postgres-js**
(`nodejs_compat`). In `wrangler dev` the binding points at local Docker Postgres via
`localConnectionString`, so no Cloudflare account is needed to run locally, while the
production path (Hyperdrive pooling in front of Postgres) is genuinely represented.
The pool is memoized per connection string on the module scope, which persists across
requests within a Worker isolate.

Migrations and seeding run as plain Node scripts against `DATABASE_URL`, independent
of the Worker runtime.

## Design system

`@odyssey/ui` is token-driven: primitive tokens (color scales, spacing, type scale,
radii, shadows) feed a semantic light/dark **theme** consumed through `useTheme()`.
Primitives are built on React Native core components via `react-native-web`, so the
system is web-first but native-ready, and every color/spacing value is centralized
rather than scattered. The **UI Kit** route (`/ui`) documents tokens and every
component state.

## Testing

- **Backend order flows** (`services/backend/test`): server-side pricing, unavailable
  / unknown rejection, and the full status state machine, run against a dedicated
  `odyssey_test` database that is created and migrated automatically. Tested at the
  service layer (HTTP codes asserted via the typed `AppError`) for fast, deterministic
  runs.
- **State machine** (`packages/types`), **cart pricing** (`apps/dashboard`), and
  **money parsing** (`packages/shared`) are unit tested.

## Tradeoffs & incomplete areas

- **No authentication / multi-tenant.** Out of scope for the slice; the whole API is
  single-restaurant.
- **Generated client is committed** (not git-ignored) so the repo browses and
  type-checks without a generate step. It is still fully generated — re-run
  `pnpm gen:contract`.
- **Order list pagination** is server-supported (`limit`/`offset`) but the UI loads a
  large page rather than exposing pager controls.
- **Settings is a single row**; opening-hours strings are lightly validated.
- **Native** is architecturally ready (RN primitives, no web-only APIs in components)
  but only web has been exercised.
- **Testing is targeted, not exhaustive** — key flows and pure logic, per the brief.
- `@hono/zod-openapi` and `drizzle-zod` must share one Zod instance for the OpenAPI
  metadata to attach; the workspace hoists a single `zod`, and the backend tests
  deliberately exercise the service layer to stay clear of that constraint.
