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
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
      setError("Password is required");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close modal"
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
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            required
            className="rounded-[14px] bg-gray-80 px-4 py-3 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
          />

          <input
            type="password"
            placeholder={requirePassword ? "Password" : "New password (optional)"}
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
                  "flex-1 rounded-[14px] px-3 py-2 text-xs font-bold capitalize",
                  form.role === role
                    ? "bg-orange-50 text-white"
                    : "bg-gray-80 text-gray-40",
                )}
              >
                {role}
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
    const confirmed = window.confirm("Delete this user? This cannot be undone.");
    if (!confirmed) return;
    await deleteUser(token, id);
    setUsers((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">Manage users</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-[14px] bg-orange-50 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="size-4" />
          Add user
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-40" />
        <input
          type="search"
          placeholder="Search by username or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[14px] bg-gray-90 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-40 outline-none focus:ring-2 focus:ring-orange-50/40"
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-[24px] bg-gray-90" />
      ) : users.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center text-sm text-gray-40">
          No users yet.
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-[24px] bg-gray-90 p-6 text-center text-sm text-gray-40">
          No users match &ldquo;{search.trim()}&rdquo;.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] bg-gray-90">
          <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_auto] gap-4 border-b border-gray-80 px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-40 lg:grid">
            <span>Username</span>
            <span>Role</span>
            <span>Joined</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="flex flex-col">
            {filteredUsers.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 border-b border-gray-80 px-5 py-4 last:border-b-0 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto] lg:items-center lg:gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-white">{item.username}</p>
                  {currentUser?.id === item.id && (
                    <p className="text-xs text-orange-50">You</p>
                  )}
                </div>
                <p className="text-sm capitalize text-gray-20 lg:capitalize">
                  {item.role}
                </p>
                <p className="text-sm text-gray-40">{formatDate(item.createdAt)}</p>
                <div className="flex gap-2 lg:justify-end">
                  <button
                    type="button"
                    aria-label={`Edit ${item.username}`}
                    onClick={() => setEditingUser(item)}
                    className="flex size-9 items-center justify-center rounded-full bg-orange-50 text-white"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.username}`}
                    onClick={() => void handleDelete(item.id)}
                    disabled={currentUser?.id === item.id}
                    className="flex size-9 items-center justify-center rounded-full bg-orange-50 text-white disabled:opacity-40"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <UserFormModal
        open={createOpen}
        title="Add user"
        submitLabel="Create user"
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
        title="Edit user"
        submitLabel="Save changes"
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
