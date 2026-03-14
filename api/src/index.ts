import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import usersRouter from "./routes/users";
import authRouter from "./routes/auth";
import subjectsRouter from "./routes/subjects";
import coursesRouter from "./routes/courses";
import modulesRouter from "./routes/modules";
import lessonsRouter from "./routes/lessons";
import stepsRouter from "./routes/steps";
import submissionsRouter from "./routes/submissions";
import meRouter from "./routes/me";
import enrollmentsRouter from "./routes/enrollments";
import adminRouter from "./routes/admin";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/lessons", lessonsRouter);
app.use("/api/steps", stepsRouter);
app.use("/api/submissions", submissionsRouter);
app.use("/api/me", meRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/admin", adminRouter);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
