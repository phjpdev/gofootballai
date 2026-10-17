"use client";

import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/auth-api";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  portalRole: UserRole;
  termsHref?: string;
  redirectTo?: string;
};

export function AuthForm({
  portalRole,
  termsHref = "/member#terms",
  redirectTo = "/analysis",
}: AuthFormProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, signup } = useAuth();
  const { t } = useI18n();
  const copy = t.member.auth;
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (!acceptedTerms) {
          setError(copy.acceptTermsRequired);
          return;
        }
        await signup(username, password, acceptedTerms, portalRole);
      } else {
        await login(username, password, portalRole);
      }
      setUsername("");
      setPassword("");
      setAcceptedTerms(false);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-40 animate-pulse rounded-[24px] bg-gray-90" aria-hidden />
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-[24px] bg-gray-90 p-4">
      <p className="text-sm font-medium text-gray-40">
        {copy.portalTitle[portalRole]}
      </p>

      <div className="flex rounded-[14px] bg-gray-80 p-1">
        {(["login", "signup"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setMode(tab);
              setError("");
            }}
            className={`flex-1 rounded-[10px] py-2 text-sm font-semibold transition-colors ${
              mode === tab
                ? "bg-gray-100 text-white"
                : "text-gray-40 hover:text-white"
            }`}
          >
            {tab === "login" ? copy.login : copy.signup}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
        <input
          type="text"
          autoComplete="username"
          placeholder={copy.usernamePlaceholder}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
        />
        <input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={copy.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
        />

        {mode === "signup" && (
          <label className="flex items-start gap-2 text-sm leading-[1.5] text-gray-20">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-gray-60 accent-orange-50"
            />
            <span>
              {copy.termsPrefix}{" "}
              <Link href={termsHref} className="text-[#2F80FF] underline">
                {copy.termsLink}
              </Link>
            </span>
          </label>
        )}

        {error && <p className="text-xs text-orange-50">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 items-center justify-center gap-2 rounded-[19px] bg-orange-50 text-sm font-semibold text-white disabled:opacity-60"
        >
          {mode === "login" ? (
            <>
              <LogIn className="size-4" />
              {copy.login}
            </>
          ) : (
            <>
              <UserPlus className="size-4" />
              {copy.signup}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
