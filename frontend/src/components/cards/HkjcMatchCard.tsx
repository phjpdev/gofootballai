import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { TeamLogoImage } from "@/components/cards/TeamLogoImage";
import type { HkjcMatch } from "@/types/hkjc";

function MatchLogoBox({
  homeLogo,
  homeTeam,
  awayLogo,
  awayTeam,
}: {
  homeLogo?: string;
  homeTeam: string;
  awayLogo?: string;
  awayTeam: string;
}) {
  return (
    <div className="relative size-20 shrink-0 overflow-hidden rounded-[21px] bg-white">
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      >
        <div className="flex h-full w-full items-center justify-center pb-3 pr-3">
          <TeamLogoImage src={homeLogo} name={homeTeam} />
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      >
        <div className="flex h-full w-full items-center justify-center pt-3 pl-3">
          <TeamLogoImage src={awayLogo} name={awayTeam} />
        </div>
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[142%] w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gray-90"
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
    <div className="w-full rounded-[32px] bg-gray-90 p-3 transition-colors hover:bg-gray-80">
      <div className="flex items-center gap-3">
        <MatchLogoBox
          homeLogo={match.homeLogo}
          homeTeam={match.homeTeam}
          awayLogo={match.awayLogo}
          awayTeam={match.awayTeam}
        />

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
