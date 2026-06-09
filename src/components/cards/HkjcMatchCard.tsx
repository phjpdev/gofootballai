import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { TeamLogoImage } from "@/components/cards/TeamLogoImage";
import { TournamentFlag } from "@/components/cards/TournamentFlag";
import type { HkjcMatch } from "@/types/hkjc";

type HkjcMatchCardProps = {
  match: HkjcMatch;
  href?: string;
};

export function HkjcMatchCard({ match, href }: HkjcMatchCardProps) {
  const homeOdds = match.hadOdds ? Number.parseFloat(match.hadOdds.home) : 2;
  const implied = Math.min(95, Math.round((1 / homeOdds) * 100));

  const content = (
    <div className="w-full rounded-[32px] bg-gray-90 p-3 transition-colors hover:bg-gray-80">
      <div className="flex items-center gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-[21px] bg-white">
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="relative h-full border-r border-gray-90">
              <TeamLogoImage src={match.homeLogo} name={match.homeTeam} />
            </div>
            <div className="relative h-full">
              <TeamLogoImage src={match.awayLogo} name={match.awayTeam} />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 size-5 overflow-hidden rounded-full border border-white bg-white">
            <TournamentFlag
              src={match.tournamentLogo}
              code={match.tournamentCode}
              name={match.tournamentName}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold tracking-[-0.072px] text-white">
              {match.homeTeam} vs {match.awayTeam}
            </h3>
            <span className="flex h-6 shrink-0 items-center justify-center rounded-lg bg-gray-80 px-2 py-1 text-xs font-semibold tracking-[-0.018px] text-white">
              {match.tournamentCode}
            </span>
          </div>

          <div className="relative h-2 w-full">
            <div className="absolute inset-0 rounded-[3px] bg-gray-80" />
            <div
              className="absolute inset-y-0 left-0 rounded-[3px] bg-white"
              style={{ width: `${match.inplay ? 100 : 65}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <FileText className="size-4 text-gray-40" strokeWidth={2} />
              <span className="text-sm font-medium tracking-[-0.028px] text-white">
                {match.frontEndId}
              </span>
            </div>
            <span className="size-1 rounded-full bg-gray-70" />
            <div className="flex items-center gap-1">
              <Clock className="size-4 text-gray-40" strokeWidth={2} />
              <span className="text-sm font-medium tracking-[-0.028px] text-white">
                {match.kickOffLabel}
              </span>
            </div>
            {match.hadOdds && (
              <>
                <span className="size-1 rounded-full bg-gray-70" />
                <span className="text-sm font-medium tracking-[-0.028px] text-white">
                  H {match.hadOdds.home}
                </span>
                <span className="text-sm font-medium tracking-[-0.028px] text-gray-40">
                  {implied}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
