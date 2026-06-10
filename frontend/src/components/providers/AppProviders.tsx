"use client";

import { AuthProvider } from "@/context/AuthContext";
import { PostsProvider } from "@/context/PostsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PostsProvider>{children}</PostsProvider>
    </AuthProvider>
  );
}
