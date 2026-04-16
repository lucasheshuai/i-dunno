
export const getSessionId = () => {
  let id = localStorage.getItem('st_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('st_session_id', id);
  }
  return id;
};

export const hasOnboarded = () => {
  return localStorage.getItem('st_onboarded') === 'true';
};

export const setOnboarded = () => {
  localStorage.setItem('st_onboarded', 'true');
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

export const isQuestionAnswered = (id: string) => {
  return !!getAnsweredQuestions()[id];
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
