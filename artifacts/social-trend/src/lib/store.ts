
/** Returns the cached server-issued session ID, or empty string if not yet initialized. */
export const getSessionId = (): string => {
  return localStorage.getItem('st_session_id') ?? '';
};

/** Returns the cached server-issued bearer token, or null if not yet initialized. */
export const getSessionToken = (): string | null => {
  return localStorage.getItem('st_session_token');
};

/**
 * Initialize a server-issued session if one doesn't already exist.
 *
 * Uses a challenge-response flow:
 * 1. GET /api/sessions/challenge → fresh signed challenge token
 * 2. POST /api/sessions { challenge } → server creates session, returns {sessionId, token}
 *
 * The mandatory round-trip prevents offline/pre-computed session minting.
 * Must be called once on app startup before any write operations.
 */
export const initSession = async (): Promise<void> => {
  const existingId = localStorage.getItem('st_session_id');
  const existingToken = localStorage.getItem('st_session_token');
  if (existingId && existingToken) return; // already initialized

  try {
    // Step 1: obtain a one-time challenge from the server
    const challengeResp = await fetch('/api/sessions/challenge');
    if (!challengeResp.ok) return;
    const { challenge } = (await challengeResp.json()) as { challenge: string };

    // Step 2: create the session using the challenge
    const sessionResp = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challenge }),
    });
    if (!sessionResp.ok) return;
    const { sessionId, token } = (await sessionResp.json()) as { sessionId: string; token: string };
    localStorage.setItem('st_session_id', sessionId);
    localStorage.setItem('st_session_token', token);
  } catch {
    // Network error: writes will fail with 401 until the session is initialized
  }
};

export const hasOnboarded = () => {
  return localStorage.getItem('st_onboarded') === 'true';
};

export const setOnboarded = () => {
  localStorage.setItem('st_onboarded', 'true');
};

export const hasSharedDemographics = () => {
  return localStorage.getItem('st_demographics_shared') === 'true';
};

export const setDemographicsShared = () => {
  localStorage.setItem('st_demographics_shared', 'true');
};

export interface Demographics {
  ageRange?: string;
  gender?: string;
  region?: string;
  relationshipStatus?: string;
}

export const getDemographics = (): Demographics => {
  try {
    return JSON.parse(localStorage.getItem('st_demographics') || '{}');
  } catch {
    return {};
  }
};

export const saveDemographics = (d: Demographics) => {
  localStorage.setItem('st_demographics', JSON.stringify(d));
};

export const getAnsweredQuestions = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem('st_answered') || '{}');
  } catch {
    return {};
  }
};

export const markQuestionAnswered = (id: string) => {
  const answered = getAnsweredQuestions();
  answered[id] = true;
  localStorage.setItem('st_answered', JSON.stringify(answered));
};

export const syncAnsweredFromServer = (ids: string[]) => {
  const serverSet: Record<string, boolean> = {};
  for (const id of ids) {
    serverSet[id] = true;
  }
  localStorage.setItem('st_answered', JSON.stringify(serverSet));
};

export const isQuestionAnswered = (id: string) => {
  return !!getAnsweredQuestions()[id];
};

export const getAnswerCount = (): number => {
  return Object.keys(getAnsweredQuestions()).length;
};

// Answer/prediction history persisted in localStorage so it survives page reload
export interface ResponseRecord {
  questionId: string;
  answer: string;
  prediction: string;
}

const getHistory = (): Record<string, ResponseRecord> => {
  try {
    return JSON.parse(localStorage.getItem('st_history') || '{}');
  } catch {
    return {};
  }
};

const saveHistory = (history: Record<string, ResponseRecord>) => {
  localStorage.setItem('st_history', JSON.stringify(history));
};

export const saveResponse = (questionId: string, answer: string, prediction: string) => {
  const history = getHistory();
  history[questionId] = { questionId, answer, prediction };
  saveHistory(history);
};

export const getResponse = (questionId: string): ResponseRecord | null => {
  return getHistory()[questionId] || null;
};

export const getRecentResponses = (n: number): ResponseRecord[] => {
  const history = getHistory();
  // Return the last N entries; insertion order is preserved in JS objects
  return Object.values(history).slice(-n);
};

// In-memory flow state for current in-progress question (answer before prediction submitted)
export const flowState: Record<string, { answer?: string; prediction?: string }> = {};

export const setFlowAnswer = (questionId: string, answer: string) => {
  if (!flowState[questionId]) flowState[questionId] = {};
  flowState[questionId].answer = answer;
};

export const setFlowPrediction = (questionId: string, prediction: string) => {
  if (!flowState[questionId]) flowState[questionId] = {};
  flowState[questionId].prediction = prediction;
  // Persist to history once prediction is set (answer should already be in flowState)
  const answer = flowState[questionId].answer;
  if (answer) {
    saveResponse(questionId, answer, prediction);
  }
};

export const getFlowState = (questionId: string): { answer?: string; prediction?: string } => {
  // First check in-memory state (active flow)
  if (flowState[questionId]?.answer || flowState[questionId]?.prediction) {
    return flowState[questionId];
  }
  // Fall back to persisted history (after page reload)
  const record = getResponse(questionId);
  if (record) {
    return { answer: record.answer, prediction: record.prediction };
  }
  return {};
};

export const clearFlowState = (questionId: string) => {
  delete flowState[questionId];
};

export const getNickname = (): string | null => {
  return localStorage.getItem('st_nickname');
};

export const setNickname = (name: string): void => {
  localStorage.setItem('st_nickname', name);
};

// ─── Feed cursor (persisted position in the cluster-sequential feed) ──────────

export interface FeedCursor {
  clusterId: string;
  questionId: string;
}

export const getFeedCursor = (): FeedCursor | null => {
  try {
    const raw = localStorage.getItem('st_feed_cursor');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setFeedCursor = (clusterId: string, questionId: string): void => {
  localStorage.setItem('st_feed_cursor', JSON.stringify({ clusterId, questionId }));
};

export const clearFeedCursor = (): void => {
  localStorage.removeItem('st_feed_cursor');
};

// ─── Profile Signal Accumulation ─────────────────────────────────────────────

const SIGNAL_LABELS: Record<string, string> = {
  romantic: 'Hopeless Romantic',
  pragmatic: 'Pragmatic Realist',
  traditionalist: 'Old-School Traditionalist',
  progressive: 'Modern Thinker',
  security_focused: 'Security Seeker',
  emotionally_aware: 'Emotionally Aware',
  independent: 'Independent Spirit',
};

const getStoredProfileSignals = (): Record<string, string[]> => {
  try {
    return JSON.parse(localStorage.getItem('st_profile_signals') || '{}');
  } catch {
    return {};
  }
};

export const recordProfileSignals = (questionId: string, signals: string[]) => {
  const stored = getStoredProfileSignals();
  stored[questionId] = signals;
  localStorage.setItem('st_profile_signals', JSON.stringify(stored));
};

export const getProfileSignalCounts = (): Record<string, number> => {
  const stored = getStoredProfileSignals();
  const counts: Record<string, number> = {};
  Object.values(stored).flat().forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });
  return counts;
};

export const getDominantProfileLabel = (): string | null => {
  const stored = getStoredProfileSignals();
  const counts: Record<string, number> = {};
  Object.values(stored).flat().forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });
  if (!Object.keys(counts).length) return null;
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return dominant ? (SIGNAL_LABELS[dominant] ?? null) : null;
};

// ─── Cluster-Sequential Navigation ───────────────────────────────────────────

export interface QuestionRef {
  id: string;
  topicClusterId: string;
  clusterOrder: number;
  teaserText: string;
}

export interface ClusterRef {
  id: string;
  title: string;
  questionIds: string[];
  outro: string;
}

export interface NextInSequenceResult {
  next: QuestionRef | null;
  clusterComplete: boolean;
  completedCluster?: ClusterRef;
}

// Returns the globally next unanswered question across all clusters
// using the API-provided cluster ordering (clusters array order is canonical)
export const getNextQuestion = (
  questions: QuestionRef[],
  clusters: ClusterRef[],
  answeredIds: Set<string>
): QuestionRef | null => {
  for (const cluster of clusters) {
    const clusterQuestions = questions
      .filter(q => q.topicClusterId === cluster.id)
      .sort((a, b) => a.clusterOrder - b.clusterOrder);
    const firstUnanswered = clusterQuestions.find(q => !answeredIds.has(q.id));
    if (firstUnanswered) return firstUnanswered;
  }
  return null;
};

export const getNextInSequence = (
  currentId: string,
  questions: QuestionRef[],
  clusters: ClusterRef[],
  answeredIds: Set<string>
): NextInSequenceResult => {
  const current = questions.find(q => q.id === currentId);
  if (!current) return { next: null, clusterComplete: false };

  const currentClusterId = current.topicClusterId;
  const currentClusterQuestions = questions
    .filter(q => q.topicClusterId === currentClusterId)
    .sort((a, b) => a.clusterOrder - b.clusterOrder);

  // The current question just got answered, so include it in the answered set
  const allAnswered = new Set([...answeredIds, currentId]);

  const allClusterDone = currentClusterQuestions.every(q => allAnswered.has(q.id));

  if (!allClusterDone) {
    const nextInCluster = currentClusterQuestions.find(q => !allAnswered.has(q.id));
    if (nextInCluster) return { next: nextInCluster, clusterComplete: false };
  }

  // Cluster is complete — find the completed cluster meta
  const completedCluster = clusters.find(c => c.id === currentClusterId);

  // Use API-provided cluster order (clusters array order is canonical — no sorting by id)
  const currentIdx = clusters.findIndex(c => c.id === currentClusterId);

  for (let i = currentIdx + 1; i < clusters.length; i++) {
    const nextCluster = clusters[i];
    const nextClusterQuestions = questions
      .filter(q => q.topicClusterId === nextCluster.id)
      .sort((a, b) => a.clusterOrder - b.clusterOrder);
    const firstUnanswered = nextClusterQuestions.find(q => !allAnswered.has(q.id));
    if (firstUnanswered) {
      return {
        next: firstUnanswered,
        clusterComplete: true,
        completedCluster,
      };
    }
  }

  return { next: null, clusterComplete: true, completedCluster };
};
