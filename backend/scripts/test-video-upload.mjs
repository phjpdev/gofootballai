import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";
import jwt from "jsonwebtoken";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const r = await pool.query(
  "SELECT id, username, role FROM users WHERE role = 'admin' LIMIT 1",
);
await pool.end();

if (!r.rows[0]) {
  console.error("No admin user");
  process.exit(1);
}

const user = r.rows[0];
const token = jwt.sign(
  { sub: user.id, username: user.username, role: user.role },
  process.env.JWT_SECRET ?? "dev-only-change-me",
  { expiresIn: "1h" },
);

// Minimal valid MP4 header bytes (ftyp box) — enough for upload test
const minimalMp4 = Buffer.from([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
  0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
]);
const testPath = join(process.cwd(), "uploads", "test-minimal.mp4");
writeFileSync(testPath, minimalMp4);

const form = new FormData();
form.append("type", "video");
form.append("title", "Test video upload");
form.append("displayDate", "2026-06-29");
form.append("starRating", "5");
form.append(
  "file",
  new Blob([minimalMp4], { type: "application/octet-stream" }),
  "test.mp4",
);

const res = await fetch("http://localhost:4000/api/records", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});

const text = await res.text();
console.log("Status:", res.status);
console.log("Body:", text);
