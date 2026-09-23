import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./router/index.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));

// Coarse global limiter so a single client can't flood the API.
// Skipped under NODE_ENV=test: the integration suite's volume would trip it and
// the limiter behaviour is verified in isolation.
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    skip: () => process.env.NODE_ENV === "test",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, message: "Too many requests, please try again later" }),
});

app.use(globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(process.env.BASE_URL as string, router);

export default app;