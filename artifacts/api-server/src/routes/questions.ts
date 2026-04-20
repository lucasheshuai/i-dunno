import { Router, type IRouter } from "express";
import { questions, mockResults } from "../lib/seed-data";
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

router.get("/questions/today", async (_req, res): Promise<void> => {
  const active = questions.filter((q) => q.status === "active");
  const first = active.find((q) => q.topicClusterId === "c1" && q.clusterOrder === 1) ?? active[0];
  res.json(first);
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

  res.json(result);
});

export default router;
