# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### PawSmart (`artifacts/pawsmart`) — Premium AI pet care + e-commerce for Pakistan
- Stack: React + Vite + Tailwind, wouter routing, TanStack Query, generated hooks from `@workspace/api-client-react`, zustand for demo auth, sonner for toasts, recharts for admin charts.
- Demo auth: header dropdown switches between `guest@pawsmart.pk` (default) and `admin@pawsmart.pk`. Persisted to `localStorage` (`pawsmart-demo-user`); `main.tsx` injects `x-demo-user` into every fetch. Switching reloads the page to refresh queries.
- Design: cream/beige background, sage primary, walnut foreground, terracotta accent. Playfair Display headlines, Manrope body. Soft rounded cards, no emojis in UI.
- Features: home, shop with filters/search/sort, product detail with quantity + add to cart, cart, checkout (cash on delivery, computes free shipping over Rs.5,000 and flat Rs.250 otherwise), orders list + detail with status timeline, pet profiles CRUD, three AI tools (breed detector, food recommender, symptom checker with explicit medical disclaimer), WhatsApp vet consult page (link `wa.me/923001234567`), admin dashboard (KPIs + 14-day revenue chart + top products + recent activity), admin products CRUD, admin orders status, admin users.
- Currency formatting: `lib/currency.ts` exports `formatPKR` using `Intl.NumberFormat('en-PK', { currency: 'PKR' })` rendered as `Rs. 1,234`.
- Seed images live under `artifacts/pawsmart/public/seed/` (16 product images + `hero.jpg`); DB references like `/seed/product_1.png`.

### API Server (`artifacts/api-server`)
- Express 5 server backing PawSmart. Uses `x-demo-user` header (read by `demoUser` middleware) to identify the calling user; auto-creates the user row when missing.
- Routes: `/api/products`, `/api/pets`, `/api/cart`, `/api/orders`, `/api/ai/*`, `/api/admin/*` (admin endpoints check role).
