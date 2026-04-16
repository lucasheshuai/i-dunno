import { Router, type IRouter } from "express";
import healthRouter from "./health";
import questionsRouter from "./questions";
import responsesRouter from "./responses";
import profileRouter from "./profile";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(questionsRouter);
router.use(responsesRouter);
router.use(profileRouter);
router.use(statsRouter);
router.use(leaderboardRouter);

export default router;
