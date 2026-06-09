"use client";

import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function AdminLogin() {
  const { isAdmin, login, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setPassword("");
      setError(false);
    } else {
      setError(true);
    }
  }

  if (isAdmin) {
    return (
      <div className="flex items-center justify-between rounded-[24px] bg-gray-90 p-4">
        <div>
          <p className="text-sm font-bold text-white">Admin Mode</p>
          <p className="text-xs text-gray-40">You can post on Records page</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-[14px] bg-gray-80 px-4 py-2 text-sm font-medium text-gray-20"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-3 rounded-[24px] bg-gray-90 p-4"
    >
      <p className="text-sm font-bold text-white">Admin Login</p>
      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
      />
      {error && (
        <p className="text-xs text-orange-50">Invalid password. Try again.</p>
      )}
      <button
        type="submit"
        className="flex h-12 items-center justify-center gap-2 rounded-[19px] bg-orange-50 text-sm font-semibold text-white"
      >
        <LogIn className="size-4" />
        Login as Admin
      </button>
    </form>
  );
}
