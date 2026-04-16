import { randomUUID } from "crypto";
import { sessions } from "./session-store";
import { questions } from "./seed-data";

function makePrng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

function weightedPick<T>(rng: () => number, items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pickIndex(rng: () => number, weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

const NICKNAME_BASES = [
  "TrendHunter", "CrowdReader", "MindMeld", "SocialSage", "PulsePicker",
  "VibeCheck", "NormTracker", "WaveRider", "ConsensusKing", "OutlierOlly",
  "DataDriven", "TruthSeeker", "MobMindset", "BellCurve", "StatPak",
  "HiveMind", "PatternPro", "SignalNoise", "GroupThink", "TrendBender",
  "CrowdSurfer", "PredictPro", "SocialGuru", "TrendWatcher", "MajorityMind",
  "InsightSeeker", "DataNerd", "ThinkTank", "CrowdWhisperer", "TrendAlert",
  "NormNinja", "SocialBarometer", "PulseReader", "VibeTracker", "TrendMaster",
  "CrowdLogic", "MindReader", "SocialPulse", "TrendSpotter", "WaveMaker",
  "ConsensusBuilder", "DataSurfer", "NormHunter", "SignalReader", "GroupMind",
  "TrendForce", "CrowdSage", "MindTracker", "SocialWave", "PulseHunter",
];

const GENDERS = ["Male", "Female"];
const GENDER_WEIGHTS = [52, 48];

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
const AGE_WEIGHTS = [20, 35, 25, 12, 8];

const RELATIONSHIP_STATUSES = ["Single", "In a relationship", "Married", "Prefer not to say"];
const RELATIONSHIP_WEIGHTS = [38, 35, 22, 5];

const REGIONS = ["United States", "United Kingdom", "Canada", "Australia", "Other"];
const REGION_WEIGHTS = [45, 20, 15, 12, 8];

const MAJORITY_INDICES: Record<string, number> = {
  q1: 0, q2: 1, q3: 1, q4: 0, q5: 3, q6: 0, q7: 0, q8: 0, q9: 0,
  q10: 3, q11: 0, q12: 2, q13: 1, q14: 1, q15: 0, q16: 0, q17: 2, q18: 1,
  q19: 1, q20: 1, q21: 0, q22: 1, q23: 3, q24: 1, q25: 1, q26: 0, q27: 0,
  q28: 0, q29: 1, q30: 2, q31: 3, q32: 0, q33: 3, q34: 0, q35: 1,
  q36: 0, q37: 0, q38: 1, q39: 3, q40: 0, q41: 3, q42: 1, q43: 3,
  q44: 1, q45: 3, q46: 0, q47: 3, q48: 1, q49: 0, q50: 2,
};

function makeAnswerWeights(options: string[], majorityIdx: number): number[] {
  return options.map((_, i) => (i === majorityIdx ? 60 : 40 / (options.length - 1)));
}

function makePredictionWeights(options: string[], majorityIdx: number): number[] {
  return options.map((_, i) => (i === majorityIdx ? 55 : 45 / (options.length - 1)));
}

const activeQuestions = questions.filter((q) => q.status === "active");

export function seedSessions(): void {
  const rng = makePrng(0xdeadbeef);

  const usedNicknames = new Set<string>();

  for (let i = 0; i < 300; i++) {
    const sessionId = `seed_${String(i + 1).padStart(3, "0")}`;

    let nickname: string | null = null;
    if (rng() < 0.6) {
      const base = NICKNAME_BASES[Math.floor(rng() * NICKNAME_BASES.length)];
      const suffix = String(Math.floor(rng() * 90) + 10);
      const candidate = `${base}${suffix}`;
      nickname = usedNicknames.has(candidate) ? `${base}${suffix}x` : candidate;
      usedNicknames.add(nickname);
    }

    const gender = weightedPick(rng, GENDERS, GENDER_WEIGHTS);
    const ageRange = weightedPick(rng, AGE_RANGES, AGE_WEIGHTS);
    const relationshipStatus = weightedPick(rng, RELATIONSHIP_STATUSES, RELATIONSHIP_WEIGHTS);
    const region = weightedPick(rng, REGIONS, REGION_WEIGHTS);

    const questionCount = Math.floor(rng() * 21) + 8;
    const shuffled = [...activeQuestions].sort(() => rng() - 0.5);
    const chosen = shuffled.slice(0, Math.min(questionCount, activeQuestions.length));

    const baseTimestamp = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const responses = chosen.map((q) => {
      const majorityIdx = MAJORITY_INDICES[q.id] ?? 0;
      const answerIdx = pickIndex(rng, makeAnswerWeights(q.options, majorityIdx));
      const predictionIdx = pickIndex(rng, makePredictionWeights(q.options, majorityIdx));
      const offsetMs = Math.floor(rng() * 30 * 24 * 60 * 60 * 1000);
      return {
        id: randomUUID(),
        sessionId,
        questionId: q.id,
        answer: q.options[answerIdx],
        predictedMajority: q.options[predictionIdx],
        createdAt: new Date(baseTimestamp + offsetMs).toISOString(),
      };
    });

    sessions.set(sessionId, {
      sessionId,
      nickname,
      ageRange,
      gender,
      region,
      relationshipStatus,
      responses,
    });
  }
}
