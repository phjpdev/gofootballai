import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { getMessages, type Messages } from "./messages";

/** For Server Components, route handlers and metadata. */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getServerI18n(): Promise<{ locale: Locale; t: Messages }> {
  const locale = await getServerLocale();
  return { locale, t: getMessages(locale) };
}
