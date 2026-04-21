import { Router, type IRouter } from "express";
import { questions, mockResults } from "../lib/seed-data";
import { getAnsweredQuestionIds } from "../lib/session-store";
import {
  ListQuestionsQueryParams,
  GetQuestionParams,
  GetQuestionResultsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/questions", async (req, res): Promise<void> => {
  const parsed = ListQuestionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category } = parsed.data;
  const filtered = category
    ? questions.filter((q) => q.category === category && q.status === "active")
    : questions.filter((q) => q.status === "active");

  res.json(filtered);
});

router.get("/questions/today", async (req, res): Promise<void> => {
  const sessionId = req.sessionId;
  const active = questions.filter((q) => q.status === "active");
  const c1Questions = active
    .filter((q) => q.topicClusterId === "c1")
    .sort((a, b) => a.clusterOrder - b.clusterOrder);

  const answeredIds = await getAnsweredQuestionIds(sessionId);
  const firstUnanswered = c1Questions.find((q) => !answeredIds.has(q.id));
  if (firstUnanswered) {
    res.json(firstUnanswered);
    return;
  }

  res.json(c1Questions[0] ?? active[0]);
});

router.get("/questions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetQuestionParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const question = questions.find((q) => q.id === params.data.id);
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json(question);
});

router.get("/questions/:id/results", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetQuestionResultsParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const question = questions.find((q) => q.id === params.data.id);
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const result = mockResults.get(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Results not found" });
    return;
  }

  // Only reveal majorityAnswer (the prediction answer key) after the caller has
  // committed their own answer. This prevents scripted requests from reading the
  // answer key before submitting, which would trivially game prediction scoring.
  // Identity comes from the server-issued HttpOnly cookie (req.sessionId).
  const answeredIds = await getAnsweredQuestionIds(req.sessionId);
  if (answeredIds.has(params.data.id)) {
    res.json(result);
    return;
  }

  // Session hasn't answered yet: return distribution and segment data for
  // preview purposes but strip the majority answer key.
  const { majorityAnswer: _redacted, ...safeResult } = result;
  res.json({ ...safeResult, majorityAnswer: null });
});

export default router;
