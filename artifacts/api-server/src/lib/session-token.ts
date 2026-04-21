import { createHmac, timingSafeEqual } from "crypto";

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
