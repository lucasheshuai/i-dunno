import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/session/reset", (req, res): void => {
  const newId = randomUUID();
  res.cookie("st_sid", newId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ ok: true });
});

export default router;
