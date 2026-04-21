import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

const SESSION_COOKIE = "st_sid";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const existing = req.cookies?.[SESSION_COOKIE];

  if (isValidUUID(existing)) {
    req.sessionId = existing;
  } else {
    const id = randomUUID();
    req.sessionId = id;
    res.cookie(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  next();
}
