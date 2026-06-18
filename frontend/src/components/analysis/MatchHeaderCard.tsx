"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Trophy } from "lucide-react";
import { TeamLogoImage } from "@/components/cards/TeamLogoImage";
import type { Match } from "@/types";
import { cn } from "@/lib/utils";

type MatchHeaderCardProps = {
  match: Match;
};

function parseTeamsFromTitle(title: string): { home: string; away: string } {
  const parts = title.split(/\s*對\s*/);
  if (parts.length === 2) {
    return { home: parts[0].trim(), away: parts[1].trim() };
  }
  return { home: title, away: "" };
}

function formatMatchDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("zh-HK", {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Hong_Kong",
  });
}

function TeamColumn({
  name,
  nameEn,
  logo,
  side,
  active,
}: {
  name: string;
  nameEn?: string;
  logo?: string;
  side: "home" | "away";
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-2.5",
        side === "home" ? "match-header-home" : "match-header-away",
        active && (side === "home" ? "match-header-home--in" : "match-header-away--in"),
      )}
    >
      <div
        className={cn(
          "relative flex size-[72px] items-center justify-center rounded-[20px] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:size-20",
          side === "home"
            ? "ring-2 ring-blue-40/30"
            : "ring-2 ring-orange-50/30",
        )}
      >
        <TeamLogoImage
          src={logo}
          name={name}
          lookupName={nameEn}
          fit="default"
        />
      </div>
      <p className="max-w-[108px] truncate text-center text-sm font-bold tracking-[-0.04px] text-white sm:max-w-[120px] sm:text-base">
        {name}
      </p>
    </div>
  );
}

export function MatchHeaderCard({ match }: MatchHeaderCardProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true);
      return;
    }
    const frame = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const teams = useMemo(() => {
    if (match.homeTeam && match.awayTeam) {
      return {
        home: match.homeTeam,
        away: match.awayTeam,
        homeEn: match.homeTeamEn,
        awayEn: match.awayTeamEn,
      };
    }
    const parsed = parseTeamsFromTitle(match.title);
    return {
      home: parsed.home,
      away: parsed.away,
      homeEn: match.homeTeamEn,
      awayEn: match.awayTeamEn,
    };
  }, [match]);

  const hasScore =
    match.homeScore !== undefined && match.awayScore !== undefined;

  return (
    <div className="match-header-card relative overflow-hidden rounded-[24px] p-4 sm:p-5">
      <div className="match-header-card__glow pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-blue-40/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 size-36 rounded-full bg-orange-50/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-[1] flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <TeamColumn
            name={teams.home}
            nameEn={teams.homeEn}
            logo={match.homeLogo}
            side="home"
            active={active}
          />

          <div
            className={cn(
              "match-header-vs flex shrink-0 flex-col items-center gap-1.5 px-1",
              active && "match-header-vs--in",
            )}
          >
            {hasScore ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
                  {match.homeScore}
                </span>
                <span className="text-sm font-medium text-gray-40">-</span>
                <span className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
                  {match.awayScore}
                </span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src="/images/vs-badge.png?v=3"
                alt="VS"
                className="match-header-vs__badge size-11 object-contain sm:size-12"
              />
            )}
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-40">
              {hasScore ? "完場" : "對賽"}
            </span>
          </div>

          <TeamColumn
            name={teams.away}
            nameEn={teams.awayEn}
            logo={match.awayLogo}
            side="away"
            active={active}
          />
        </div>

        <div
          className={cn(
            "match-header-meta flex flex-wrap items-center justify-center gap-2 border-t border-white/8 pt-3.5",
            active && "match-header-meta--in",
          )}
        >
          <span className="match-header-chip inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-medium text-white">
            <Clock className="size-3.5 text-orange-50" strokeWidth={2.25} />
            {match.time}
          </span>
          <span className="match-header-chip inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-medium text-white">
            <Trophy className="size-3.5 text-blue-40" strokeWidth={2.25} />
            {match.venue}
          </span>
          {match.date && (
            <span className="match-header-chip inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-medium text-gray-30">
              <Calendar className="size-3.5 text-gray-40" strokeWidth={2.25} />
              {formatMatchDate(match.date)}
            </span>
          )}
          {match.tag && (
            <span className="inline-flex items-center rounded-full border border-orange-50/25 bg-orange-50/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-orange-50">
              {match.tag}
            </span>
          )}
          {match.frontEndId && (
            <span className="inline-flex items-center rounded-full bg-gray-80 px-2.5 py-1 text-[10px] font-semibold text-gray-30">
              {match.frontEndId}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
