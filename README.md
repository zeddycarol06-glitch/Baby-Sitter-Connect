# BabySitter Connect

An on-demand, two-sided childcare marketplace. Parents search and book trusted local babysitters; sitters manage requests, availability, earnings, and verification; admins keep the marketplace safe and healthy.

The frontend is a production-shaped **Next.js App Router** application with a fully typed REST layer and a realistic in-browser **Mock Service Worker (MSW)** backend, so every flow can be explored without a server.

## Highlights

- **Three role experiences** — parent, babysitter, and admin, each with its own guarded workspace and navigation.
- **End-to-end booking lifecycle** — request → sitter accepts → parent pays → care completed → parent reviews.
- **Trust & safety** — sitter verification uploads, an admin review queue, disputes, refunds, and account suspension.
- **Realistic states everywhere** — loading skeletons, empty states, error boundaries, and retry actions on every data screen.
- **Accessible, mobile-first UI** — keyboard-friendly controls, labelled form fields, visible focus, skip link, and light/dark themes.
- **Mock-first, API-ready** — swap one environment variable to point the same typed client at a real backend.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript strict) |
| UI | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Client state | Zustand |
| HTTP | Typed `fetch` wrapper in `src/lib/api` (axios is installed for future use) |
| Mocks | MSW v2 with a mutable in-memory database |
| Icons / motion | lucide-react, tw-animate-css |
| Dates / money | date-fns, `Intl.NumberFormat` |
| Quality | ESLint, Prettier, `tsc --noEmit` |

## Getting started

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Node 20+ is recommended. The MSW worker is already checked into `public/mockServiceWorker.js`.

### Demo accounts

All demo users share the password **`password123`**.

| Role | Email |
| --- | --- |
| Parent | `parent@example.com` |
| Babysitter | `maya@example.com` |
| Admin | `admin@example.com` |

The sign-in screen also includes one-click demo buttons. New parent/sitter accounts can be registered from `/register`; registered users live in memory only. New sitters are taken to `/onboarding/sitter-profile` first, where they complete their photo, base location, language, experience, DOB, certifications, and introduction before moving on to verification. Existing sitters can reopen the same guide from **Profile → Setup guide**.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint across the repo |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | TypeScript without emitting |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm run msw:init` | Re-generate the MSW worker in `public/` |

## Environment variables

`.env.example` documents the two public variables:

```env
# Base URL for the REST API. With mocks enabled this can stay "/api".
NEXT_PUBLIC_API_URL=/api

# Toggle the MSW mock API. Set to "false" to talk to the real backend.
NEXT_PUBLIC_USE_MOCKS=true
```

Restart the dev server after changing them.

### Switching from mocks to a real API

1. Set `NEXT_PUBLIC_USE_MOCKS=false`.
2. Point `NEXT_PUBLIC_API_URL` at your backend (for example `https://api.example.com`).
3. Implement the endpoints documented below. The client sends JSON and expects JSON; errors should use `{ "message": string, "fieldErrors"?: Record<string, string[]> }`.
4. Replace the demo cookie auth in `src/app/api/auth/*` and `src/proxy.ts` with your provider. In this repo, auth is mocked with Next route handlers and an httpOnly `bs_session` cookie; the browser mock API identifies the caller via `x-user-*` headers supplied by the auth store.

All endpoints live under `/api` in mock mode:

- **Auth**: `POST /auth/login`, `POST /auth/register`, `GET /auth/session`, `POST /auth/logout`
- **Sitters**: `GET /sitters`, `GET /sitters/featured`, `GET /sitters/:id`, `GET /sitters/:id/reviews`, `GET /sitters/:id/availability`, `PATCH /sitters/:id/availability`, `GET /sitter/profile`, `PATCH /sitter/profile`, `GET /sitter/summary`
- **Bookings**: `GET /bookings`, `POST /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/status`, `POST /bookings/:id/pay`, `POST /payments/:id/refund`, `GET /payments`, `GET /payouts`
- **Parent**: `GET/PATCH /parent/profile`, `GET /parent/summary`, `GET/POST /children`, `PATCH/DELETE /children/:id`
- **Reviews / messages**: `GET/POST /reviews`, `POST /reviews/:id/response`, `GET /conversations`, `GET/POST /conversations/:id/messages`, `POST /conversations/:id/read`
- **Verification**: `GET/POST /verification/documents`, `GET /admin/verification`, `POST /admin/verification/:id/review`
- **Disputes**: `GET/POST /disputes`, `POST /admin/disputes/:id/resolve`
- **Notifications**: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`
- **Admin**: `GET /admin/overview`, `GET /admin/users`, `PATCH /admin/users/:id/status`, `GET /admin/bookings`, `GET /admin/payments`, `GET /admin/reports`, `GET/PUT /admin/settings`

## Project structure

```
src/
├─ app/
│  ├─ (public)/            # Marketing, auth, search, public sitter profiles
│  ├─ (parent)/parent/     # Parent workspace (dashboard, bookings, children, …)
│  ├─ (sitter)/sitter/     # Sitter workspace (requests, schedule, earnings, …)
│  ├─ (admin)/admin/       # Admin console (verification, users, disputes, …)
│  ├─ api/auth/            # Mock httpOnly-cookie auth route handlers
│  ├─ layout.tsx           # Fonts, metadata, providers
│  ├─ error.tsx            # Route error boundary
│  ├─ global-error.tsx     # Last-resort error boundary
│  └─ not-found.tsx        # 404
├─ components/
│  ├─ admin/ auth/ bookings/ forms/ layout/ messages/ parent/ search/ sitter/ ui/
│  └─ shared/              # Data table, states, skeletons, badges, dialogs
├─ hooks/                  # TanStack Query hooks per domain
├─ lib/
│  ├─ api/                 # Typed endpoint modules + fetch client
│  ├─ auth/                # Demo users and session helpers
│  ├─ format.ts            # Dates, money, durations
│  └─ navigation.ts        # Role-specific navigation
├─ mocks/                  # MSW handlers, seed data, mutable in-memory DB
├─ schemas/                # Zod schemas for every form
├─ store/                  # Zustand auth + UI stores
├─ types/                  # Shared domain and API types
└─ proxy.ts                # Auth + role-based routing guard (Next 16 middleware)
```

## How it works

### Authentication

- `POST /api/auth/login` validates demo credentials (or a registered in-memory user) and sets the httpOnly `bs_session` cookie.
- `src/proxy.ts` redirects unauthenticated visitors away from role workspaces, blocks cross-role access, and sends signed-in users from auth pages to their dashboard.
- The client `AuthProvider` hydrates the Zustand store from `/api/auth/session`; `RoleGuard` protects client-rendered workspaces and shows a friendly loading state while auth resolves.
- The MSW handlers read `x-user-id` / `x-user-role` headers so every request is scoped to the current actor.

### Booking lifecycle

1. Parent picks a sitter, date, time, children, and address → booking created as `pending`.
2. Sitter accepts or declines from their request detail.
3. Once `accepted`, the parent pays from the booking detail → status `paid`.
4. Sitter marks the booking `completed` after care.
5. Parent leaves a 1–5 star review; the sitter can publish one public reply.

Pricing uses the sitter hourly rate × hours, plus an 8% parent service fee. Platform commission (15% default, configurable by admins) is deducted from the sitter subtotal.

### Mock data

`src/mocks/seed.ts` contains 8 sitters, 4 families, children, bookings across every status, payments, payouts, reviews, conversations, verification documents, disputes, and notifications. `src/mocks/db.ts` mutates an in-memory copy, so changes persist while the tab is open and reset on a full reload.

Useful details while exploring:

- Maya Thompson (`maya@example.com`) is fully verified with approved documents.
- Noah Williams has two pending documents in the admin queue.
- Jordan Lee has a rejected government ID with a reviewer note.
- The admin dashboard has an open cancellation-fee dispute and a booking-time dispute.

### Conventions

- Server components render shells/marketing pages; interactive data screens are client components using TanStack Query.
- Every query surface handles `isPending`, `isError`, and empty results.
- Forms use Zod schemas from `src/schemas` and React Hook Form; server errors are surfaced inline.
- No secrets or API keys are committed. Only `NEXT_PUBLIC_*` variables are used in the browser.
- Money is stored in USD as numbers and formatted through `src/lib/format.ts`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

The project is expected to pass all three before merging. For a quick manual smoke test:

1. Sign in as the parent → browse `/search`, open a sitter, create a booking, pay after the sitter accepts.
2. Sign in as the sitter → accept the request, mark it completed, reply to a review, upload a verification document.
3. Sign in as the admin → approve the pending document, resolve a dispute, refund a payment, change commission, export a report.

## License

Private demo project. All names, documents, and payment details are fictional.
