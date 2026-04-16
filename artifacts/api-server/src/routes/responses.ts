import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { SubmitResponseBody } from "@workspace/api-zod";
import { sessions } from "../lib/session-store";
import { questions } from "../lib/seed-data";

const router: IRouter = Router();

router.post("/responses", async (req, res): Promise<void> => {
  const parsed = SubmitResponseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, questionId, answer, predictedMajority } = parsed.data;

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

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      sessionId,
      ageRange: null,
      gender: null,
      region: null,
      relationshipStatus: null,
      responses: [],
    });
  }

  const session = sessions.get(sessionId)!;

  const response = {
    id: randomUUID(),
    sessionId,
    questionId,
    answer,
    predictedMajority,
    createdAt: new Date().toISOString(),
  };

  session.responses.push(response);

  res.status(201).json(response);
});

export default router;
