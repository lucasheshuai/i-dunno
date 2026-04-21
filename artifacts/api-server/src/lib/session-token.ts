import { createHmac, timingSafeEqual } from "crypto";

const SEP = ".";

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-only-insecure-change-before-deploy";
}

/**
 * Sign a sessionId and return an opaque bearer token.
 * Format: `<sessionId>.<hmac-sha256-hex>`
 */
export function signSessionToken(sessionId: string): string {
  const sig = createHmac("sha256", getSecret()).update(sessionId).digest("hex");
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

  const expected = createHmac("sha256", getSecret()).update(sessionId).digest("hex");

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
