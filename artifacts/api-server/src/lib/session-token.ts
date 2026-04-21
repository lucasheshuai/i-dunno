import { createHmac, timingSafeEqual, randomUUID } from "crypto";

const SEP = ".";

/**
 * Resolve the signing secret exactly once at module load time (app startup).
 *
 * Rules:
 *  - Production / development: SESSION_SECRET env var is required and must be
 *    at least 32 characters long. The app throws immediately on startup if it
 *    is missing or too short — failing fast rather than silently using a weak
 *    fallback that an attacker could exploit to forge tokens offline.
 *  - Test environments: a deterministic constant is used so tests don't need
 *    env setup.
 */
function resolveSecret(): string {
  if (process.env.NODE_ENV === "test") {
    return "test-static-secret-exactly-32chars";
  }

  const env = process.env.SESSION_SECRET;
  if (!env || env.length < 32) {
    throw new Error(
      "SESSION_SECRET environment variable is required and must be at least 32 characters. " +
        "Generate one with: openssl rand -hex 32",
    );
  }
  return env;
}

// Eagerly resolved at import time so the app crashes immediately if misconfigured
const SECRET = resolveSecret();

/**
 * Sign a sessionId and return an opaque bearer token.
 * Format: `<sessionId>.<hmac-sha256-hex>`
 */
export function signSessionToken(sessionId: string): string {
  const sig = createHmac("sha256", SECRET).update(sessionId).digest("hex");
  return `${sessionId}${SEP}${sig}`;
}

/**
 * Verify a bearer token and return the embedded sessionId, or null if invalid/tampered.
 * Uses constant-time comparison to resist timing attacks.
 */
export function verifySessionToken(token: string): string | null {
  const sep = token.lastIndexOf(SEP);
  if (sep === -1) return null;

  const sessionId = token.slice(0, sep);
  const sig = token.slice(sep + 1);

  if (!sessionId || !sig) return null;

  const expected = createHmac("sha256", SECRET).update(sessionId).digest("hex");

  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    return sessionId;
  } catch {
    return null;
  }
}

/**
 * Extract and verify a bearer token from an Authorization header value.
 * Returns the verified sessionId or null.
 */
export function extractSessionFromBearer(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return verifySessionToken(authHeader.slice(7));
}

// ── Challenge-response for session creation ────────────────────────────────
//
// POST /api/sessions requires a fresh server-signed challenge to prove the
// caller made an outbound request immediately before creating the session.
// This adds a mandatory round-trip that prevents offline/ahead-of-time session
// farming and raises the cost of automated minting above plain HTTP automation.

const CHALLENGE_TTL_MS = 90_000; // 90 s to complete the create-session flow
const CHALLENGE_SEP = "|";

// Tracks challenges that have already been redeemed (single-process; resets on restart)
const _usedChallenges = new Set<string>();

/** Issue a short-lived, server-signed challenge nonce. */
export function issueChallenge(): string {
  const nonce = randomUUID();
  const ts = Date.now().toString();
  const sig = createHmac("sha256", SECRET)
    .update(`${nonce}${CHALLENGE_SEP}${ts}`)
    .digest("hex");
  return `${nonce}${CHALLENGE_SEP}${ts}${CHALLENGE_SEP}${sig}`;
}

/**
 * Verify a challenge token.
 * Returns true if the challenge is valid, not expired, and has not been used before.
 * Marks the challenge as used on success so it cannot be replayed.
 */
export function redeemChallenge(token: string): boolean {
  const parts = token.split(CHALLENGE_SEP);
  if (parts.length !== 3) return false;
  const [nonce, ts, sig] = parts;

  if (_usedChallenges.has(token)) return false;

  const issued = parseInt(ts, 10);
  if (isNaN(issued) || Date.now() - issued > CHALLENGE_TTL_MS) return false;

  const expected = createHmac("sha256", SECRET)
    .update(`${nonce}${CHALLENGE_SEP}${ts}`)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expBuf)) return false;
  } catch {
    return false;
  }

  _usedChallenges.add(token);
  return true;
}
