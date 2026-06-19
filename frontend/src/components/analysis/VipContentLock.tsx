import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type VipContentLockProps = {
  locked: boolean;
  children: React.ReactNode;
  className?: string;
};

export function VipContentLock({
  locked,
  children,
  className,
}: VipContentLockProps) {
  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[3px] opacity-60"
      >
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-[inherit] bg-black/65 px-4 text-center">
        <Lock className="size-6 text-orange-50" strokeWidth={2.25} />
        <p className="text-sm font-bold text-white">VIP 會員專屬</p>
        <p className="max-w-[220px] text-xs leading-relaxed text-gray-30">
          請聯絡管理員升級 VIP，以查看完整 AI 預測及覆盤內容
        </p>
      </div>
    </div>
  );
}
