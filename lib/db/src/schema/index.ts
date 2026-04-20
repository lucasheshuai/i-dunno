import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const sessionsTable = pgTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  nickname: text("nickname"),
  ageRange: text("age_range"),
  gender: text("gender"),
  region: text("region"),
  relationshipStatus: text("relationship_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessionResponsesTable = pgTable(
  "session_responses",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessionsTable.sessionId, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    answer: text("answer").notNull(),
    predictedMajority: text("predicted_majority").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("session_responses_session_question_idx").on(table.sessionId, table.questionId)],
);

export type DbSession = typeof sessionsTable.$inferSelect;
export type DbSessionResponse = typeof sessionResponsesTable.$inferSelect;
