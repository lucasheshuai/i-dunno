# Threat Model

## Project Overview

Social Trend is a public-facing React + Vite web application backed by an Express 5 API and PostgreSQL database in a pnpm monorepo. Users answer opinion questions, predict majority sentiment, and view profile, leaderboard, and aggregate-results pages. In production, the relevant surfaces are `artifacts/social-trend/`, `artifacts/api-server/`, `lib/db/`, `lib/api-spec/`, `lib/api-zod/`, and `lib/api-client-react/`.

The app does not implement user accounts or a real authentication provider. Instead, the browser generates a `sessionId` and persists it in `localStorage`; the API accepts that value on profile, response, question-progress, and leaderboard endpoints. The mockup sandbox in `artifacts/mockup-sandbox/` is assumed to be development-only and should be ignored unless production reachability is demonstrated.

Assumptions for future scans:
- `NODE_ENV` is `production` in deployed environments.
- Replit deployment terminates TLS for client/server traffic.
- Only vulnerabilities that matter in production should be reported.

## Assets

- **User session identity** — the `sessionId` is the only identifier used to associate profile data, responses, and leaderboard state with a user. If another party can choose or replay it, they can act as that user in API calls.
- **Demographic profile data** — nickname, age range, gender, region, and relationship status are stored in `sessions` and returned by `/api/profile`. This is personal data and should not be exposed to other users.
- **User response history and derived profile insights** — answers, predicted majorities, answered question IDs, and derived labels/badges drive product behavior and leaderboard placement. Tampering with them degrades both privacy and product integrity.
- **Aggregate trend and leaderboard integrity** — the core business value is trustworthy social-insight and ranking data. Automated or unauthorized submissions can poison the product’s main output.
- **Application secrets and infrastructure access** — `DATABASE_URL` and any future API credentials must remain server-side and never leak via client bundles or logs.

## Trust Boundaries

- **Browser to API** — all request bodies, query params, and headers are attacker-controlled. The SPA is untrusted and cannot enforce security by itself.
- **Client-side storage to server identity** — `localStorage` values such as `st_session_id` cross into server-side identity decisions. Treating client-stored identifiers as proof of ownership is a major trust boundary.
- **API to PostgreSQL** — the API has write access to sessions and responses. Injection risk is reduced by Drizzle, but broken authorization or abuse at the API layer still gives an attacker durable data access or write amplification.
- **Public versus per-user data** — questions, clusters, and aggregate results are public; profile state, answer history, and any per-user ranking context are user-specific and must not rely on client honesty.
- **Production versus dev-only artifacts** — `artifacts/mockup-sandbox/` is development-only unless explicitly wired into the deployed app. Do not spend scan time there without evidence of production reachability.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/social-trend/src/main.tsx`, `artifacts/social-trend/src/App.tsx`
- **Highest-risk code areas:** `artifacts/api-server/src/routes/profile.ts`, `artifacts/api-server/src/routes/responses.ts`, `artifacts/api-server/src/routes/questions.ts`, `artifacts/api-server/src/routes/leaderboard.ts`, `artifacts/api-server/src/lib/session-store.ts`, `artifacts/social-trend/src/lib/store.ts`
- **Public surfaces:** `/api/questions*`, `/api/clusters`, `/api/stats`, aggregate question results
- **Per-user surfaces:** `/api/profile`, `/api/responses`, session-aware question selection, current-user leaderboard context
- **Usually dev-only:** `artifacts/mockup-sandbox/**`

## Threat Categories

### Spoofing

This project currently has no authenticated account system, so the main spoofing risk is that the API trusts a client-supplied `sessionId` as the user’s identity. Production guarantees must ensure that per-user reads and writes are bound to a server-verified identity or another possession factor that an attacker cannot arbitrarily choose, replay, or overwrite.

### Tampering

The application’s value depends on trustworthy responses, profile state, and leaderboard calculations. Production guarantees must ensure that users cannot submit or overwrite data for another user, cannot create unlimited synthetic identities to bias aggregates, cannot learn scoring answer keys before making a prediction, and cannot bypass server-side validation when writing answers or demographics.

### Information Disclosure

Profile endpoints return demographic data and derived behavioral insights for a specific session. Production guarantees must ensure that one user cannot retrieve another user’s profile, answer history, or user-specific ranking context, and that internal identifiers or secrets do not leak through responses, logs, or client bundles.

### Denial of Service

The API exposes public write operations that create database rows and perform server-side aggregation. Production guarantees must ensure that unauthenticated or low-cost requests cannot create unbounded session/response growth, exhaust database capacity, or repeatedly trigger expensive computations without throttling.

### Elevation of Privilege

There is no formal role model today, so the relevant elevation-of-privilege risk is crossing from public user capabilities into control over another user’s state or over system-wide product outputs. Production guarantees must ensure that public callers cannot escalate from "submit my own response" to "read or modify arbitrary session data" or "materially control global rankings and stats" by manipulating identifiers.
