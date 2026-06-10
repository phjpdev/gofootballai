import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";
import type { JwtPayload, UserRole } from "../types.js";

export type AuthedRequest = Request & { user?: JwtPayload };

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "請先登入" });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "登入憑證無效或已過期" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "沒有權限執行此操作" });
      return;
    }
    next();
  };
}

export const requireAdmin = requireRole("admin");
export const requireMember = requireRole("member", "admin");
