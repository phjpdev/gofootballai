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
import { formatRole } from "@/lib/i18n/zh-hk";
import { cn } from "@/lib/utils";

type UserFormState = {
  username: string;
  password: string;
  role: UserRole;
};

const EMPTY_FORM: UserFormState = {
  username: "",
  password: "",
  role: "member",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
      setError("請輸入密碼");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存用戶失敗");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[24px] bg-gray-90 sm:rounded-[24px]">
        <div className="flex items-center justify-between border-b border-gray-80 px-5 py-4">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-gray-80 text-gray-20"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4 p-5">
          <input
            type="text"
            placeholder="帳戶名稱"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            required
            className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
          />

          <input
            type="password"
            placeholder={requirePassword ? "密碼" : "新密碼（選填）"}
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
                onClick={() => setForm((prev) => ({ ...prev, role }))}
                className={cn(
                  "flex-1 rounded-[14px] px-3 py-2 text-xs font-bold",
                  form.role === role
                    ? "bg-orange-50 text-white"
                    : "bg-gray-80 text-gray-40",
                )}
              >
                {formatRole(role)}
              </button>
            ))}
          </div>

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
        formatRole(item.role).includes(query) ||
        item.role.toLowerCase().includes(query),
    );
  }, [users, search]);

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
    const confirmed = window.confirm("確定刪除此用戶？此操作無法復原。");
    if (!confirmed) return;
    await deleteUser(token, id);
    setUsers((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">管理用戶</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-[14px] bg-orange-50 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          新增用戶
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-40" />
        <input
          type="search"
          placeholder="搜尋帳戶名稱或角色..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[14px] bg-gray-90 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-[24px] bg-gray-90" />
      ) : users.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center text-sm text-gray-40">
          暫無用戶。
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center text-sm text-gray-40">
          找不到符合「{search.trim()}」的用戶。
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] bg-gray-90">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_auto] gap-4 border-b border-gray-80 px-5 py-3 text-xs font-bold tracking-wide text-gray-40 lg:grid">
            <span>帳戶名稱</span>
            <span>角色</span>
            <span>加入日期</span>
            <span className="text-right">操作</span>
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
                      {currentUser?.id === item.id && (
                        <span className="shrink-0 text-[10px] font-medium text-orange-50">
                          你
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-40 lg:hidden">
                      {formatRole(item.role)} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="hidden text-sm text-gray-20 lg:block">
                  {formatRole(item.role)}
                </p>
                <p className="hidden text-sm text-gray-40 lg:block">
                  {formatDate(item.createdAt)}
                </p>
                <div className="flex shrink-0 gap-1.5 lg:justify-end">
                  <button
                    type="button"
                    aria-label={`編輯 ${item.username}`}
                    onClick={() => setEditingUser(item)}
                    className="flex size-8 items-center justify-center rounded-full bg-orange-50 text-white sm:size-9"
                  >
                    <Pencil className="size-3.5 sm:size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`刪除 ${item.username}`}
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
        title="新增用戶"
        submitLabel="建立用戶"
        initial={EMPTY_FORM}
        requirePassword
        onClose={() => setCreateOpen(false)}
        onSubmit={async (input) => {
          if (!token) return;
          const created = await createUser(token, input);
          setUsers((prev) => [created, ...prev]);
        }}
      />

      <UserFormModal
        open={!!editingUser}
        title="編輯用戶"
        submitLabel="儲存變更"
        initial={
          editingUser
            ? {
                username: editingUser.username,
                password: "",
                role: editingUser.role,
              }
            : EMPTY_FORM
        }
        requirePassword={false}
        onClose={() => setEditingUser(null)}
        onSubmit={async (input) => {
          if (!token || !editingUser) return;
          const payload: {
            username?: string;
            password?: string;
            role?: UserRole;
          } = {
            username: input.username.trim(),
            role: input.role,
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
