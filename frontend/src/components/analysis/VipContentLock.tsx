import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type VipLockSize = "compact" | "default" | "feature";

type VipContentLockProps = {
  locked: boolean;
  children?: React.ReactNode;
  className?: string;
  size?: VipLockSize;
};

const sizeClasses: Record<VipLockSize, string> = {
  compact: "h-[173px] gap-2.5 py-5",
  default: "min-h-[200px] gap-4 py-8",
  feature: "min-h-[168px] gap-4 py-8",
};

function VipLockPanel({
  size,
  className,
}: {
  size: VipLockSize;
  className?: string;
}) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[inherit] border border-orange-50/15 bg-gray-100 px-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        sizeClasses[size],
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,rgba(249,115,22,0.14),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px)",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl border border-orange-50/25 bg-gradient-to-b from-orange-50/20 to-orange-50/5 shadow-[0_0_28px_rgba(249,115,22,0.18)]",
          isCompact ? "size-11" : "size-14",
        )}
      >
        <Lock
          className={cn("text-orange-50", isCompact ? "size-5" : "size-6")}
          strokeWidth={2.25}
        />
      </div>

      <div
        className={cn(
          "relative flex flex-col items-center",
          isCompact ? "gap-1.5" : "gap-2",
        )}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-50/20 bg-orange-50/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-50">
          <Sparkles className="size-3" strokeWidth={2.25} />
          VIP 會員專屬
        </span>
        <p
          className={cn(
            "font-bold text-white",
            isCompact ? "text-sm leading-tight" : "text-base",
          )}
        >
          解鎖完整 AI 預測
        </p>
        <p
          className={cn(
            "max-w-[240px] leading-relaxed text-gray-40",
            isCompact ? "text-[11px]" : "text-xs",
          )}
        >
          請聯絡管理員升級 VIP，以查看完整 AI 預測及覆盤內容
        </p>
      </div>
    </div>
  );
}

export function VipContentLock({
  locked,
  children,
  className,
  size = "default",
}: VipContentLockProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <VipLockPanel size={size} />
    </div>
  );
}
