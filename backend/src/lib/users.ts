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

export type PublicUser = {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
};

function mapPublicUser(row: Omit<UserRow, "password_hash"> & { created_at: Date }): PublicUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listUsers(): Promise<PublicUser[]> {
  const result = await query<Pick<UserRow, "id" | "username" | "role" | "created_at">>(
    `SELECT id, username, role, created_at
     FROM users
     ORDER BY created_at DESC`,
  );

  return result.rows.map(mapPublicUser);
}

export async function updateUser(
  id: string,
  input: {
    username?: string;
    password?: string;
    role?: UserRole;
  },
): Promise<PublicUser | null> {
  const existing = await findUserById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const params: unknown[] = [id];
  let index = 2;

  if (input.username !== undefined) {
    fields.push(`username = $${index}`);
    params.push(input.username.trim());
    index += 1;
  }

  if (input.password !== undefined) {
    fields.push(`password_hash = $${index}`);
    params.push(await bcrypt.hash(input.password, 12));
    index += 1;
  }

  if (input.role !== undefined) {
    fields.push(`role = $${index}`);
    params.push(input.role);
    index += 1;
  }

  if (fields.length === 0) {
    return {
      id: existing.id,
      username: existing.username,
      role: existing.role,
      createdAt: existing.createdAt,
    };
  }

  try {
    const result = await query<Pick<UserRow, "id" | "username" | "role" | "created_at">>(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = $1
       RETURNING id, username, role, created_at`,
      params,
    );

    const row = result.rows[0];
    return row ? mapPublicUser(row) : null;
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

export async function deleteUser(id: string): Promise<boolean> {
  const result = await query("DELETE FROM users WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
