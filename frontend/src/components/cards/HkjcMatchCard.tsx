import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { TeamLogoImage } from "@/components/cards/TeamLogoImage";
import type { HkjcMatch } from "@/types/hkjc";

function MatchLogoBox({
  homeLogo,
  homeTeam,
  homeTeamEn,
  awayLogo,
  awayTeam,
  awayTeamEn,
}: {
  homeLogo?: string;
  homeTeam: string;
  homeTeamEn: string;
  awayLogo?: string;
  awayTeam: string;
  awayTeamEn: string;
}) {
  return (
    <div className="relative size-14 shrink-0 overflow-hidden rounded-[12px] bg-white sm:size-16 sm:rounded-[14px]">
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      >
        <div className="flex h-full w-full items-center justify-center pb-2 pr-2 sm:pb-2.5 sm:pr-2.5">
          <TeamLogoImage
            src={homeLogo}
            name={homeTeam}
            lookupName={homeTeamEn}
          />
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      >
        <div className="flex h-full w-full items-center justify-center pt-2 pl-2 sm:pt-2.5 sm:pl-2.5">
          <TeamLogoImage
            src={awayLogo}
            name={awayTeam}
            lookupName={awayTeamEn}
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[142%] w-1 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#7a3d85] sm:w-1.5"
        aria-hidden
      />
    </div>
  );
}

type HkjcMatchCardProps = {
  match: HkjcMatch;
  href?: string;
};

export function HkjcMatchCard({ match, href }: HkjcMatchCardProps) {
  const homeOdds = match.hadOdds ? Number.parseFloat(match.hadOdds.home) : 2;
  const implied = Math.min(95, Math.round((1 / homeOdds) * 100));

  const content = (
    <div className="hkjc-match-card-shell w-full">
      <div className="hkjc-match-card w-full">
        <div className="hkjc-match-card-inner p-2.5 sm:p-3">
          <div className="relative z-[1] flex items-center gap-2.5 sm:gap-3">
          <MatchLogoBox
            homeLogo={match.homeLogo}
            homeTeam={match.homeTeam}
            homeTeamEn={match.homeTeamEn}
            awayLogo={match.awayLogo}
            awayTeam={match.awayTeam}
            awayTeamEn={match.awayTeamEn}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-bold tracking-[-0.04px] text-white sm:text-base">
                {match.homeTeam} 對 {match.awayTeam}
              </h3>
              <span className="flex h-5 shrink-0 items-center justify-center rounded-md bg-white/15 px-1.5 text-[10px] font-semibold text-white sm:h-6 sm:rounded-lg sm:px-2 sm:text-xs">
                {match.tournamentCode}
              </span>
            </div>

            <div className="relative h-1.5 w-full sm:h-2">
              <div className="absolute inset-0 rounded-[2px] bg-white/20 sm:rounded-[3px]" />
              <div
                className="absolute inset-y-0 left-0 rounded-[2px] bg-white sm:rounded-[3px]"
                style={{ width: `${match.inplay ? 100 : 65}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1">
                <FileText className="size-3.5 text-gray-40 sm:size-4" strokeWidth={2} />
                <span className="text-xs font-medium text-white sm:text-sm">
                  {match.frontEndId}
                </span>
              </div>
              <span className="size-1 rounded-full bg-gray-70" />
              <div className="flex items-center gap-1">
                <Clock className="size-3.5 text-gray-40 sm:size-4" strokeWidth={2} />
                <span className="text-xs font-medium text-white sm:text-sm">
                  {match.kickOffLabel}
                </span>
              </div>
              {match.hadOdds && (
                <>
                  <span className="size-1 rounded-full bg-gray-70" />
                  <span className="text-xs font-medium text-white sm:text-sm">
                    主 {match.hadOdds.home}
                  </span>
                  <span className="text-xs font-medium text-gray-40 sm:text-sm">
                    {implied}%
                  </span>
                </>
              )}
            </div>
          </div>
          </div>
          <div className="hkjc-match-card-fade" aria-hidden />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
