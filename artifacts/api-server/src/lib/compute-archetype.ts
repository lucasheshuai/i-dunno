import { mockResults, questions } from "./seed-data";

export const PROFILE_LABELS: Record<string, { label: string; description: string }> = {
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

export function computeProfileLabel(
  responses: Array<{ questionId: string; answer: string; predictedMajority: string }>,
  accuracy: number,
  answeredCount: number,
): { label: string; description: string } | null {
  if (answeredCount < 5) return null;

  if (accuracy >= 0.65) return PROFILE_LABELS.crowd_reader;

  const scores: Record<string, number> = {
    crowd_reader: 0,
    romantic_skeptic: 0,
    value_first: 0,
    stability_seeker: 0,
    modern_pragmatist: 0,
    social_realist: 1,
  };

  let conformistCount = 0;
  let contraryCount = 0;

  for (const r of responses) {
    const q = questions.find((q) => q.id === r.questionId);
    const result = mockResults.get(r.questionId);

    if (result) {
      if (r.answer === result.majorityAnswer) {
        conformistCount++;
      } else {
        contraryCount++;
      }
    }

    if (!q) continue;

    const goesAgainst = result ? r.answer !== result.majorityAnswer : false;
    const answerMultiplier = goesAgainst ? 1.5 : 1.0;

    for (const signal of q.profileSignals) {
      switch (signal) {
        case "romantic":
          scores.romantic_skeptic += goesAgainst ? 2.5 : 1.5;
          break;
        case "emotionally_aware":
          scores.value_first += 2 * answerMultiplier;
          break;
        case "security_focused":
          scores.stability_seeker += 2 * (goesAgainst ? 0.8 : 1.2);
          scores.social_realist += 1;
          break;
        case "traditionalist":
          scores.stability_seeker += goesAgainst ? 0.5 : 1.5;
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
