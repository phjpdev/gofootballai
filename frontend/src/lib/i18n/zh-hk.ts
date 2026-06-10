import type { UserRole } from "@/lib/auth-api";

export const NAV = {
  home: "首頁",
  analysis: "賽事分析",
  records: "紀錄",
  member: "會員",
  manage: "管理",
} as const;

export const ROLE_LABEL: Record<UserRole, string> = {
  member: "會員",
  admin: "管理員",
};

export function formatRole(role: UserRole): string {
  return ROLE_LABEL[role];
}

export const COMMON = {
  seeAll: "查看全部",
  retry: "重試",
  close: "關閉",
  requestFailed: "請求失敗，請稍後再試",
  sessionExpired: "登入已過期，請重新登入",
  notAuthenticated: "請先登入",
} as const;
