import type { HkjcDateItem } from "@/types/hkjc";
import type { HkjcMatch } from "@/types/hkjc";

export const ADMIN_PAST_TAB_COUNT = 2;

export function getTodayDateKeyHk(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(new Date());
}

function addDaysToDateKey(dateKey: string, delta: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta));
  return date.toISOString().slice(0, 10);
}

export function getPreviousHKDateKeys(count: number): string[] {
  const today = getTodayDateKeyHk();
  const keys: string[] = [];
  for (let offset = count; offset >= 1; offset -= 1) {
    keys.push(addDaysToDateKey(today, -offset));
  }
  return keys;
}

function formatDay(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  return date.toLocaleDateString("zh-HK", {
    weekday: "short",
    timeZone: "Asia/Hong_Kong",
  });
}

export function buildDateItem(
  dateKey: string,
  hasEvent = false,
): HkjcDateItem {
  const [, , day] = dateKey.split("-").map(Number);
  return {
    key: dateKey,
    day: formatDay(dateKey),
    date: day,
    hasEvent,
  };
}

export function ensureTodayInLiveDates(
  liveDates: HkjcDateItem[],
  archivedDateKeys: string[],
  todayHasMatches = false,
): HkjcDateItem[] {
  const todayKey = getTodayDateKeyHk();
  if (archivedDateKeys.includes(todayKey)) {
    return liveDates;
  }
  if (liveDates.some((date) => date.key === todayKey)) {
    return liveDates;
  }

  const firstLiveKey = liveDates[0]?.key;
  const shouldInject =
    todayHasMatches || (firstLiveKey ? todayKey < firstLiveKey : true);

  if (!shouldInject) {
    return liveDates;
  }

  const todayItem = buildDateItem(todayKey, todayHasMatches);
  return [...liveDates, todayItem].sort((a, b) => a.key.localeCompare(b.key));
}

export function buildAdminPastDateItems(
  count = ADMIN_PAST_TAB_COUNT,
): HkjcDateItem[] {
  return getPreviousHKDateKeys(count).map((key) => {
    const [, , day] = key.split("-").map(Number);
    return {
      key,
      day: formatDay(key),
      date: day,
      hasEvent: false,
    };
  });
}

export function mergeAdminTodayPassedMatches(
  live: HkjcMatch[],
  passed: HkjcMatch[],
): HkjcMatch[] {
  const liveIds = new Set(live.map((match) => match.id));
  const extra = passed.filter((match) => !liveIds.has(match.id));
  if (extra.length === 0) return live;

  return [...extra, ...live].sort(
    (a, b) =>
      new Date(a.kickOffTime).getTime() - new Date(b.kickOffTime).getTime(),
  );
}

export function shouldMergeTodayPassedMatches(
  selectedIndex: number,
  adminPastTabCount: number,
  selectedDateKey: string | undefined,
): boolean {
  if (selectedIndex === 0) return true;
  if (!selectedDateKey) return false;
  if (adminPastTabCount > 0 && selectedIndex <= adminPastTabCount) return false;
  return selectedDateKey === getTodayDateKeyHk();
}

export function resolveSelectedDateKey(options: {
  selectedIndex: number;
  adminPastTabCount: number;
  archivedDates: HkjcDateItem[];
  liveDates: HkjcDateItem[];
}): string {
  const { selectedIndex, adminPastTabCount, archivedDates, liveDates } =
    options;

  if (selectedIndex === 0) {
    return getTodayDateKeyHk();
  }

  if (adminPastTabCount > 0 && selectedIndex <= adminPastTabCount) {
    return archivedDates[selectedIndex - 1]?.key ?? getTodayDateKeyHk();
  }

  const liveIndex = selectedIndex - 1 - adminPastTabCount;
  return liveDates[liveIndex]?.key ?? getTodayDateKeyHk();
}
