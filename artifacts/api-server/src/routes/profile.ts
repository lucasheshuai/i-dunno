import { Router, type IRouter } from "express";
import { GetProfileQueryParams, UpdateDemographicsBody } from "@workspace/api-zod";
import { sessions } from "../lib/session-store";
import { mockResults, questions } from "../lib/seed-data";

const router: IRouter = Router();

// ─── Profile label definitions ───────────────────────────────────────────────

const PROFILE_LABELS: Record<string, { label: string; description: string }> = {
  crowd_reader: {
    label: "Crowd Reader",
    description: "You have a rare ability to anticipate what most people think.",
  },
  romantic_skeptic: {
    label: "Romantic Skeptic",
    description: "You lead with the heart, but question what society romanticizes.",
  },
  value_first: {
    label: "Value-First Thinker",
    description: "You process the world through emotional truth and human connection.",
  },
  stability_seeker: {
    label: "Stability Seeker",
    description: "You value what's tried and trusted over what's novel or uncertain.",
  },
  modern_pragmatist: {
    label: "Modern Pragmatist",
    description: "You cut through ideology to find what actually works.",
  },
  social_realist: {
    label: "Social Realist",
    description: "You see society as it is, not as we wish it were.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeBadge(answeredCount: number, accuracy: number): string {
  if (accuracy >= 0.7 && answeredCount >= 5) return "Crowd Reader";
  if (accuracy <= 0.35 && answeredCount >= 5) return "Contrarian";
  if (answeredCount >= 10) return "Trend Watcher";
  return "Social Realist";
}

function computeProfileLabel(
  responses: Array<{ questionId: string; predictedMajority: string }>,
  accuracy: number,
  answeredCount: number,
): { label: string; description: string } | null {
  if (answeredCount < 5) return null;

  if (accuracy >= 0.65) return PROFILE_LABELS.crowd_reader;

  const signalCounts: Record<string, number> = {};
  for (const r of responses) {
    const q = questions.find(q => q.id === r.questionId);
    if (!q) continue;
    for (const signal of q.profileSignals) {
      signalCounts[signal] = (signalCounts[signal] || 0) + 1;
    }
  }

  const scores: Record<string, number> = {
    crowd_reader: 0,
    romantic_skeptic: 0,
    value_first: 0,
    stability_seeker: 0,
    modern_pragmatist: 0,
    social_realist: 1, // default baseline
  };

  for (const [signal, count] of Object.entries(signalCounts)) {
    switch (signal) {
      case "romantic":
        scores.romantic_skeptic += count * 2;
        break;
      case "emotionally_aware":
        scores.value_first += count * 2;
        break;
      case "security_focused":
        scores.stability_seeker += count * 2;
        scores.social_realist += count;
        break;
      case "traditionalist":
        scores.stability_seeker += count;
        scores.social_realist += count;
        break;
      case "progressive":
        scores.modern_pragmatist += count;
        scores.social_realist += count * 0.5;
        break;
      case "pragmatic":
        scores.modern_pragmatist += count * 2;
        break;
      case "independent":
        scores.romantic_skeptic += count;
        scores.modern_pragmatist += count;
        break;
    }
  }

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return PROFILE_LABELS[winner] ?? PROFILE_LABELS.social_realist;
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
      predictionAccuracy: 0,
      favoriteCategory: null,
      badge: "Social Realist",
      profileLabel: null,
      profileLabelDescription: null,
      milestonesUnlocked: [] as string[],
      topDisagreementTopic: null,
      bestReadCategory: null,
      worstReadCategory: null,
    };
  }

  const insights = computeInsights(session.responses);
  const badge = computeBadge(insights.answeredCount, insights.predictionAccuracy);
  return { sessionId, nickname: session.nickname, ageRange: session.ageRange, gender: session.gender, region: session.region, relationshipStatus: session.relationshipStatus, badge, ...insights };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get("/profile", async (req, res): Promise<void> => {
  const parsed = GetProfileQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  res.json(buildProfileResponse(parsed.data.sessionId, sessions.get(parsed.data.sessionId) ?? null));
});

router.post("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateDemographicsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, nickname, ageRange, gender, region, relationshipStatus } = parsed.data;

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { sessionId, nickname: null, ageRange: null, gender: null, region: null, relationshipStatus: null, responses: [] });
  }

  const session = sessions.get(sessionId)!;
  if (nickname !== undefined && nickname !== null) {
    const trimmed = nickname.trim().slice(0, 20);
    if (trimmed.length >= 2) session.nickname = trimmed;
  }
  if (ageRange !== undefined) session.ageRange = ageRange ?? null;
  if (gender !== undefined) session.gender = gender ?? null;
  if (region !== undefined) session.region = region ?? null;
  if (relationshipStatus !== undefined) session.relationshipStatus = relationshipStatus ?? null;

  res.json(buildProfileResponse(sessionId, session));
});

export default router;
