import { Router, type IRouter } from "express";
import healthRouter from "./health";
import sessionsRouter from "./sessions";
import questionsRouter from "./questions";
import clustersRouter from "./clusters";
import responsesRouter from "./responses";
import profileRouter from "./profile";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";
import sessionRouter from "./session";

const router: IRouter = Router();

router.use(healthRouter);
router.use(sessionsRouter);
router.use(questionsRouter);
router.use(clustersRouter);
router.use(responsesRouter);
router.use(profileRouter);
router.use(statsRouter);
router.use(leaderboardRouter);
router.use(sessionRouter);

export default router;
