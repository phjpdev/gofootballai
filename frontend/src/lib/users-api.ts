import type { UserRole } from "@/lib/auth-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ManagedUser = {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "請求失敗，請稍後再試";
  } catch {
    return "請求失敗，請稍後再試";
  }
}

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
  input: { username: string; password: string; role: UserRole },
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
  input: { username?: string; password?: string; role?: UserRole },
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
