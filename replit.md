# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a Social Trend social insight web app with an Express API backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: No database (in-memory session store, all data is seeded/mocked)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Project: Social Trend

A social insights web app where users answer opinion questions, predict what the majority chose, and compare their view with demographic breakdowns.

### Frontend: `artifacts/social-trend/`
- React + Vite + TypeScript + Tailwind CSS
- Pages: Home, Question, Predict, Results, Explore, Onboarding, Profile
- Uses `wouter` for routing, `framer-motion` for animations, `recharts` for charts
- State persisted in localStorage (session ID, answered questions, onboarding status)
- All API calls via generated hooks from `@workspace/api-client-react`

### Backend: `artifacts/api-server/`
- Express 5 API server
- Routes: `/api/questions`, `/api/questions/today`, `/api/questions/:id`, `/api/questions/:id/results`, `/api/responses`, `/api/profile`, `/api/stats`
- In-memory session store (no database needed for V1)
- 15 seeded social/relationship questions with mocked aggregated results and demographic segment data

### API Spec: `lib/api-spec/openapi.yaml`
- Full OpenAPI 3.1 spec for all endpoints
- Codegen generates React Query hooks and Zod schemas

### Orval Config Note
After codegen, the `lib/api-zod/src/index.ts` must export only from `./generated/api` (not from `./generated/types` or `./generated/api.schemas`) to avoid duplicate export conflicts. The codegen may regenerate this file incorrectly — fix it manually if needed.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
