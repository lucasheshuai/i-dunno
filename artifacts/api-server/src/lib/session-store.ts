export interface SessionResponse {
  id: string;
  sessionId: string;
  questionId: string;
  answer: string;
  predictedMajority: string;
  createdAt: string;
}

export interface Session {
  sessionId: string;
  ageRange: string | null;
  gender: string | null;
  region: string | null;
  relationshipStatus: string | null;
  responses: SessionResponse[];
}

export const sessions = new Map<string, Session>();
