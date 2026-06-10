import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg" | "header";
};

const sizes = {
  sm: { mark: 32, title: "text-sm", badge: "text-[10px] px-2" },
  md: { mark: 40, title: "text-base", badge: "text-[10px] px-2" },
  lg: { mark: 56, title: "text-xl", badge: "text-xs px-2" },
  header: { mark: 48, title: "text-lg", badge: "text-[11px] px-2 lg:text-sm lg:px-2.5" },
};

export function BrandLogo({
  className,
  showTitle = true,
  size = "md",
}: BrandLogoProps) {
  const config = sizes[size];
  const isHeader = size === "header";

  return (
    <div className={cn("flex items-center gap-2 lg:gap-3", className)}>
      <Image
        src="/images/go-football-logo.png"
        alt="GO Football AI"
        width={isHeader ? 64 : config.mark}
        height={isHeader ? 64 : config.mark}
        className={cn(
          "h-auto w-auto shrink-0",
          isHeader && "size-11 lg:size-16",
        )}
        priority={isHeader}
      />
      {showTitle && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-bold tracking-[-0.04em] text-white",
              config.title,
              isHeader && "lg:text-2xl",
            )}
          >
            GO Football
          </span>
          <span
            className={cn(
              "rounded-full bg-gradient-to-r from-[#2F80FF] to-[#A855F7] py-0.5 font-bold uppercase tracking-wide text-white",
              config.badge,
            )}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
}
