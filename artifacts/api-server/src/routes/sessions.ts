import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { ensureSession } from "../lib/session-store";
import { signSessionToken } from "../lib/session-token";

const router: IRouter = Router();

/**
 * POST /api/sessions
 *
 * Creates a new anonymous session and returns a server-issued bearer token.
 * The token must be sent as `Authorization: Bearer <token>` on all write
 * endpoints (/api/responses, /api/profile POST). This ensures session IDs
 * are server-controlled and not freely fabricated by callers.
 */
router.post("/sessions", async (_req, res): Promise<void> => {
  const sessionId = randomUUID();
  await ensureSession(sessionId);
  const token = signSessionToken(sessionId);
  res.status(201).json({ sessionId, token });
});

export default router;
