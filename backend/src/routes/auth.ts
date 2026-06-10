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
    .min(3, "帳戶名稱至少需要 3 個字元")
    .max(32, "帳戶名稱最多 32 個字元")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "帳戶名稱只能包含英文字母、數字及底線",
    ),
  password: z
    .string()
    .min(6, "密碼至少需要 6 個字元")
    .max(128, "密碼最多 128 個字元"),
});

const signupSchema = credentialsSchema.extend({
  role: z.enum(["member", "admin"]),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "請勾選並同意服務條款" }),
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
      error: parsed.error.issues[0]?.message ?? "請求無效",
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
      res.status(409).json({ error: "此帳戶名稱已被使用" });
      return;
    }
    res.status(500).json({ error: "建立帳戶失敗" });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "請求無效",
    });
    return;
  }

  const { username, password, role } = parsed.data;
  const user = await findUserByUsername(username);

  if (!user || !(await verifyPassword(user, password))) {
    res.status(401).json({ error: "帳戶名稱或密碼不正確" });
    return;
  }

  if (role && user.role !== role) {
    res.status(403).json({
      error:
        role === "admin"
          ? "此帳戶並非管理員，請前往會員頁面登入。"
          : "此帳戶為管理員，請前往管理頁面登入。",
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
    res.status(401).json({ error: "找不到用戶" });
    return;
  }
  res.json({ user: publicUser(user) });
});

export default router;
