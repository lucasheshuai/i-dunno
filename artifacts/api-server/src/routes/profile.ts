import { Router, type IRouter } from "express";
import { GetProfileQueryParams, UpdateDemographicsBody } from "@workspace/api-zod";
import { sessions } from "../lib/session-store";

const router: IRouter = Router();

function computeBadge(answeredCount: number, accuracy: number): string {
  if (accuracy >= 0.7 && answeredCount >= 5) return "Crowd Reader";
  if (accuracy <= 0.35 && answeredCount >= 5) return "Contrarian";
  if (answeredCount >= 10) return "Trend Watcher";
  return "Social Realist";
}

router.get("/profile", async (req, res): Promise<void> => {
  const parsed = GetProfileQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId } = parsed.data;

  const session = sessions.get(sessionId);
  if (!session) {
    res.json({
      sessionId,
      ageRange: null,
      gender: null,
      region: null,
      relationshipStatus: null,
      answeredCount: 0,
      predictionAccuracy: 0,
      favoriteCategory: null,
      badge: "Social Realist",
    });
    return;
  }

  const responses = session.responses;
  const answeredCount = responses.length;

  let correctPredictions = 0;
  for (const r of responses) {
    if (r.answer === r.predictedMajority) correctPredictions++;
  }
  const predictionAccuracy = answeredCount > 0 ? correctPredictions / answeredCount : 0;

  const badge = computeBadge(answeredCount, predictionAccuracy);

  res.json({
    sessionId,
    ageRange: session.ageRange,
    gender: session.gender,
    region: session.region,
    relationshipStatus: session.relationshipStatus,
    answeredCount,
    predictionAccuracy,
    favoriteCategory: null,
    badge,
  });
});

router.post("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateDemographicsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, ageRange, gender, region, relationshipStatus } = parsed.data;

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      ageRange: null,
      gender: null,
      region: null,
      relationshipStatus: null,
      responses: [],
    });
  }

  const session = sessions.get(sessionId)!;
  if (ageRange !== undefined) session.ageRange = ageRange ?? null;
  if (gender !== undefined) session.gender = gender ?? null;
  if (region !== undefined) session.region = region ?? null;
  if (relationshipStatus !== undefined) session.relationshipStatus = relationshipStatus ?? null;

  const responses = session.responses;
  const answeredCount = responses.length;
  let correctPredictions = 0;
  for (const r of responses) {
    if (r.answer === r.predictedMajority) correctPredictions++;
  }
  const predictionAccuracy = answeredCount > 0 ? correctPredictions / answeredCount : 0;
  const badge = computeBadge(answeredCount, predictionAccuracy);

  res.json({
    sessionId,
    ageRange: session.ageRange,
    gender: session.gender,
    region: session.region,
    relationshipStatus: session.relationshipStatus,
    answeredCount,
    predictionAccuracy,
    favoriteCategory: null,
    badge,
  });
});

export default router;
