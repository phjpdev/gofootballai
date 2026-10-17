import { getTeamColor, getTeamInitials } from "@/lib/hkjc/team-badge";
import { cn } from "@/lib/utils";

type TeamInitialBadgeProps = {
  /** Source name; keeps the badge colour the same in every language. */
  name: string;
  /** Name in the reader's language, used for the initials (defaults to `name`). */
  label?: string;
  compact?: boolean;
};

export function TeamInitialBadge({
  name,
  label,
  compact = false,
}: TeamInitialBadgeProps) {
  const initials = getTeamInitials(label || name);
  const color = getTeamColor(name);

  return (
    <div className={cn("flex h-full w-full items-center justify-center", compact ? "p-0.5" : "p-1.5")}>
      <div
        className={cn(
          "flex size-full items-center justify-center rounded-lg font-bold tracking-tight text-white",
          compact ? "text-[8px] sm:text-[9px]" : "max-h-14 max-w-14 rounded-xl text-xs",
        )}
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {initials}
      </div>
    </div>
  );
}
