import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { SubmitResponseBody } from "@workspace/api-zod";
import { ensureSession, addSessionResponse, getAnsweredQuestionIds } from "../lib/session-store";
import { questions } from "../lib/seed-data";
import { extractSessionFromBearer } from "../lib/session-token";

const router: IRouter = Router();

router.post("/responses", async (req, res): Promise<void> => {
  // ── Session identity verification ─────────────────────────────────────────
  // sessionId must come from a server-issued bearer token, not a freely
  // fabricated value in the request body.  This prevents callers from
  // submitting responses on behalf of arbitrary session IDs.
  const tokenSessionId = extractSessionFromBearer(req.headers.authorization);
  if (!tokenSessionId) {
    res.status(401).json({ error: "Valid session token required. Call POST /api/sessions first." });
    return;
  }

  const parsed = SubmitResponseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId: bodySessionId, questionId, answer, predictedMajority } = parsed.data;

  // Defense-in-depth: reject mismatches between the token identity and the
  // body identity (indicates a confused or malicious client).
  if (bodySessionId !== tokenSessionId) {
    res.status(403).json({ error: "Session token does not match request body sessionId" });
    return;
  }

  const sessionId = tokenSessionId;

  const question = questions.find((q) => q.id === questionId);
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  if (!question.options.includes(answer)) {
    res.status(400).json({ error: "Invalid answer: not a valid option for this question" });
    return;
  }

  if (!question.options.includes(predictedMajority)) {
    res.status(400).json({ error: "Invalid predictedMajority: not a valid option for this question" });
    return;
  }

  await ensureSession(sessionId);

  const answeredIds = await getAnsweredQuestionIds(sessionId);
  if (answeredIds.has(questionId)) {
    res.status(409).json({ error: "Question already answered" });
    return;
  }

  const response = {
    id: randomUUID(),
    sessionId,
    questionId,
    answer,
    predictedMajority,
    createdAt: new Date().toISOString(),
  };

  const inserted = await addSessionResponse(response);
  if (!inserted) {
    res.status(409).json({ error: "Question already answered" });
    return;
  }

  res.status(201).json(response);
});

export default router;
