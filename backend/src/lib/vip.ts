export function isActiveVip(vipExpiresAt?: string | Date | null): boolean {
  if (!vipExpiresAt) return false;
  return new Date(vipExpiresAt).getTime() > Date.now();
}

export function canViewVipAnalysis(input: {
  role: string;
  vipExpiresAt?: string | Date | null;
}): boolean {
  if (input.role === "admin") return true;
  return isActiveVip(input.vipExpiresAt);
}

export function parseVipExpiryDate(dateStr: string): string {
  return new Date(`${dateStr}T23:59:59+08:00`).toISOString();
}
