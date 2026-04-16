
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

// Flow state in-memory
export const flowState: Record<string, { answer?: string; prediction?: string }> = {};

export const setFlowAnswer = (questionId: string, answer: string) => {
  if (!flowState[questionId]) flowState[questionId] = {};
  flowState[questionId].answer = answer;
};

export const setFlowPrediction = (questionId: string, prediction: string) => {
  if (!flowState[questionId]) flowState[questionId] = {};
  flowState[questionId].prediction = prediction;
};

export const getFlowState = (questionId: string) => {
  return flowState[questionId] || {};
};

export const clearFlowState = (questionId: string) => {
  delete flowState[questionId];
};
