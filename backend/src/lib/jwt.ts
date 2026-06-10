import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload, UserRecord } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export function signToken(user: UserRecord): string {
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
