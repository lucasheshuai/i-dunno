import { Router, type IRouter } from "express";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";
import { sessions } from "../lib/session-store";
import { mockResults } from "../lib/seed-data";

const router: IRouter = Router();

function computeStats(responses: Array<{ questionId: string; predictedMajority: string }>) {
  const answeredCount = responses.length;
  let correctPredictions = 0;

  for (const r of responses) {
    const result = mockResults.get(r.questionId);
    if (result && r.predictedMajority === result.majorityAnswer) {
      correctPredictions++;
    }
  }

  const predictionAccuracy = answeredCount > 0 ? correctPredictions / answeredCount : 0;
  return { answeredCount, predictionAccuracy };
}

function computeBadge(answeredCount: number, accuracy: number): string {
  if (accuracy >= 0.7 && answeredCount >= 5) return "Crowd Reader";
  if (accuracy <= 0.35 && answeredCount >= 5) return "Contrarian";
  if (answeredCount >= 10) return "Trend Watcher";
  return "Social Realist";
}

router.get("/leaderboard", async (req, res): Promise<void> => {
  const parsed = GetLeaderboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId } = parsed.data;

  interface RankedEntry {
    sessionId: string;
    rank: number;
    handle: string;
    answeredCount: number;
    predictionAccuracy: number;
    badge: string;
    isCurrentUser: boolean;
  }

  const allEntries: Omit<RankedEntry, "rank" | "isCurrentUser">[] = [];

  for (const session of sessions.values()) {
    const { answeredCount, predictionAccuracy } = computeStats(session.responses);
    if (answeredCount === 0) continue;
    allEntries.push({
      sessionId: session.sessionId,
      handle: session.sessionId.slice(0, 6),
      answeredCount,
      predictionAccuracy,
      badge: computeBadge(answeredCount, predictionAccuracy),
    });
  }

  allEntries.sort((a, b) => {
    if (b.predictionAccuracy !== a.predictionAccuracy) {
      return b.predictionAccuracy - a.predictionAccuracy;
    }
    return b.answeredCount - a.answeredCount;
  });

  const ranked: RankedEntry[] = [];
  let currentRank = 1;
  for (let i = 0; i < allEntries.length; i++) {
    const prev = i > 0 ? allEntries[i - 1] : null;
    if (
      prev &&
      prev.predictionAccuracy === allEntries[i].predictionAccuracy &&
      prev.answeredCount === allEntries[i].answeredCount
    ) {
      currentRank = ranked[i - 1].rank;
    } else {
      currentRank = i + 1;
    }
    ranked.push({
      ...allEntries[i],
      rank: currentRank,
      isCurrentUser: allEntries[i].sessionId === sessionId,
    });
  }

  const totalParticipants = ranked.length;

  const top50Slice = ranked.slice(0, 50);
  const top50SessionIds = new Set(top50Slice.map((e) => e.sessionId));
  const top50 = top50Slice.map(({ sessionId: _sid, ...rest }) => rest);

  const callerEntry = sessionId ? ranked.find((e) => e.sessionId === sessionId) : undefined;
  const currentUserRank: number | null = callerEntry ? callerEntry.rank : null;

  const entries = [...top50];

  if (callerEntry && !top50SessionIds.has(callerEntry.sessionId)) {
    const { sessionId: _sid, ...rest } = callerEntry;
    entries.push(rest);
  }

  res.json({ entries, currentUserRank, totalParticipants });
});

export default router;
