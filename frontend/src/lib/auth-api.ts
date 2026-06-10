const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type UserRole = "member" | "admin";

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "請求失敗，請稍後再試";
  } catch {
    return "請求失敗，請稍後再試";
  }
}

export async function signupRequest(
  username: string,
  password: string,
  acceptedTerms: boolean,
  role: UserRole,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, acceptedTerms, role }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<AuthResponse>;
}

export async function loginRequest(
  username: string,
  password: string,
  role?: UserRole,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<AuthResponse>;
}

export async function logoutRequest(token: string): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function meRequest(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("登入已過期，請重新登入");
  }

  const data = (await response.json()) as { user: AuthUser };
  return data.user;
}
