import { db, sessionsTable, sessionResponsesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

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
  nickname: string | null;
  ageRange: string | null;
  gender: string | null;
  region: string | null;
  relationshipStatus: string | null;
  responses: SessionResponse[];
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const rows = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionId, sessionId))
    .limit(1);

  if (rows.length === 0) return null;

  const sessionRow = rows[0];
  const responseRows = await db
    .select()
    .from(sessionResponsesTable)
    .where(eq(sessionResponsesTable.sessionId, sessionId));

  return {
    sessionId: sessionRow.sessionId,
    nickname: sessionRow.nickname,
    ageRange: sessionRow.ageRange,
    gender: sessionRow.gender,
    region: sessionRow.region,
    relationshipStatus: sessionRow.relationshipStatus,
    responses: responseRows.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      questionId: r.questionId,
      answer: r.answer,
      predictedMajority: r.predictedMajority,
      createdAt: r.createdAt,
    })),
  };
}

export async function ensureSession(sessionId: string): Promise<void> {
  await db
    .insert(sessionsTable)
    .values({ sessionId })
    .onConflictDoNothing();
}

export async function updateSessionDemographics(
  sessionId: string,
  fields: {
    nickname?: string | null;
    ageRange?: string | null;
    gender?: string | null;
    region?: string | null;
    relationshipStatus?: string | null;
  },
): Promise<void> {
  await db
    .update(sessionsTable)
    .set(fields)
    .where(eq(sessionsTable.sessionId, sessionId));
}

export async function addSessionResponse(response: SessionResponse): Promise<boolean> {
  const rows = await db
    .insert(sessionResponsesTable)
    .values({
      id: response.id,
      sessionId: response.sessionId,
      questionId: response.questionId,
      answer: response.answer,
      predictedMajority: response.predictedMajority,
      createdAt: response.createdAt,
    })
    .onConflictDoNothing()
    .returning({ id: sessionResponsesTable.id });
  return rows.length > 0;
}

export async function getAnsweredQuestionIds(sessionId: string): Promise<Set<string>> {
  const rows = await db
    .select({ questionId: sessionResponsesTable.questionId })
    .from(sessionResponsesTable)
    .where(eq(sessionResponsesTable.sessionId, sessionId));
  return new Set(rows.map((r) => r.questionId));
}

export async function getAllSessionsIterable(): Promise<Session[]> {
  const sessionRows = await db.select().from(sessionsTable);
  if (sessionRows.length === 0) return [];

  const responseRows = await db.select().from(sessionResponsesTable);

  const responsesBySession = new Map<string, SessionResponse[]>();
  for (const r of responseRows) {
    const list = responsesBySession.get(r.sessionId) ?? [];
    list.push({
      id: r.id,
      sessionId: r.sessionId,
      questionId: r.questionId,
      answer: r.answer,
      predictedMajority: r.predictedMajority,
      createdAt: r.createdAt,
    });
    responsesBySession.set(r.sessionId, list);
  }

  return sessionRows.map((s) => ({
    sessionId: s.sessionId,
    nickname: s.nickname,
    ageRange: s.ageRange,
    gender: s.gender,
    region: s.region,
    relationshipStatus: s.relationshipStatus,
    responses: responsesBySession.get(s.sessionId) ?? [],
  }));
}

export interface LeaderboardRow {
  sessionId: string;
  nickname: string | null;
  answeredCount: number;
  correctPredictions: number;
}

/**
 * Compute per-session leaderboard stats in a single SQL aggregation.
 * Accepts a map of { questionId → expectedMajorityAnswer } from seed data
 * so correct-prediction counting is pushed into SQL rather than loaded row-by-row.
 * Only returns sessions with at least 1 answer.
 */
export async function getLeaderboardStats(
  majorityAnswerMap: Map<string, string>,
): Promise<LeaderboardRow[]> {
  if (majorityAnswerMap.size === 0) return [];

  // Build a SQL CASE WHEN expression to count correct predictions in the DB.
  // Shape: SUM(CASE WHEN (qid='q1' AND pm='Yes') WHEN (qid='q2' AND pm='No') ... ELSE 0 END)
  const cases = [...majorityAnswerMap.entries()].map(
    ([qId, majority]) =>
      sql`WHEN (${sessionResponsesTable.questionId} = ${qId} AND ${sessionResponsesTable.predictedMajority} = ${majority}) THEN 1`,
  );

  const caseExpr = sql`SUM(CASE ${sql.join(cases, sql` `)} ELSE 0 END)`;

  const rows = await db
    .select({
      sessionId: sessionsTable.sessionId,
      nickname: sessionsTable.nickname,
      answeredCount: sql<number>`COUNT(${sessionResponsesTable.id})::int`,
      correctPredictions: sql<number>`${caseExpr}::int`,
    })
    .from(sessionsTable)
    .innerJoin(
      sessionResponsesTable,
      eq(sessionsTable.sessionId, sessionResponsesTable.sessionId),
    )
    .groupBy(sessionsTable.sessionId, sessionsTable.nickname)
    .having(sql`COUNT(${sessionResponsesTable.id}) > 0`);

  return rows.map((r) => ({
    sessionId: r.sessionId,
    nickname: r.nickname,
    answeredCount: r.answeredCount,
    correctPredictions: r.correctPredictions ?? 0,
  }));
}

export async function getGlobalStats(): Promise<{ totalSessions: number; totalResponses: number }> {
  const rows = await db.execute<{ total_sessions: string; total_responses: string }>(
    sql`
      SELECT
        (SELECT COUNT(*)::int FROM sessions) AS total_sessions,
        (SELECT COUNT(*)::int FROM session_responses) AS total_responses
    `
  );
  const row = rows.rows[0];
  return {
    totalSessions: Number(row?.total_sessions ?? 0),
    totalResponses: Number(row?.total_responses ?? 0),
  };
}
