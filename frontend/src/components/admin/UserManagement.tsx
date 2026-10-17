"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type ManagedUser,
} from "@/lib/users-api";
import type { UserRole } from "@/lib/auth-api";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  formatVipExpiryDate,
  isActiveVip,
  toVipDateInputValue,
} from "@/lib/vip";
import { cn } from "@/lib/utils";

type UserFormState = {
  username: string;
  password: string;
  role: UserRole;
  isVip: boolean;
  vipExpiresAt: string;
};

const EMPTY_FORM: UserFormState = {
  username: "",
  password: "",
  role: "member",
  isVip: false,
  vipExpiresAt: "",
};

function formatJoinDate(iso: string, locale: Locale): string {
  return formatDate(iso, locale, {
    year: "numeric",
    month: locale === "en" ? "short" : "long",
    day: "numeric",
  });
}

function buildVipPayload(form: UserFormState): string | null | undefined {
  if (form.role === "admin") return null;
  if (!form.isVip) return null;
  return form.vipExpiresAt;
}

function userToForm(user: ManagedUser): UserFormState {
  const hasVipDate = Boolean(user.vipExpiresAt);
  return {
    username: user.username,
    password: "",
    role: user.role,
    isVip: hasVipDate,
    vipExpiresAt: toVipDateInputValue(user.vipExpiresAt),
  };
}

function UserRoleBadges({ user }: { user: ManagedUser }) {
  const { locale, t } = useI18n();
  const vipActive = isActiveVip(user.vipExpiresAt);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-gray-40">{t.common.roles[user.role]}</span>
      {user.vipExpiresAt && (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
            vipActive
              ? "bg-orange-50/20 text-orange-50"
              : "bg-gray-80 text-gray-40",
          )}
        >
          {vipActive ? t.admin.users.vip : t.admin.users.vipExpired}
        </span>
      )}
      {user.vipExpiresAt && (
        <span className="text-[10px] text-gray-40">
          {t.admin.users.expiresOn(
            formatVipExpiryDate(user.vipExpiresAt, locale),
          )}
        </span>
      )}
    </div>
  );
}

function UserFormModal({
  open,
  title,
  submitLabel,
  initial,
  requirePassword,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  submitLabel: string;
  initial: UserFormState;
  requirePassword: boolean;
  onClose: () => void;
  onSubmit: (input: UserFormState) => Promise<void>;
}) {
  const { t } = useI18n();
  const copy = t.admin.form;
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initial);
    setError("");
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim()) return;
    if (requirePassword && !form.password.trim()) {
      setError(copy.passwordRequired);
      return;
    }
    if (form.role === "member" && form.isVip && !form.vipExpiresAt) {
      setError(copy.vipExpiryRequired);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveFailed);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t.common.close}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90svh,100%)] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] bg-gray-90 sm:max-h-[min(90vh,100%)] sm:rounded-[24px]">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-80 px-5 py-4">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-gray-80 text-gray-20"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain p-5"
        >
          <input
            type="text"
            placeholder={copy.usernamePlaceholder}
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            required
            className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
          />

          <input
            type="password"
            placeholder={
              requirePassword
                ? copy.passwordPlaceholder
                : copy.newPasswordPlaceholder
            }
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required={requirePassword}
            className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
          />

          <div className="flex gap-2">
            {(["member", "admin"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    role,
                    isVip: role === "admin" ? false : prev.isVip,
                  }))
                }
                className={cn(
                  "flex-1 rounded-[14px] px-3 py-2 text-xs font-bold",
                  form.role === role
                    ? "bg-orange-50 text-white"
                    : "bg-gray-80 text-gray-40",
                )}
              >
                {t.common.roles[role]}
              </button>
            ))}
          </div>

          {form.role === "member" && (
            <div className="flex flex-col gap-3 rounded-[14px] bg-gray-80 p-4">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-white">
                  {copy.vipMember}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isVip}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      isVip: !prev.isVip,
                    }))
                  }
                  className={cn(
                    "relative h-7 w-12 rounded-full transition-colors",
                    form.isVip ? "bg-orange-50" : "bg-gray-70",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 size-6 rounded-full bg-white transition-transform",
                      form.isVip ? "left-[22px]" : "left-0.5",
                    )}
                  />
                </button>
              </label>

              {form.isVip && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-gray-30">
                    {copy.vipExpiry}
                  </span>
                  <input
                    type="date"
                    value={form.vipExpiresAt}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        vipExpiresAt: e.target.value,
                      }))
                    }
                    required={form.isVip}
                    className="rounded-[12px] bg-gray-90 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-orange-50/40"
                  />
                </label>
              )}
            </div>
          )}

          {error && <p className="text-xs text-orange-50">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-[19px] bg-white text-sm font-semibold text-gray-100 disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

export function UserManagement() {
  const { token, user: currentUser } = useAuth();
  const { locale, t } = useI18n();
  const copy = t.admin.users;
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (item) =>
        item.username.toLowerCase().includes(query) ||
        t.common.roles[item.role].toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query),
    );
  }, [users, search, t]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await fetchUsers(token);
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleDelete(id: string) {
    if (!token) return;
    const confirmed = window.confirm(copy.confirmDelete);
    if (!confirmed) return;
    await deleteUser(token, id);
    setUsers((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">{copy.title}</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-[14px] bg-orange-50 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          {copy.add}
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-40" />
        <input
          type="search"
          placeholder={copy.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[14px] bg-gray-90 py-2.5 pl-11 pr-4 text-base text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40 lg:text-sm"
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-[24px] bg-gray-90" />
      ) : users.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center text-sm text-gray-40">
          {copy.empty}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center text-sm text-gray-40">
          {copy.noMatch(search.trim())}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] bg-gray-90">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_auto] gap-4 border-b border-gray-80 px-5 py-3 text-xs font-bold tracking-wide text-gray-40 lg:grid">
            <span>{copy.columns.username}</span>
            <span>{copy.columns.role}</span>
            <span>{copy.columns.joined}</span>
            <span className="text-right">{copy.columns.actions}</span>
          </div>

          <div className="flex flex-col">
            {filteredUsers.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 border-b border-gray-80 px-3 py-2.5 last:border-b-0 sm:px-4 sm:py-3 lg:grid lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto] lg:items-center lg:gap-4 lg:px-5"
              >
                <div className="min-w-0 flex-1 lg:contents">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-white">
                        {item.username}
                      </p>
                      {isActiveVip(item.vipExpiresAt) && (
                        <span className="shrink-0 rounded-md bg-orange-50/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-50">
                          {copy.vip}
                        </span>
                      )}
                      {currentUser?.id === item.id && (
                        <span className="shrink-0 text-[10px] font-medium text-orange-50">
                          {copy.you}
                        </span>
                      )}
                    </div>
                    <div className="lg:hidden">
                      <UserRoleBadges user={item} />
                      <p className="mt-0.5 text-xs text-gray-40">
                        {copy.joinedOn(formatJoinDate(item.createdAt, locale))}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="text-sm text-gray-20">
                    {t.common.roles[item.role]}
                  </p>
                  {item.vipExpiresAt && (
                    <p className="mt-0.5 text-xs text-gray-40">
                      {isActiveVip(item.vipExpiresAt)
                        ? copy.vip
                        : copy.vipExpired}{" "}
                      ·{" "}
                      {copy.expiresOn(
                        formatVipExpiryDate(item.vipExpiresAt, locale),
                      )}
                    </p>
                  )}
                </div>
                <p className="hidden text-sm text-gray-40 lg:block">
                  {formatJoinDate(item.createdAt, locale)}
                </p>
                <div className="flex shrink-0 gap-1.5 lg:justify-end">
                  <button
                    type="button"
                    aria-label={copy.editUser(item.username)}
                    onClick={() => setEditingUser(item)}
                    className="flex size-8 items-center justify-center rounded-full bg-orange-50 text-white sm:size-9"
                  >
                    <Pencil className="size-3.5 sm:size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={copy.deleteUser(item.username)}
                    onClick={() => void handleDelete(item.id)}
                    disabled={currentUser?.id === item.id}
                    className="flex size-8 items-center justify-center rounded-full bg-orange-50 text-white disabled:opacity-40 sm:size-9"
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <UserFormModal
        open={createOpen}
        title={t.admin.form.createTitle}
        submitLabel={t.admin.form.createSubmit}
        initial={EMPTY_FORM}
        requirePassword
        onClose={() => setCreateOpen(false)}
        onSubmit={async (input) => {
          if (!token) return;
          const created = await createUser(token, {
            username: input.username.trim(),
            password: input.password.trim(),
            role: input.role,
            vipExpiresAt: buildVipPayload(input),
          });
          setUsers((prev) => [created, ...prev]);
        }}
      />

      <UserFormModal
        open={!!editingUser}
        title={t.admin.form.editTitle}
        submitLabel={t.common.saveChanges}
        initial={editingUser ? userToForm(editingUser) : EMPTY_FORM}
        requirePassword={false}
        onClose={() => setEditingUser(null)}
        onSubmit={async (input) => {
          if (!token || !editingUser) return;
          const payload: {
            username?: string;
            password?: string;
            role?: UserRole;
            vipExpiresAt?: string | null;
          } = {
            username: input.username.trim(),
            role: input.role,
            vipExpiresAt: buildVipPayload(input),
          };
          if (input.password.trim()) {
            payload.password = input.password.trim();
          }
          const updated = await updateUser(token, editingUser.id, payload);
          setUsers((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );
        }}
      />
    </section>
  );
}
