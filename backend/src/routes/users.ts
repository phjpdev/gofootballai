import { Router } from "express";
import { z } from "zod";
import {
  createUser,
  deleteUser,
  findUserById,
  listUsers,
  updateUser,
} from "../lib/users.js";
import {
  requireAdmin,
  requireAuth,
  type AuthedRequest,
} from "../middleware/auth.js";
import type { UserRole } from "../types.js";

const router = Router();

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Account name must be at least 3 characters")
  .max(32, "Account name must be at most 32 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Account name can only contain letters, numbers, and underscores",
  );

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be at most 128 characters");

const createUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  role: z.enum(["member", "admin"]),
});

const updateUserSchema = z
  .object({
    username: usernameSchema.optional(),
    password: passwordSchema.optional(),
    role: z.enum(["member", "admin"]).optional(),
  })
  .refine(
    (data) =>
      data.username !== undefined ||
      data.password !== undefined ||
      data.role !== undefined,
    { message: "At least one field is required" },
  );

router.use(requireAuth, requireAdmin);

router.get("/", async (_req, res) => {
  const users = await listUsers();
  res.json({ users });
});

router.post("/", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid request",
    });
    return;
  }

  const { username, password, role } = parsed.data;

  try {
    const user = await createUser(username, password, role as UserRole);
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      res.status(409).json({ error: "Account name is already taken" });
      return;
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.patch("/:id", async (req: AuthedRequest, res) => {
  const id = String(req.params.id);
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Invalid request",
    });
    return;
  }

  const existing = await findUserById(id);
  if (!existing) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (req.user?.sub === id && parsed.data.role && parsed.data.role !== "admin") {
    res.status(400).json({ error: "You cannot remove your own admin role" });
    return;
  }

  try {
    const user = await updateUser(id, parsed.data);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      res.status(409).json({ error: "Account name is already taken" });
      return;
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const id = String(req.params.id);

  if (req.user?.sub === id) {
    res.status(400).json({ error: "You cannot delete your own account" });
    return;
  }

  const deleted = await deleteUser(id);
  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ ok: true });
});

export default router;
