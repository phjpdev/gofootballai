import { getTeamColor, getTeamInitials } from "@/lib/hkjc/team-badge";

type TeamInitialBadgeProps = {
  name: string;
};

export function TeamInitialBadge({ name }: TeamInitialBadgeProps) {
  const initials = getTeamInitials(name);
  const color = getTeamColor(name);

  return (
    <div className="flex h-full w-full items-center justify-center p-1.5">
      <div
        className="flex size-full max-h-14 max-w-14 items-center justify-center rounded-xl text-xs font-bold tracking-tight text-white"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {initials}
      </div>
    </div>
  );
}
