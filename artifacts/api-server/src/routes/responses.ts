import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { SubmitResponseBody } from "@workspace/api-zod";
import { ensureSession, addSessionResponse, getAnsweredQuestionIds } from "../lib/session-store";
import { questions } from "../lib/seed-data";
const router: IRouter = Router();

router.post("/responses", async (req, res): Promise<void> => {
  const parsed = SubmitResponseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const sessionId = req.sessionId;
  const { questionId, answer, predictedMajority } = parsed.data;

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
