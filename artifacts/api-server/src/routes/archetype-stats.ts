import { Router, type IRouter } from "express";
import { getAllSessionsIterable } from "../lib/session-store";
import { computeProfileLabel } from "../lib/compute-archetype";
import { mockResults } from "../lib/seed-data";

const router: IRouter = Router();

export interface ArchetypeStatItem {
  percentage: string | null;
  topGroup: string | null;
  bottomGroup: string | null;
}

export type ArchetypeStatsResponse = Record<string, ArchetypeStatItem>;

// ─── In-memory cache (5-minute TTL) ──────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedStats: ArchetypeStatsResponse | null = null;
let cacheExpiresAt = 0;

// ─── Helper: format an ageRange as a readable group label ─────────────────────

function formatAgeGroup(ageRange: string): string {
  if (ageRange.endsWith("+")) return `${ageRange} respondents`;
  return `${ageRange} year-olds`;
}

// ─── Core computation ─────────────────────────────────────────────────────────

async function computeArchetypeStats(): Promise<ArchetypeStatsResponse> {
  const sessions = await getAllSessionsIterable();

  type EligibleSession = {
    label: string;
    ageRange: string | null;
    gender: string | null;
  };

  const eligible: EligibleSession[] = [];

  for (const session of sessions) {
    const count = session.responses.length;
    if (count < 5) continue;

    const correctPredictions = session.responses.filter((r) => {
      const result = mockResults.get(r.questionId);
      return result && r.predictedMajority === result.majorityAnswer;
    }).length;
    const accuracy = count > 0 ? correctPredictions / count : 0;

    const labelResult = computeProfileLabel(session.responses, accuracy, count);
    if (!labelResult) continue;

    eligible.push({
      label: labelResult.label,
      ageRange: session.ageRange,
      gender: session.gender,
    });
  }

  const total = eligible.length;
  if (total === 0) {
    return {};
  }

  // Group sessions by archetype label
  const byLabel: Record<string, EligibleSession[]> = {};
  for (const s of eligible) {
    (byLabel[s.label] ??= []).push(s);
  }

  const result: ArchetypeStatsResponse = {};

  for (const [label, group] of Object.entries(byLabel)) {
    const percentage = String(Math.round((group.length / total) * 100));

    // Demographic breakdown by ageRange (fall back to gender if sparse)
    const ageRangeCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};
    let withAge = 0;
    let withGender = 0;

    for (const s of group) {
      if (s.ageRange) {
        ageRangeCounts[s.ageRange] = (ageRangeCounts[s.ageRange] ?? 0) + 1;
        withAge++;
      }
      if (s.gender) {
        genderCounts[s.gender] = (genderCounts[s.gender] ?? 0) + 1;
        withGender++;
      }
    }

    let topGroup: string | null = null;
    let bottomGroup: string | null = null;

    // Need at least 3 users with demographics for the breakdown to be meaningful
    if (withAge >= 3) {
      const sorted = Object.entries(ageRangeCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length >= 2) {
        topGroup = formatAgeGroup(sorted[0][0]);
        bottomGroup = formatAgeGroup(sorted[sorted.length - 1][0]);
      }
    } else if (withGender >= 3) {
      const sorted = Object.entries(genderCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length >= 2) {
        topGroup = sorted[0][0].toLowerCase();
        bottomGroup = sorted[sorted.length - 1][0].toLowerCase();
      }
    }

    result[label] = { percentage, topGroup, bottomGroup };
  }

  return result;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/archetype-stats", async (_req, res): Promise<void> => {
  const now = Date.now();

  if (cachedStats && now < cacheExpiresAt) {
    res.json(cachedStats);
    return;
  }

  try {
    cachedStats = await computeArchetypeStats();
    cacheExpiresAt = now + CACHE_TTL_MS;
    res.json(cachedStats);
  } catch (err) {
    console.error("[archetype-stats] computation failed:", err);
    res.json({});
  }
});

export default router;
