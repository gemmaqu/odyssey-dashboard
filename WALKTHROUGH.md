# Walkthrough script (~6 min)

A Loom-style script for demoing the project. **Bold** = screen action; plain text = narration.

Before recording: `pnpm db:reset` for a clean dataset, and confirm both servers are up
(backend `:8787`, dashboard `:8081`). Keep the browser ~1280px wide. Live API docs at
`http://localhost:8787/docs`.

---

## 0:00 — Intro (20s)
> "This is a restaurant operations dashboard built on Odyssey's stack — pnpm + Turborepo, Expo for the dashboard, Hono on Cloudflare Workers, Postgres with Drizzle, and a fully generated API contract. The thing I optimized for is architecture: one source of truth, and types that flow from the database all the way to the frontend without ever being hand-written."

## 0:20 — The contract pipeline (75s)
**Open `ARCHITECTURE.md`** — point at the diagram.
> "Data truth starts in the Drizzle schema. `drizzle-zod` derives Zod schemas, `@hono/zod-openapi` turns the routes into an OpenAPI document, and Orval generates the React Query hooks and TypeScript types into `packages/api-client`."

**Open `packages/types/src/order-status.ts`.**
> "Order status and the legal transitions between statuses are defined exactly once here. The Postgres enum, the backend, and the frontend all import from this — so there are zero duplicated status enums across the stack."

**Open a file under `packages/api-client/src/generated/`.**
> "This whole folder is generated and never hand-edited. Change a column, re-run `pnpm gen:contract`, and the type flows through — TypeScript flags any break in the UI."

## 1:35 — Deliberate backend behavior (75s)
**Open `services/backend/src/services/orders.service.ts` → `createOrder`.**
> "Order creation is real business logic, not a passthrough. The client sends item IDs and quantities — never money. The server validates the customer, rejects unavailable items with a 422, and computes totals from live prices. It snapshots item name and price onto the line so history stays stable if the menu changes later."

**Scroll to `transitionOrder`.**
> "Status is never a client-set field. It goes through this shared state machine — illegal transitions return a 409."

## 2:50 — See it run (110s)
**Browser → Home.**
> "The dashboard on web. Home pulls KPIs — orders, revenue, pending, average — plus popular items and recent orders, all from the backend through the generated hooks."

**Orders → "+ New order". Pick a customer, add an item.**
> "Totals update live — subtotal, 8% tax, total — but the server is the source of truth and recomputes them." **Click Create order.**
> "It posts, invalidates the query, and the new order appears at the top as Pending."

**Click the new order → Accept.**
> "The detail view only offers actions valid for the current status. I accept it, and the actions update to 'Start preparing' and 'Cancel' — driven by that same backend state machine."

**Click CRM, then Menu.**
> "CRM rolls up order count and spend per customer. Menu manages categories, pricing, and availability — I can toggle an item unavailable inline, and it immediately can't be added to an order."

## 4:40 — Design system (50s)
**UI Kit → toggle dark mode in the sidebar.**
> "The design system is token-driven — color, spacing, type scale, radius, elevation — with a semantic light and dark theme. Every component reads from the theme, so one toggle re-themes the whole app. This `/ui` route documents the tokens and every primitive and its states."

## 5:30 — Testing & DX (25s)
**Terminal: `pnpm test`.**
> "Testing is targeted, not exhaustive: the key order flows — server-side totals, availability and validation rejection, and the full state machine — plus pricing and money logic. Typecheck and lint are clean, with single-command scripts for dev, seed, and contract generation."

## 5:55 — Close (15s)
> "So: fidelity to the stack, a generated contract with a single source of truth, deliberate backend behavior, and a reusable design system — scope kept to a clean, coherent slice. Thanks for watching."
