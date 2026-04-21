import { Router, type IRouter } from "express";
import { getLeaderboardStats } from "../lib/session-store";
import { mockResults } from "../lib/seed-data";

const router: IRouter = Router();

// Build once at module load: { questionId → majorityAnswer }
const majorityAnswerMap = new Map<string, string>();
for (const [qId, result] of mockResults.entries()) {
  majorityAnswerMap.set(qId, result.majorityAnswer);
}

function computeBadge(answeredCount: number, accuracy: number): string {
  if (accuracy >= 0.7 && answeredCount >= 5) return "Crowd Reader";
  if (accuracy <= 0.35 && answeredCount >= 5) return "Contrarian";
  if (answeredCount >= 10) return "Trend Watcher";
  return "Social Realist";
}

// ─── 30-second leaderboard cache ─────────────────────────────────────────────

interface RankedEntry {
  sessionId: string;
  rank: number;
  handle: string;
  answeredCount: number;
  predictionAccuracy: number;
  badge: string;
  isCurrentUser: boolean;
}

interface CachedLeaderboard {
  ranked: RankedEntry[];
  totalParticipants: number;
  expiresAt: number;
}

let leaderboardCache: CachedLeaderboard | null = null;
const CACHE_TTL_MS = 30_000;

async function getRankedLeaderboard(): Promise<Pick<CachedLeaderboard, "ranked" | "totalParticipants">> {
  const now = Date.now();
  if (leaderboardCache && now < leaderboardCache.expiresAt) {
    return leaderboardCache;
  }

  // Single SQL aggregation: no individual response rows loaded into memory
  const rows = await getLeaderboardStats(majorityAnswerMap);

  // Minimum threshold: require at least 3 answered questions to appear in rankings.
  // Low-effort synthetic sessions (created to inflate scores with 1-2 lucky answers)
  // are excluded, making wholesale stat manipulation proportionally more expensive.
  const MIN_ANSWERS_FOR_RANKING = 3;

  const entries = rows
    .filter((r) => r.answeredCount >= MIN_ANSWERS_FOR_RANKING)
    .map((r) => {
      const predictionAccuracy = r.answeredCount > 0 ? r.correctPredictions / r.answeredCount : 0;
      return {
        sessionId: r.sessionId,
        rank: 0,
        handle: r.nickname ?? r.sessionId.slice(0, 6),
        answeredCount: r.answeredCount,
        predictionAccuracy,
        badge: computeBadge(r.answeredCount, predictionAccuracy),
        isCurrentUser: false,
      };
    })
    .sort((a, b) => {
      if (b.predictionAccuracy !== a.predictionAccuracy) return b.predictionAccuracy - a.predictionAccuracy;
      return b.answeredCount - a.answeredCount;
    });

  // Assign dense ranks (tied sessions share the same rank)
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0) {
      const prev = entries[i - 1];
      if (
        prev.predictionAccuracy !== entries[i].predictionAccuracy ||
        prev.answeredCount !== entries[i].answeredCount
      ) {
        currentRank = i + 1;
      }
    }
    entries[i].rank = currentRank;
  }

  const result = { ranked: entries, totalParticipants: entries.length };
  leaderboardCache = { ...result, expiresAt: now + CACHE_TTL_MS };
  return result;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/leaderboard", async (req, res): Promise<void> => {
  const sessionId = req.sessionId;
  const { ranked, totalParticipants } = await getRankedLeaderboard();

  // Stamp isCurrentUser per request (not cached, session-specific)
  type PublicEntry = Omit<RankedEntry, "sessionId"> & { isCurrentUser: boolean };

  const top50: PublicEntry[] = ranked
    .slice(0, 50)
    .map(({ sessionId: sid, ...rest }) => ({ ...rest, isCurrentUser: sid === sessionId }));

  const top50SessionIds = new Set(ranked.slice(0, 50).map((e) => e.sessionId));
  const callerEntry = sessionId ? ranked.find((e) => e.sessionId === sessionId) : undefined;
  const currentUserRank: number | null = callerEntry ? callerEntry.rank : null;

  const entries: PublicEntry[] = [...top50];
  if (callerEntry && !top50SessionIds.has(callerEntry.sessionId)) {
    const { sessionId: _sid, ...rest } = callerEntry;
    entries.push({ ...rest, isCurrentUser: true });
  }

  res.json({ entries, currentUserRank, totalParticipants });
});

export default router;
