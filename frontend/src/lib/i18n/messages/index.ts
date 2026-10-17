import type { Locale } from "../config";
import { admin } from "./admin";
import { analysis } from "./analysis";
import { common } from "./common";
import { home } from "./home";
import { layout } from "./layout";
import { matchDetail } from "./matchDetail";
import { member } from "./member";
import { records } from "./records";

const NAMESPACES = {
  common,
  layout,
  home,
  analysis,
  matchDetail,
  records,
  member,
  admin,
};

type Namespaces = typeof NAMESPACES;

export type Messages = {
  [K in keyof Namespaces]: Namespaces[K]["zh-HK"];
};

const cache = new Map<Locale, Messages>();

export function getMessages(locale: Locale): Messages {
  const hit = cache.get(locale);
  if (hit) return hit;
  const built = Object.fromEntries(
    Object.entries(NAMESPACES).map(([name, ns]) => [name, ns[locale]]),
  ) as Messages;
  cache.set(locale, built);
  return built;
}
