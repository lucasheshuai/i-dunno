import { Router, type IRouter } from "express";
import { questions, mockResults } from "../lib/seed-data";
import { getAnsweredQuestionIds } from "../lib/session-store";
import { extractSessionFromBearer } from "../lib/session-token";
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
  const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : null;
  const active = questions.filter((q) => q.status === "active");
  const c1Questions = active
    .filter((q) => q.topicClusterId === "c1")
    .sort((a, b) => a.clusterOrder - b.clusterOrder);

  if (sessionId) {
    const answeredIds = await getAnsweredQuestionIds(sessionId);
    const firstUnanswered = c1Questions.find((q) => !answeredIds.has(q.id));
    if (firstUnanswered) {
      res.json(firstUnanswered);
      return;
    }
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

  // Results are gated behind authenticated session identity: the caller must
  // present a valid server-issued bearer token AND that session must have already
  // answered this question.  Using the bearer token (rather than a plain query
  // param) ensures session identity is tied to server-issued proof — an attacker
  // cannot harvest results by constructing arbitrary sessionId values.
  const sessionId = extractSessionFromBearer(req.headers.authorization);
  if (sessionId) {
    const answeredIds = await getAnsweredQuestionIds(sessionId);
    if (answeredIds.has(params.data.id)) {
      res.json(result);
      return;
    }
  }

  res.status(403).json({ error: "You must answer this question before viewing results" });
});

export default router;
