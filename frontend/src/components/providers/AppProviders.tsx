"use client";

import { AuthProvider } from "@/context/AuthContext";
import { PostsProvider } from "@/context/PostsContext";
import type { Locale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

export function AppProviders({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <AuthProvider>
        <PostsProvider>{children}</PostsProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
