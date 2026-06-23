import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type VipContentLockProps = {
  locked: boolean;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function VipContentLock({
  locked,
  children,
  className,
  compact = false,
}: VipContentLockProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div aria-hidden className="invisible select-none">
        {children}
      </div>

      <div
        className={cn(
          "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[inherit] border border-orange-50/15 bg-gray-100 px-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
          compact ? "gap-2.5 py-5" : "gap-4 py-8",
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
            compact ? "size-11" : "size-14",
          )}
        >
          <Lock
            className={cn("text-orange-50", compact ? "size-5" : "size-6")}
            strokeWidth={2.25}
          />
        </div>

        <div className={cn("relative flex flex-col items-center", compact ? "gap-1.5" : "gap-2")}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-50/20 bg-orange-50/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-50">
            <Sparkles className="size-3" strokeWidth={2.25} />
            VIP 會員專屬
          </span>
          <p
            className={cn(
              "font-bold text-white",
              compact ? "text-sm leading-tight" : "text-base",
            )}
          >
            解鎖完整 AI 預測
          </p>
          <p
            className={cn(
              "max-w-[240px] leading-relaxed text-gray-40",
              compact ? "text-[11px]" : "text-xs",
            )}
          >
            請聯絡管理員升級 VIP，以查看完整 AI 預測及覆盤內容
          </p>
        </div>
      </div>
    </div>
  );
}
