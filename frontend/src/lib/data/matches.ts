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

export function getMatchById(id: string): Match | undefined {
  return MATCHES.find((match) => match.id === id);
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
