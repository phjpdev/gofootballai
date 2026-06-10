import type { Match } from "@/types";

export const MATCH_DATES = [
  { day: "Sat", date: 7, hasEvent: true },
  { day: "Sun", date: 8, hasEvent: true },
  { day: "Mon", date: 9, hasEvent: true },
  { day: "Tue", date: 10, hasEvent: true },
  { day: "Wed", date: 11, hasEvent: true },
  { day: "Thu", date: 12, hasEvent: true },
];

export const MATCHES: Match[] = [
  {
    id: "man-city-arsenal",
    title: "Man City vs Arsenal",
    tag: "EPL",
    progress: 75,
    movements: 4,
    completion: 87,
    imageSrc:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop",
    date: "2026-06-09",
    time: "15:00",
    venue: "Etihad Stadium",
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: "liverpool-chelsea",
    title: "Liverpool vs Chelsea",
    tag: "EPL",
    progress: 60,
    movements: 3,
    completion: 72,
    imageSrc:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200&h=200&fit=crop",
    date: "2026-06-09",
    time: "17:30",
    venue: "Anfield",
    homeScore: 1,
    awayScore: 1,
  },
  {
    id: "barcelona-real-madrid",
    title: "Barcelona vs Real Madrid",
    tag: "La Liga",
    progress: 90,
    movements: 5,
    completion: 95,
    imageSrc:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&h=200&fit=crop",
    date: "2026-06-10",
    time: "20:00",
    venue: "Camp Nou",
    homeScore: 3,
    awayScore: 2,
  },
  {
    id: "atletico-sevilla",
    title: "Atletico vs Sevilla",
    tag: "La Liga",
    progress: 45,
    movements: 2,
    completion: 55,
    imageSrc:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&h=200&fit=crop",
    date: "2026-06-10",
    time: "18:00",
    venue: "Metropolitano",
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
