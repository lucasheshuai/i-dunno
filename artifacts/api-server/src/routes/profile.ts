import { Router, type IRouter } from "express";
import { GetProfileQueryParams, UpdateDemographicsBody } from "@workspace/api-zod";
import { getSession, ensureSession, updateSessionDemographics } from "../lib/session-store";
import { mockResults, questions } from "../lib/seed-data";
import { extractSessionFromBearer } from "../lib/session-token";

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

/** Compute profile label from both question signals AND actual answer behavior. */
function computeProfileLabel(
  responses: Array<{ questionId: string; answer: string; predictedMajority: string }>,
  accuracy: number,
  answeredCount: number,
): { label: string; description: string } | null {
  if (answeredCount < 5) return null;

  // Crowd reader override: high prediction accuracy means you genuinely "read" the crowd
  if (accuracy >= 0.65) return PROFILE_LABELS.crowd_reader;

  const scores: Record<string, number> = {
    crowd_reader: 0,
    romantic_skeptic: 0,
    value_first: 0,
    stability_seeker: 0,
    modern_pragmatist: 0,
    social_realist: 1, // baseline so we always have a winner
  };

  let conformistCount = 0; // how often user agreed with the majority
  let contraryCount = 0;   // how often user went against the majority

  for (const r of responses) {
    const q = questions.find(q => q.id === r.questionId);
    const result = mockResults.get(r.questionId);

    // Answer-level behavior: whether user chose with or against the crowd
    if (result) {
      if (r.answer === result.majorityAnswer) {
        conformistCount++;
      } else {
        contraryCount++;
      }
    }

    if (!q) continue;

    // Question-level signal accumulation weighted by answer behavior
    // Going against the crowd amplifies "non-conformist" signals;
    // going with the crowd amplifies "conformist" signals
    const goesAgainst = result ? r.answer !== result.majorityAnswer : false;
    const answerMultiplier = goesAgainst ? 1.5 : 1.0;

    for (const signal of q.profileSignals) {
      switch (signal) {
        case "romantic":
          // Romantic + contrarian → stronger Romantic Skeptic
          scores.romantic_skeptic += goesAgainst ? 2.5 : 1.5;
          break;
        case "emotionally_aware":
          scores.value_first += 2 * answerMultiplier;
          break;
        case "security_focused":
          scores.stability_seeker += 2 * (goesAgainst ? 0.8 : 1.2); // conformism fits stability
          scores.social_realist += 1;
          break;
        case "traditionalist":
          scores.stability_seeker += goesAgainst ? 0.5 : 1.5; // true traditionalist follows norms
          scores.social_realist += 1;
          break;
        case "progressive":
          scores.modern_pragmatist += 1;
          scores.social_realist += 0.5;
          break;
        case "pragmatic":
          scores.modern_pragmatist += 2 * answerMultiplier;
          break;
        case "independent":
          scores.romantic_skeptic += goesAgainst ? 2 : 0.5;
          scores.modern_pragmatist += 1;
          break;
      }
    }
  }

  // Answer behavior boosts: strong conformism → social realist; strong contrarianism → romantic skeptic
  const total = conformistCount + contraryCount;
  if (total > 0) {
    const contraryRate = contraryCount / total;
    if (contraryRate >= 0.6) {
      scores.romantic_skeptic += 3;
    } else if (contraryRate <= 0.25) {
      scores.social_realist += 2;
      scores.modern_pragmatist += 1;
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
  const parsed = GetProfileQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const session = await getSession(parsed.data.sessionId);
  res.json(buildProfileResponse(parsed.data.sessionId, session));
});

router.post("/profile", async (req, res): Promise<void> => {
  // Require server-issued bearer token to prevent demographic inflation via
  // fabricated session IDs (which would corrupt profile stats and leaderboards).
  const tokenSessionId = extractSessionFromBearer(req.headers.authorization);
  if (!tokenSessionId) {
    res.status(401).json({ error: "Valid session token required. Call POST /api/sessions first." });
    return;
  }

  const parsed = UpdateDemographicsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId: bodySessionId, nickname, ageRange, gender, region, relationshipStatus } = parsed.data;

  if (bodySessionId !== tokenSessionId) {
    res.status(403).json({ error: "Session token does not match request body sessionId" });
    return;
  }

  const sessionId = tokenSessionId;

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
