import dns from "node:dns";
import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { initDb } from "./lib/db.js";
import { ensureDatabase } from "./lib/ensure-database.js";
import { syncArchivedFromAnalyses } from "./lib/archived-hkjc.js";
import authRoutes from "./routes/auth.js";
import analysesRoutes from "./routes/analyses.js";
import recordsRoutes from "./routes/records.js";
import usersRoutes from "./routes/users.js";
import hkjcRoutes from "./routes/hkjc.js";
import featuredRoutes from "./routes/featured.js";
import homeSectionsRoutes from "./routes/home-sections.js";
import topMatchPreviewsRoutes from "./routes/top-match-previews.js";
import matchPickOverridesRoutes from "./routes/match-pick-overrides.js";
import { seedFeaturedItems } from "./lib/featured.js";
import { seedHomeSections } from "./lib/home-sections.js";
import { seedTopMatchPreviews } from "./lib/top-match-previews.js";

dns.setDefaultResultOrder("ipv4first");

const app = express();
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const uploadsDir = path.join(process.cwd(), "uploads");

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    exposedHeaders: ["Content-Length", "Content-Range", "Accept-Ranges"],
    allowedHeaders: ["Authorization", "Content-Type", "Range"],
  }),
);
app.use(express.json());

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", corsOrigin);
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range, Accept-Ranges",
    );
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Accept-Ranges", "bytes");
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Range");
      res.status(204).end();
      return;
    }
    next();
  },
  express.static(uploadsDir, {
    setHeaders(res, filePath) {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".mp4" || ext === ".m4v") {
        res.setHeader("Content-Type", "video/mp4");
      } else if (ext === ".webm") {
        res.setHeader("Content-Type", "video/webm");
      } else if (ext === ".mov") {
        res.setHeader("Content-Type", "video/quicktime");
      }
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/analyses", analysesRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/hkjc", hkjcRoutes);
app.use("/api/featured", featuredRoutes);
app.use("/api/home-sections", homeSectionsRoutes);
app.use("/api/top-match-previews", topMatchPreviewsRoutes);
app.use("/api/match-pick-overrides", matchPickOverridesRoutes);

async function start() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  await ensureDatabase(process.env.DATABASE_URL);
  await initDb();
  const synced = await syncArchivedFromAnalyses();
  if (synced > 0) {
    console.log(`Synced ${synced} archived matches from analyses`);
  }
  await seedFeaturedItems();
  await seedHomeSections();
  await seedTopMatchPreviews();

  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
