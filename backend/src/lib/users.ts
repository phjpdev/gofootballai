import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { query } from "./db.js";
import type { UserRecord, UserRole } from "../types.js";

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
};

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  };
}

export async function findUserByUsername(
  username: string,
): Promise<UserRecord | null> {
  const result = await query<UserRow>(
    `SELECT id, username, password_hash, role, created_at
     FROM users
     WHERE LOWER(username) = LOWER($1)
     LIMIT 1`,
    [username.trim()],
  );

  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const result = await query<UserRow>(
    `SELECT id, username, password_hash, role, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  const row = result.rows[0];
  return row ? mapUser(row) : null;
}

export async function createUser(
  username: string,
  password: string,
  role: UserRole,
): Promise<UserRecord> {
  const trimmed = username.trim();
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await query<UserRow>(
      `INSERT INTO users (id, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, password_hash, role, created_at`,
      [id, trimmed, passwordHash, role],
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("CREATE_FAILED");
    }

    return mapUser(row);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      throw new Error("USERNAME_TAKEN");
    }
    throw error;
  }
}

export async function verifyPassword(
  user: UserRecord,
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
