import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { Match } from "@/types";

export const MATCH_DATES = [
  { day: "六", date: 7, hasEvent: true },
  { day: "日", date: 8, hasEvent: true },
  { day: "一", date: 9, hasEvent: true },
  { day: "二", date: 10, hasEvent: true },
  { day: "三", date: 11, hasEvent: true },
  { day: "四", date: 12, hasEvent: true },
];

export const MATCHES: Match[] = [
  {
    id: "mexico-south-africa",
    title: "墨西哥 對 南非",
    homeTeam: "墨西哥",
    awayTeam: "南非",
    homeTeamEn: "Mexico",
    awayTeamEn: "South Africa",
    tag: "2026 世界盃",
    progress: 75,
    movements: 4,
    completion: 87,
    imageSrc:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop",
    date: "2026-06-09",
    time: "03:00",
    venue: "阿茲特克球場",
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: "korea-denmark",
    title: "南韓 對 丹麥",
    homeTeam: "南韓",
    awayTeam: "丹麥",
    homeTeamEn: "South Korea",
    awayTeamEn: "Denmark",
    tag: "2026 世界盃",
    progress: 60,
    movements: 3,
    completion: 72,
    imageSrc:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200&h=200&fit=crop",
    date: "2026-06-09",
    time: "06:00",
    venue: "SoFi 球場",
    homeScore: 1,
    awayScore: 1,
  },
  {
    id: "canada-europe",
    title: "加拿大 對 歐洲附加賽勝者",
    homeTeam: "加拿大",
    awayTeam: "歐洲附加賽勝者",
    homeTeamEn: "Canada",
    awayTeamEn: "European play-off winner",
    tag: "2026 世界盃",
    progress: 90,
    movements: 5,
    completion: 95,
    imageSrc:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&h=200&fit=crop",
    date: "2026-06-10",
    time: "09:00",
    venue: "BMO 球場",
    homeScore: 3,
    awayScore: 2,
  },
  {
    id: "usa-paraguay",
    title: "美國 對 巴拉圭",
    homeTeam: "美國",
    awayTeam: "巴拉圭",
    homeTeamEn: "USA",
    awayTeamEn: "Paraguay",
    tag: "2026 世界盃",
    progress: 45,
    movements: 2,
    completion: 55,
    imageSrc:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&h=200&fit=crop",
    date: "2026-06-10",
    time: "12:00",
    venue: "SoFi 球場",
    homeScore: 0,
    awayScore: 0,
  },
];

/** English display text for the static fallback matches above. */
const MATCHES_EN: Record<string, Pick<Match, "title" | "tag" | "venue">> = {
  "mexico-south-africa": {
    title: "Mexico vs South Africa",
    tag: "2026 World Cup",
    venue: "Estadio Azteca",
  },
  "korea-denmark": {
    title: "South Korea vs Denmark",
    tag: "2026 World Cup",
    venue: "SoFi Stadium",
  },
  "canada-europe": {
    title: "Canada vs European play-off winner",
    tag: "2026 World Cup",
    venue: "BMO Field",
  },
  "usa-paraguay": {
    title: "USA vs Paraguay",
    tag: "2026 World Cup",
    venue: "SoFi Stadium",
  },
};

export function getMatchById(
  id: string,
  locale: Locale = DEFAULT_LOCALE,
): Match | undefined {
  const match = MATCHES.find((item) => item.id === id);
  if (!match || locale !== "en") return match;
  const english = MATCHES_EN[match.id];
  return english ? { ...match, ...english } : match;
}

export function getMatchesByDateIndex(dateIndex: number): Match[] {
  const dateMap: Record<number, string> = {
    0: "2026-06-07",
    1: "2026-06-08",
    2: "2026-06-09",
    3: "2026-06-10",
    4: "2026-06-11",
    5: "2026-06-12",
  };
  const date = dateMap[dateIndex];
  if (!date) return MATCHES;
  return MATCHES.filter((match) => match.date === date);
}
