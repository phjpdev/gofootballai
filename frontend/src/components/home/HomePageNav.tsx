import { homeAsset } from "@/lib/home-assets";
import { cn } from "@/lib/utils";

const NAV_PREV_ICON = "84705c4e678e62dc757dbd1e3c0898689a6afb10.svg";
const NAV_NEXT_ICON = "8226b9d750727d664774eeefcf0399f01e453b94.svg";

type HomePageNavProps = {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
};

function NavIconButton({
  label,
  iconSrc,
  iconInset,
  onClick,
}: {
  label: string;
  iconSrc: string;
  iconInset: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#431407] p-4 transition-opacity hover:opacity-90"
    >
      <span className="relative size-8 shrink-0">
        <span className={cn("absolute", iconInset)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={homeAsset(iconSrc)}
            className="absolute inset-0 size-full max-w-none"
          />
        </span>
      </span>
    </button>
  );
}

function PaginationDot({ active }: { active: boolean }) {
  return (
    <span className="relative size-2 shrink-0">
      <span
        className={cn(
          "absolute inset-[12.5%] rounded-full",
          active ? "bg-white" : "bg-[#3f3f46]",
        )}
      />
    </span>
  );
}

export function HomePageNav({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
}: HomePageNavProps) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-6 px-4 pb-6">
      <NavIconButton
        label="上一頁"
        iconSrc={NAV_PREV_ICON}
        iconInset="inset-[12.84%_31.69%_12.84%_28.43%]"
        onClick={onPrev}
      />

      <div className="flex items-center gap-1" aria-label="頁面進度">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <PaginationDot key={index} active={index === currentStep} />
        ))}
      </div>

      <NavIconButton
        label="下一頁"
        iconSrc={NAV_NEXT_ICON}
        iconInset="inset-[12.84%_28.44%_12.84%_31.69%]"
        onClick={onNext}
      />
    </div>
  );
}
