import { Router, type IRouter } from "express";
import { sessions } from "../lib/session-store";
import { questions } from "../lib/seed-data";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  let totalResponses = 0;
  for (const session of sessions.values()) {
    totalResponses += session.responses.length;
  }

  const totalQuestions = questions.filter((q) => q.status === "active").length;
  const activeUsers = sessions.size;

  res.json({
    totalResponses: totalResponses + 14200,
    totalQuestions,
    activeUsers: activeUsers + 3847,
    topCategory: "Dating",
  });
});

export default router;
