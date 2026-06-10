import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { initDb } from "./lib/db.js";
import { ensureDatabase } from "./lib/ensure-database.js";
import authRoutes from "./routes/auth.js";
import recordsRoutes from "./routes/records.js";
import usersRoutes from "./routes/users.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/users", usersRoutes);

async function start() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  await ensureDatabase(process.env.DATABASE_URL);
  await initDb();

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
