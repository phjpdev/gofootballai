"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Trophy } from "lucide-react";
import { TeamLogoImage } from "@/components/cards/TeamLogoImage";
import type { Match } from "@/types";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  localizedTeamName,
  localizedTournamentName,
} from "@/lib/i18n/localized";
import { cn } from "@/lib/utils";

/** `venue` holds the Chinese tournament name; HKJC matches also carry its English name. */
export type MatchHeaderMatch = Match;

type MatchHeaderCardProps = {
  match: MatchHeaderMatch;
  showMeta?: boolean;
  onVsClick?: () => void;
};

export type MatchTeams = {
  homeTeam: string;
  awayTeam: string;
  homeTeamEn?: string;
  awayTeamEn?: string;
};

/**
 * Chinese team names (the source of truth for picks), plus HKJC English names.
 * Static fallback matches only have a Chinese "A 對 B" title, so split it.
 */
export function getMatchTeams(match: Match): MatchTeams {
  if (match.homeTeam && match.awayTeam) {
    return {
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeTeamEn: match.homeTeamEn,
      awayTeamEn: match.awayTeamEn,
    };
  }
  const parts = match.title.split(/\s*對\s*/);
  return {
    homeTeam: parts.length === 2 ? parts[0].trim() : match.title,
    awayTeam: parts.length === 2 ? parts[1].trim() : "",
    homeTeamEn: match.homeTeamEn,
    awayTeamEn: match.awayTeamEn,
  };
}

function formatMatchDate(dateKey: string, locale: Locale): string {
  const date = new Date(`${dateKey}T12:00:00+08:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return formatDate(date, locale, {
    month: "short",
    day: "numeric",
    weekday: "short",
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
  const { t } = useI18n();
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
          "relative flex size-[72px] items-center justify-center rounded-[20px] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:size-20 lg:size-24 lg:rounded-[24px]",
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
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
          side === "home"
            ? "bg-blue-40/15 text-blue-40"
            : "bg-orange-50/15 text-orange-50",
        )}
      >
        {side === "home" ? t.matchDetail.header.home : t.matchDetail.header.away}
      </span>
      <p className="max-w-[108px] truncate text-center text-sm font-bold tracking-[-0.04px] text-white sm:max-w-[120px] sm:text-base">
        {name}
      </p>
    </div>
  );
}

export function MatchHeaderCard({
  match,
  showMeta = true,
  onVsClick,
}: MatchHeaderCardProps) {
  const { locale, t } = useI18n();
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
    const { homeTeam, awayTeam, homeTeamEn, awayTeamEn } = getMatchTeams(match);
    return {
      home: localizedTeamName(locale, homeTeam, homeTeamEn),
      away: localizedTeamName(locale, awayTeam, awayTeamEn),
      homeEn: homeTeamEn,
      awayEn: awayTeamEn,
    };
  }, [match, locale]);

  const hasScore =
    match.homeScore !== undefined && match.awayScore !== undefined;

  return (
    <div className="match-header-card relative overflow-hidden rounded-[24px] p-4 sm:p-5 lg:rounded-[32px] lg:p-8">
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

          {onVsClick ? (
            <button
              type="button"
              onClick={onVsClick}
              aria-label={t.matchDetail.header.editPick}
              className={cn(
                "match-header-vs flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 transition-colors hover:bg-white/8",
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
                {hasScore ? t.matchDetail.header.fullTime : t.matchDetail.header.matchup}
              </span>
            </button>
          ) : (
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
                {hasScore ? t.matchDetail.header.fullTime : t.matchDetail.header.matchup}
              </span>
            </div>
          )}

          <TeamColumn
            name={teams.away}
            nameEn={teams.awayEn}
            logo={match.awayLogo}
            side="away"
            active={active}
          />
        </div>

        {showMeta && (
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
              {localizedTournamentName(locale, {
                tournamentName: match.venue,
                tournamentNameEn: match.tournamentNameEn,
              })}
            </span>
            {match.date && (
              <span className="match-header-chip inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-medium text-gray-30">
                <Calendar className="size-3.5 text-gray-40" strokeWidth={2.25} />
                {formatMatchDate(match.date, locale)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
