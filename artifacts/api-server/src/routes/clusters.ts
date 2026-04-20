import { Router, type IRouter } from "express";
import { clusters } from "../lib/seed-data";

const router: IRouter = Router();

router.get("/clusters", async (_req, res): Promise<void> => {
  res.json(clusters);
});

export default router;
