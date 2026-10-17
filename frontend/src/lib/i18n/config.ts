export const LOCALES = ["zh-HK", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-HK";

/** Same-site cookie so the server can render the chosen language on first paint. */
export const LOCALE_COOKIE = "gf-locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Tags handed to Intl for dates, weekdays and numbers. */
export const INTL_LOCALE: Record<Locale, string> = {
  "zh-HK": "zh-HK",
  en: "en-HK",
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Locale for code outside React (API helpers). Server side falls back to the default. */
export function getClientLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  return resolveLocale(match ? decodeURIComponent(match[1]) : undefined);
}
