"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  signupRequest,
  type AuthUser,
  type UserRole,
} from "@/lib/auth-api";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  login: (username: string, password: string, role?: UserRole) => Promise<void>;
  signup: (
    username: string,
    password: string,
    acceptedTerms: boolean,
    role: UserRole,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "gofootball-token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    meRequest(stored)
      .then((currentUser) => {
        setToken(stored);
        setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persistSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (username: string, password: string, role?: UserRole) => {
      const { token: nextToken, user: nextUser } = await loginRequest(
        username,
        password,
        role,
      );
      persistSession(nextToken, nextUser);
    },
    [persistSession],
  );

  const signup = useCallback(
    async (
      username: string,
      password: string,
      acceptedTerms: boolean,
      role: UserRole,
    ) => {
      const { token: nextToken, user: nextUser } = await signupRequest(
        username,
        password,
        acceptedTerms,
        role,
      );
      persistSession(nextToken, nextUser);
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutRequest(token);
      } catch {
        // clear local session even if server call fails
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === "admin",
        isMember: user?.role === "member",
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
