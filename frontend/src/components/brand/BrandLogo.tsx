import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showTitle?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { mark: 32, title: "text-sm" },
  md: { mark: 40, title: "text-base" },
  lg: { mark: 56, title: "text-xl" },
};

export function BrandLogo({
  className,
  showTitle = true,
  size = "md",
}: BrandLogoProps) {
  const config = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/images/go-football-logo.png"
        alt="GO Football"
        width={config.mark}
        height={config.mark}
        className="h-auto w-auto shrink-0"
        priority
      />
      {showTitle && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-bold tracking-[-0.04em] text-white",
              config.title,
            )}
          >
            GO Football
          </span>
          <span className="rounded-full bg-gradient-to-r from-[#2F80FF] to-[#A855F7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
