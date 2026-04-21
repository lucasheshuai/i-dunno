import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./middleware/session";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Rate limiting for write endpoints: prevents scripted mass-creation of sessions
// and synthetic response submissions. Generous enough for real users (100 writes
// per 15 min), strict enough to stop cheap automation loops.
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests — please slow down and try again shortly" },
  skip: () => process.env.NODE_ENV === "test",
});

app.use("/api/sessions", writeLimiter);
app.use("/api/responses", writeLimiter);
app.use("/api/profile", writeLimiter);

app.use("/api", router);

export default app;
