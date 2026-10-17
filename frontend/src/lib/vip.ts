import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";

export function isActiveVip(vipExpiresAt?: string | null): boolean {
  if (!vipExpiresAt) return false;
  return new Date(vipExpiresAt).getTime() > Date.now();
}

/** "2026年9月28日" / "28 Sept 2026", in HK time. */
export function formatVipExpiryDate(iso: string, locale: Locale): string {
  return formatDate(iso, locale, {
    year: "numeric",
    month: locale === "en" ? "short" : "long",
    day: "numeric",
  });
}

export function toVipDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}
