import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MemberCardProps = {
  children: ReactNode;
  className?: string;
  active?: boolean;
};

export function MemberCard({
  children,
  className,
  active = false,
}: MemberCardProps) {
  return (
    <div
      className={cn(
        "member-card-shell",
        active && "member-card-shell-active",
      )}
    >
      <div className={cn("member-card-inner", className)}>{children}</div>
    </div>
  );
}
