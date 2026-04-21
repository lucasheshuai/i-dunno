
// ─── Session Reset ────────────────────────────────────────────────────────────

const LOCAL_STORAGE_KEYS = ['st_session_id', 'st_onboarded', 'st_answered', 'st_demographics_shared'];

const SESSION_STORAGE_KEYS = [
  'st_demographics',
  'st_history',
  'st_nickname',
  'st_feed_cursor',
];

export const clearSession = async (): Promise<void> => {
  await fetch('/api/session/reset', { method: 'POST' }).catch(() => {});
  for (const key of LOCAL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  for (const key of SESSION_STORAGE_KEYS) {
    sessionStorage.removeItem(key);
  }
  window.location.href = '/';
};

// ─── Onboarding flag (non-sensitive UX flag, kept in localStorage) ────────────

export const hasOnboarded = () => {
  return localStorage.getItem('st_onboarded') === 'true';
};

export const setOnboarded = () => {
  localStorage.setItem('st_onboarded', 'true');
};

// ─── Demographics shared flag (non-PII boolean — localStorage, persists across sessions) ──

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
    return JSON.parse(sessionStorage.getItem('st_demographics') || '{}');
  } catch {
    return {};
  }
};

export const saveDemographics = (d: Demographics) => {
  sessionStorage.setItem('st_demographics', JSON.stringify(d));
};

// ─── Answered questions (non-PII question IDs; synced from server on load) ────

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

// ─── Answer/prediction history (sensitive — sessionStorage) ───────────────────

export interface ResponseRecord {
  questionId: string;
  answer: string;
  prediction: string;
}

const getHistory = (): Record<string, ResponseRecord> => {
  try {
    return JSON.parse(sessionStorage.getItem('st_history') || '{}');
  } catch {
    return {};
  }
};

const saveHistory = (history: Record<string, ResponseRecord>) => {
  sessionStorage.setItem('st_history', JSON.stringify(history));
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
  return Object.values(history).slice(-n);
};

// ─── In-memory flow state for current in-progress question ───────────────────

export const flowState: Record<string, { answer?: string; prediction?: string }> = {};

export const setFlowAnswer = (questionId: string, answer: string) => {
  if (!flowState[questionId]) flowState[questionId] = {};
  flowState[questionId].answer = answer;
};

export const setFlowPrediction = (questionId: string, prediction: string) => {
  if (!flowState[questionId]) flowState[questionId] = {};
  flowState[questionId].prediction = prediction;
  const answer = flowState[questionId].answer;
  if (answer) {
    saveResponse(questionId, answer, prediction);
  }
};

export const getFlowState = (questionId: string): { answer?: string; prediction?: string } => {
  if (flowState[questionId]?.answer || flowState[questionId]?.prediction) {
    return flowState[questionId];
  }
  const record = getResponse(questionId);
  if (record) {
    return { answer: record.answer, prediction: record.prediction };
  }
  return {};
};

export const clearFlowState = (questionId: string) => {
  delete flowState[questionId];
};

// ─── Nickname (sensitive — sessionStorage) ────────────────────────────────────

export const getNickname = (): string | null => {
  return sessionStorage.getItem('st_nickname');
};

export const setNickname = (name: string): void => {
  sessionStorage.setItem('st_nickname', name);
};

// ─── Feed cursor (session-specific position — sessionStorage) ─────────────────

export interface FeedCursor {
  clusterId: string;
  questionId: string;
}

export const getFeedCursor = (): FeedCursor | null => {
  try {
    const raw = sessionStorage.getItem('st_feed_cursor');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setFeedCursor = (clusterId: string, questionId: string): void => {
  sessionStorage.setItem('st_feed_cursor', JSON.stringify({ clusterId, questionId }));
};

export const clearFeedCursor = (): void => {
  sessionStorage.removeItem('st_feed_cursor');
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

  const allAnswered = new Set([...answeredIds, currentId]);

  const allClusterDone = currentClusterQuestions.every(q => allAnswered.has(q.id));

  if (!allClusterDone) {
    const nextInCluster = currentClusterQuestions.find(q => !allAnswered.has(q.id));
    if (nextInCluster) return { next: nextInCluster, clusterComplete: false };
  }

  const completedCluster = clusters.find(c => c.id === currentClusterId);
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
