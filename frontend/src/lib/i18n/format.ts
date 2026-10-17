import { INTL_LOCALE, type Locale } from "./config";

const HK_TZ = "Asia/Hong_Kong";

function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Short weekday for a HK calendar day key ("2026-10-17" → "週六" / "Sat"). */
export function formatWeekdayFromKey(dateKey: string, locale: Locale): string {
  const date = toDate(`${dateKey}T12:00:00+08:00`);
  if (!date) return dateKey;
  return date.toLocaleDateString(INTL_LOCALE[locale], {
    weekday: "short",
    timeZone: HK_TZ,
  });
}

/** 24-hour HK kick-off time, identical in both languages ("20:30"). */
export function formatKickOffTime(value: string, locale: Locale): string {
  const date = toDate(value);
  if (!date) return value;
  return date.toLocaleTimeString(INTL_LOCALE[locale], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: HK_TZ,
  });
}

/** Date in HK time; pass Intl options for the parts you need. */
export function formatDate(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
): string {
  const date = toDate(value);
  if (!date) return String(value);
  return date.toLocaleDateString(INTL_LOCALE[locale], {
    timeZone: HK_TZ,
    ...options,
  });
}

export function formatDateTime(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
): string {
  const date = toDate(value);
  if (!date) return String(value);
  return date.toLocaleString(INTL_LOCALE[locale], {
    timeZone: HK_TZ,
    ...options,
  });
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString(INTL_LOCALE[locale], options);
}
