import { Router, type IRouter } from "express";
import { UpdateDemographicsBody } from "@workspace/api-zod";
import { getSession, ensureSession, updateSessionDemographics } from "../lib/session-store";
import { mockResults, questions } from "../lib/seed-data";
import { PROFILE_LABELS, computeProfileLabel } from "../lib/compute-archetype";
const router: IRouter = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeBadge(answeredCount: number, accuracy: number): string {
  if (accuracy >= 0.7 && answeredCount >= 5) return "Crowd Reader";
  if (accuracy <= 0.35 && answeredCount >= 5) return "Contrarian";
  if (answeredCount >= 10) return "Trend Watcher";
  return "Social Realist";
}

function computeMilestones(answeredCount: number): string[] {
  const unlocked: string[] = [];
  if (answeredCount >= 3) unlocked.push("social_reading_score");
  if (answeredCount >= 5) unlocked.push("perspective_profile");
  if (answeredCount >= 8) unlocked.push("crowd_divergence");
  if (answeredCount >= 12) unlocked.push("category_reads");
  if (answeredCount >= 15) unlocked.push("blind_spot");
  return unlocked;
}

/**
 * Find which demographic group (from segment data) agrees most with the user's answers.
 * For each question the user answered, we check each result segment's majority answer.
 * If the segment's majority matches the user's own answer, that group gets a point.
 * Returns the group name with the highest agreement rate (needs ≥ 3 scored questions).
 */
function computeMostAlignedDemographic(
  responses: Array<{ questionId: string; answer: string }>,
): string | null {
  const groupScores: Record<string, number> = {};
  const groupTotal: Record<string, number> = {};

  for (const r of responses) {
    const result = mockResults.get(r.questionId);
    if (!result || !result.segments) continue;

    for (const segment of result.segments) {
      if (!segment.distribution || segment.distribution.length === 0) continue;
      // Find majority answer for this segment
      const majority = segment.distribution.reduce((a, b) =>
        b.percentage > a.percentage ? b : a,
      );
      groupTotal[segment.groupName] = (groupTotal[segment.groupName] || 0) + 1;
      if (majority.option === r.answer) {
        groupScores[segment.groupName] = (groupScores[segment.groupName] || 0) + 1;
      }
    }
  }

  // Only report if we have enough data (at least 3 questions scored per group)
  const eligibleGroups = Object.keys(groupTotal).filter(g => groupTotal[g] >= 3);
  if (eligibleGroups.length === 0) return null;

  const winner = eligibleGroups.sort((a, b) => {
    const rateA = (groupScores[a] || 0) / groupTotal[a];
    const rateB = (groupScores[b] || 0) / groupTotal[b];
    return rateB - rateA;
  })[0];

  return winner;
}

interface ComputedInsights {
  answeredCount: number;
  predictionAccuracy: number;
  favoriteCategory: string | null;
  profileLabel: string | null;
  profileLabelDescription: string | null;
  milestonesUnlocked: string[];
  topDisagreementTopic: string | null;
  bestReadCategory: string | null;
  worstReadCategory: string | null;
  mostAlignedDemographic: string | null;
}

function computeInsights(
  responses: Array<{ questionId: string; answer: string; predictedMajority: string }>,
): ComputedInsights {
  const answeredCount = responses.length;
  let correctPredictions = 0;
  const categoryTotal: Record<string, number> = {};
  const categoryCorrect: Record<string, number> = {};
  const categoryDisagreements: Record<string, number> = {};

  for (const r of responses) {
    const result = mockResults.get(r.questionId);
    const q = questions.find(q => q.id === r.questionId);
    if (!q) continue;
    const cat = q.category;
    categoryTotal[cat] = (categoryTotal[cat] || 0) + 1;
    if (result) {
      if (r.predictedMajority === result.majorityAnswer) {
        correctPredictions++;
        categoryCorrect[cat] = (categoryCorrect[cat] || 0) + 1;
      }
      if (r.answer !== result.majorityAnswer) {
        categoryDisagreements[cat] = (categoryDisagreements[cat] || 0) + 1;
      }
    }
  }

  const predictionAccuracy = answeredCount > 0 ? correctPredictions / answeredCount : 0;

  const favoriteCategory =
    Object.keys(categoryTotal).length > 0
      ? Object.entries(categoryTotal).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  const catsWithEnough = Object.keys(categoryTotal).filter(c => categoryTotal[c] >= 2);

  const topDisagreementTopic =
    catsWithEnough.length > 0
      ? catsWithEnough.sort((a, b) => {
          const rA = (categoryDisagreements[a] || 0) / categoryTotal[a];
          const rB = (categoryDisagreements[b] || 0) / categoryTotal[b];
          return rB - rA;
        })[0]
      : null;

  let bestReadCategory: string | null = null;
  let worstReadCategory: string | null = null;
  if (catsWithEnough.length >= 2) {
    const sorted = [...catsWithEnough].sort((a, b) => {
      const accA = (categoryCorrect[a] || 0) / categoryTotal[a];
      const accB = (categoryCorrect[b] || 0) / categoryTotal[b];
      return accB - accA;
    });
    bestReadCategory = sorted[0];
    worstReadCategory = sorted[sorted.length - 1];
    if (bestReadCategory === worstReadCategory) {
      bestReadCategory = null;
      worstReadCategory = null;
    }
  }

  const mostAlignedDemographic = computeMostAlignedDemographic(responses);
  const milestonesUnlocked = computeMilestones(answeredCount);
  const labelResult = computeProfileLabel(responses, predictionAccuracy, answeredCount);

  return {
    answeredCount,
    predictionAccuracy,
    favoriteCategory,
    profileLabel: labelResult?.label ?? null,
    profileLabelDescription: labelResult?.description ?? null,
    milestonesUnlocked,
    topDisagreementTopic,
    bestReadCategory,
    worstReadCategory,
    mostAlignedDemographic,
  };
}

function buildProfileResponse(
  sessionId: string,
  session: {
    nickname: string | null;
    ageRange: string | null;
    gender: string | null;
    region: string | null;
    relationshipStatus: string | null;
    responses: Array<{ questionId: string; answer: string; predictedMajority: string }>;
  } | null,
) {
  if (!session) {
    return {
      sessionId,
      nickname: null,
      ageRange: null,
      gender: null,
      region: null,
      relationshipStatus: null,
      answeredCount: 0,
      answeredQuestionIds: [] as string[],
      predictionAccuracy: 0,
      favoriteCategory: null,
      badge: "Social Realist",
      profileLabel: null,
      profileLabelDescription: null,
      milestonesUnlocked: [] as string[],
      topDisagreementTopic: null,
      bestReadCategory: null,
      worstReadCategory: null,
      mostAlignedDemographic: null,
    };
  }

  const insights = computeInsights(session.responses);
  const badge = computeBadge(insights.answeredCount, insights.predictionAccuracy);
  const answeredQuestionIds = session.responses.map(r => r.questionId);
  return {
    sessionId,
    nickname: session.nickname,
    ageRange: session.ageRange,
    gender: session.gender,
    region: session.region,
    relationshipStatus: session.relationshipStatus,
    badge,
    answeredQuestionIds,
    ...insights,
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get("/profile", async (req, res): Promise<void> => {
  const sessionId = req.sessionId;
  const session = await getSession(sessionId);
  res.json(buildProfileResponse(sessionId, session));
});

router.post("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateDemographicsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionId = req.sessionId;
  const { nickname, ageRange, gender, region, relationshipStatus } = parsed.data;

  await ensureSession(sessionId);

  const updates: {
    nickname?: string | null;
    ageRange?: string | null;
    gender?: string | null;
    region?: string | null;
    relationshipStatus?: string | null;
  } = {};

  if (nickname !== undefined && nickname !== null) {
    const trimmed = nickname.trim().slice(0, 20);
    if (trimmed.length >= 2) updates.nickname = trimmed;
  }
  if (ageRange !== undefined) updates.ageRange = ageRange ?? null;
  if (gender !== undefined) updates.gender = gender ?? null;
  if (region !== undefined) updates.region = region ?? null;
  if (relationshipStatus !== undefined) updates.relationshipStatus = relationshipStatus ?? null;

  if (Object.keys(updates).length > 0) {
    await updateSessionDemographics(sessionId, updates);
  }

  const session = await getSession(sessionId);
  res.json(buildProfileResponse(sessionId, session));
});

export default router;
