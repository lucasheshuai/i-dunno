import { Router, type IRouter } from "express";
import { getGlobalStats } from "../lib/session-store";
import { questions } from "../lib/seed-data";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const { totalSessions, totalResponses } = await getGlobalStats();

  const totalQuestions = questions.filter((q) => q.status === "active").length;

  res.json({
    totalResponses: totalResponses + 14200,
    totalQuestions,
    activeUsers: totalSessions + 3847,
    topCategory: "Dating",
  });
});

export default router;
