import { Router } from "express";
import { z } from "zod";
import {
  createUser,
  findUserById,
  findUserByUsername,
  verifyPassword,
} from "../lib/users.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import type { UserRole } from "../types.js";

const router = Router();

const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Account name must be at least 3 characters")
    .max(32, "Account name must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Account name can only contain letters, numbers, and underscores",
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be at most 128 characters"),
});

const signupSchema = credentialsSchema.extend({
  role: z.enum(["member", "admin"]),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms of Service" }),
  }),
});

const loginSchema = credentialsSchema.extend({
  role: z.enum(["member", "admin"]).optional(),
});

function publicUser(user: { id: string; username: string; role: string }) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid request",
    });
    return;
  }

  const { username, password, role } = parsed.data;

  try {
    const user = await createUser(username, password, role as UserRole);
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      res.status(409).json({ error: "Account name is already taken" });
      return;
    }
    res.status(500).json({ error: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid request",
    });
    return;
  }

  const { username, password, role } = parsed.data;
  const user = await findUserByUsername(username);

  if (!user || !(await verifyPassword(user, password))) {
    res.status(401).json({ error: "Invalid account name or password" });
    return;
  }

  if (role && user.role !== role) {
    res.status(403).json({
      error:
        role === "admin"
          ? "This account is not an admin. Use the Member page to log in."
          : "This account is an admin. Use the Admin page to log in.",
    });
    return;
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await findUserById(req.user!.sub);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ user: publicUser(user) });
});

export default router;
