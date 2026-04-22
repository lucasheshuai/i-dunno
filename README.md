# I Dunno

A social insight web app where users answer opinion questions, predict what the majority chose, and discover how different demographic groups responded.

## What It Does

- **Opinion questions** — answer short, relatable questions about life, relationships, and society
- **Majority prediction** — guess how the crowd voted before seeing the real results
- **Demographic breakdowns** — see how Men vs Women, Single vs In a Relationship, or different age groups answered
- **Profile archetypes** — earn an evolving label (e.g. "The Contrarian", "The Crowd Pleaser") based on how your answers compare to the majority
- **Variable reward modules** — unlock crowd shock cards, topic hooks, and demographic splits as you answer more questions
- **Cluster progression** — milestone unlocks and a leaderboard as you build your answer history

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| Routing | Wouter |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Express 5, TypeScript |
| API contract | OpenAPI 3.1 (Orval codegen) |
| Monorepo | pnpm workspaces |
| Runtime | Node.js 24 |

## Project Structure

```
.
├── artifacts/
│   ├── social-trend/       # React + Vite frontend
│   │   └── src/
│   │       ├── pages/      # Home, Question, Predict, Results, Explore, Profile, Onboarding
│   │       ├── components/ # Shared UI components and result modules
│   │       └── lib/        # Store, seed data, utilities
│   └── api-server/         # Express 5 API backend
│       └── src/
│           ├── routes/     # REST endpoints
│           └── lib/        # Session store, seed data, archetype logic
├── lib/
│   ├── api-spec/           # openapi.yaml — single source of truth for the API contract
│   ├── api-client-react/   # Generated React Query hooks (via Orval)
│   └── api-zod/            # Generated Zod schemas (via Orval)
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** v24+
- **pnpm** v9+ (`npm install -g pnpm`)

## Local Setup

```bash
# Install dependencies
pnpm install

# Start the API server (runs on PORT env var, default 3001)
pnpm --filter @workspace/api-server run dev

# Start the frontend dev server (in a separate terminal)
pnpm --filter @workspace/social-trend run dev
```

The frontend proxies `/api` requests to the API server automatically via Vite config.

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm run typecheck` | Type-check all packages |
| `pnpm run build` | Type-check + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from `openapi.yaml` |
| `pnpm --filter @workspace/api-server run dev` | Run API server in watch mode |
| `pnpm --filter @workspace/social-trend run dev` | Run frontend dev server |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/questions` | List all questions |
| GET | `/api/questions/today` | Today's featured question |
| GET | `/api/questions/:id` | Single question |
| GET | `/api/questions/:id/results` | Aggregated results + demographic segments |
| POST | `/api/responses` | Submit an answer |
| GET | `/api/profile` | User profile + archetype label |
| POST | `/api/profile` | Update demographics |
| GET | `/api/archetype-stats` | Per-archetype population percentages |
| GET | `/api/stats` | Overall app stats |
| GET | `/api/leaderboard` | Leaderboard rankings |

## Notes

- All data is seeded in-memory — no external database required for development
- Session identity is stored in `localStorage` via a UUID session ID
- The API spec (`lib/api-spec/openapi.yaml`) is the source of truth; run codegen after any schema changes
