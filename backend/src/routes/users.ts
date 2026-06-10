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
  .min(3, "帳戶名稱至少需要 3 個字元")
  .max(32, "帳戶名稱最多 32 個字元")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "帳戶名稱只能包含英文字母、數字及底線",
  );

const passwordSchema = z
  .string()
  .min(6, "密碼至少需要 6 個字元")
  .max(128, "密碼最多 128 個字元");

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
    { message: "請至少填寫一項欄位" },
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
      error: parsed.error.issues[0]?.message ?? "請求無效",
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
      res.status(409).json({ error: "此帳戶名稱已被使用" });
      return;
    }
    res.status(500).json({ error: "建立用戶失敗" });
  }
});

router.patch("/:id", async (req: AuthedRequest, res) => {
  const id = String(req.params.id);
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "請求無效",
    });
    return;
  }

  const existing = await findUserById(id);
  if (!existing) {
    res.status(404).json({ error: "找不到用戶" });
    return;
  }

  if (req.user?.sub === id && parsed.data.role && parsed.data.role !== "admin") {
    res.status(400).json({ error: "無法移除自己的管理員權限" });
    return;
  }

  try {
    const user = await updateUser(id, parsed.data);
    if (!user) {
      res.status(404).json({ error: "找不到用戶" });
      return;
    }
    res.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      res.status(409).json({ error: "此帳戶名稱已被使用" });
      return;
    }
    res.status(500).json({ error: "更新用戶失敗" });
  }
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const id = String(req.params.id);

  if (req.user?.sub === id) {
    res.status(400).json({ error: "無法刪除自己的帳戶" });
    return;
  }

  const deleted = await deleteUser(id);
  if (!deleted) {
    res.status(404).json({ error: "找不到用戶" });
    return;
  }

  res.json({ ok: true });
});

export default router;
