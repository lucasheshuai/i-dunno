import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { ensureSession } from "../lib/session-store";
import { signSessionToken, issueChallenge, redeemChallenge } from "../lib/session-token";

const router: IRouter = Router();

/**
 * GET /api/sessions/challenge
 *
 * Issue a short-lived signed challenge token. The client must pass this token
 * to POST /api/sessions within 90 seconds. This enforces a mandatory round-trip
 * that prevents offline/pre-computed session minting and raises the automation
 * cost well above a plain single-request burst.
 */
router.get("/sessions/challenge", (_req, res): void => {
  res.json({ challenge: issueChallenge() });
});

/**
 * POST /api/sessions
 *
 * Creates a new anonymous session and returns a server-issued bearer token.
 * Requires a valid, unexpired, single-use challenge from GET /api/sessions/challenge
 * in the request body. This prevents mass session minting without interacting
 * with the server first.
 *
 * The returned token must be sent as `Authorization: Bearer <token>` on all
 * write endpoints (/api/responses, /api/profile POST, /api/questions/:id/results).
 */
router.post("/sessions", async (req, res): Promise<void> => {
  const { challenge } = req.body as { challenge?: string };

  if (!challenge || !redeemChallenge(challenge)) {
    res.status(400).json({
      error:
        "Valid challenge required. Call GET /api/sessions/challenge first and submit the token within 90 seconds.",
    });
    return;
  }

  const sessionId = randomUUID();
  await ensureSession(sessionId);
  const token = signSessionToken(sessionId);
  res.status(201).json({ sessionId, token });
});

export default router;
