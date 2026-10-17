import type { UserRole } from "@/lib/auth-api";
import { readApiError } from "@/lib/i18n/api-errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ManagedUser = {
  id: string;
  username: string;
  role: UserRole;
  vipExpiresAt: string | null;
  isVip: boolean;
  createdAt: string;
};

const parseError = readApiError;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchUsers(token: string): Promise<ManagedUser[]> {
  const response = await fetch(`${API_URL}/api/users`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { users: ManagedUser[] };
  return data.users;
}

export async function createUser(
  token: string,
  input: {
    username: string;
    password: string;
    role: UserRole;
    vipExpiresAt?: string | null;
  },
): Promise<ManagedUser> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { user: ManagedUser };
  return data.user;
}

export async function updateUser(
  token: string,
  id: string,
  input: {
    username?: string;
    password?: string;
    role?: UserRole;
    vipExpiresAt?: string | null;
  },
): Promise<ManagedUser> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { user: ManagedUser };
  return data.user;
}

export async function deleteUser(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
