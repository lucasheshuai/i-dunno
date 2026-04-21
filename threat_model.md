# Threat Model

## Project Overview

Social Trend is a public-facing React + Vite web application backed by an Express 5 API and PostgreSQL database in a pnpm monorepo. Users answer opinion questions, predict majority sentiment, and view profile, leaderboard, and aggregate-results pages. In production, the relevant surfaces are `artifacts/social-trend/`, `artifacts/api-server/`, `lib/db/`, `lib/api-spec/`, `lib/api-zod/`, and `lib/api-client-react/`.

The app does not implement user accounts or a real authentication provider. Instead, the browser is identified by the `st_sid` cookie, and the API uses that identifier to associate profile data, responses, and leaderboard state with a user. The codebase now also contains a signed session-challenge and bearer-token flow in `artifacts/api-server/src/routes/sessions.ts` and `artifacts/api-server/src/lib/session-token.ts`, but that path must be treated as part of the production auth surface because it is security-relevant only if enforced by the write routes. The mockup sandbox in `artifacts/mockup-sandbox/` is assumed to be development-only and should be ignored unless production reachability is demonstrated.

Assumptions for future scans:
- `NODE_ENV` is `production` in deployed environments.
- Replit deployment terminates TLS for client/server traffic.
- Only vulnerabilities that matter in production should be reported.

## Assets

- **User session identity** — the cookie-backed session identifier is the only identity primitive used to associate profile data, responses, and leaderboard state with a user. If another party can choose, replay, rotate, or bypass the intended issuance flow, they can act as that user or mass-create synthetic users.
- **Demographic profile data** — nickname, age range, gender, region, and relationship status are stored in `sessions` and returned by `/api/profile`. This is personal data and should not be exposed to other users.
- **User response history and derived profile insights** — answers, predicted majorities, answered question IDs, and derived labels/badges drive product behavior and leaderboard placement. Tampering with them degrades both privacy and product integrity.
- **Aggregate trend and leaderboard integrity** — the core business value is trustworthy social-insight and ranking data. Automated or unauthorized submissions can poison the product’s main output.
- **Write-path availability** — onboarding, answer submission, and session creation are required for normal product use. Shared or attacker-controllable throttles on those endpoints can deny service to legitimate users.
- **Application secrets and infrastructure access** — `DATABASE_URL`, `SESSION_SECRET`, and any future API credentials must remain server-side and never leak via client bundles or logs.

## Trust Boundaries

- **Browser to API** — all request bodies, query params, and headers are attacker-controlled. The SPA is untrusted and cannot enforce security by itself.
- **Client-side storage/cookies to server identity** — browser-held state such as the `st_sid` cookie and local/session storage crosses into server-side identity and UX decisions. Treating browser state as proof of ownership is a major trust boundary.
- **API to PostgreSQL** — the API has write access to sessions and responses. Injection risk is reduced by Drizzle, but broken authorization or abuse at the API layer still gives an attacker durable data access or write amplification.
- **Public versus per-user data** — questions, clusters, and aggregate results are public; profile state, answer history, and any per-user ranking context are user-specific and must not rely on client honesty.
- **Internet client to reverse proxy to Node** — production traffic reaches Express through a platform proxy. Rate limiting, IP attribution, and other per-client controls must be proxy-aware or one client may be able to affect every user’s budget.
- **Production versus dev-only artifacts** — `artifacts/mockup-sandbox/` is development-only unless explicitly wired into the deployed app. Do not spend scan time there without evidence of production reachability.

## Scan Anchors

- **Production entry points:** `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/social-trend/src/main.tsx`, `artifacts/social-trend/src/App.tsx`
- **Highest-risk code areas:** `artifacts/api-server/src/middleware/session.ts`, `artifacts/api-server/src/routes/sessions.ts`, `artifacts/api-server/src/lib/session-token.ts`, `artifacts/api-server/src/routes/profile.ts`, `artifacts/api-server/src/routes/responses.ts`, `artifacts/api-server/src/routes/questions.ts`, `artifacts/api-server/src/routes/leaderboard.ts`, `artifacts/api-server/src/lib/session-store.ts`
- **Public surfaces:** `/api/questions*`, `/api/clusters`, `/api/stats`, aggregate question results
- **Per-user surfaces:** `/api/profile`, `/api/responses`, session-aware question selection, current-user leaderboard context
- **Usually dev-only:** `artifacts/mockup-sandbox/**`

## Threat Categories

### Spoofing

This project has no authenticated account system, so the main spoofing risk is that the API trusts browser-held identity state too early or too broadly. Production guarantees must ensure that any advertised session-issuance hardening — such as challenge redemption or bearer-token verification — is actually enforced on the write paths, and that callers cannot arbitrarily choose, replay, or rotate identities to act as different participants.

### Tampering

The application’s value depends on trustworthy responses, profile state, leaderboard scores, and aggregate participation counts. Production guarantees must ensure that users cannot submit or overwrite data for another user, cannot cheaply create unlimited synthetic identities to bias aggregates, cannot derive scoring answer keys before making a prediction, and cannot bypass server-side validation when writing answers or demographics.

### Information Disclosure

Profile endpoints return demographic data and derived behavioral insights for a specific session. Production guarantees must ensure that one user cannot retrieve another user’s profile, answer history, or user-specific ranking context, and that internal identifiers or secrets do not leak through responses, logs, or client bundles.

### Denial of Service

The API exposes public write operations that create database rows and support the core product loop. Production guarantees must ensure that unauthenticated or low-cost requests cannot create unbounded session/response growth, exhaust database capacity, or consume a shared global throttle bucket because client identity is misread behind the deployment proxy.

### Elevation of Privilege

There is no formal role model today, so the relevant elevation-of-privilege risk is crossing from public user capabilities into control over another user’s state or over system-wide product outputs. Production guarantees must ensure that public callers cannot escalate from "submit my own response" to "read or modify arbitrary session data" or "materially control global rankings and stats" by manipulating identifiers, bypassing intended session issuance, or learning hidden scoring keys early.
