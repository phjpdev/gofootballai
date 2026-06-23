import { HomeSectionEditButton } from "@/components/home/HomeSectionEditButton";
import type { HomeSectionId } from "@/lib/data/home-sections";
import { cn } from "@/lib/utils";

type HomeDesktopSectionShellProps = {
  index: number;
  reverse?: boolean;
  sectionId?: HomeSectionId;
  children: React.ReactNode;
};

export function HomeDesktopSectionShell({
  index,
  reverse = false,
  sectionId,
  children,
}: HomeDesktopSectionShellProps) {
  const isAlt = index % 2 === 1;

  return (
    <section
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-black lg:h-auto lg:py-24 xl:py-32",
        isAlt && "lg:bg-gray-100",
      )}
    >
      {sectionId && (
        <div className="absolute right-2 top-2 z-20 lg:right-10 lg:top-8">
          <HomeSectionEditButton sectionId={sectionId} />
        </div>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 hidden opacity-60 lg:block",
          isAlt
            ? "bg-[radial-gradient(ellipse_70%_50%_at_0%_50%,rgba(59,130,246,0.08),transparent)]"
            : "bg-[radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(249,115,22,0.08),transparent)]",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "relative flex h-full w-full flex-col items-center gap-4 px-2 lg:mx-auto lg:grid lg:min-h-[min(640px,75vh)] lg:max-w-7xl lg:flex-none lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-0 xl:gap-24",
          reverse && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
        )}
      >
        {children}
      </div>
    </section>
  );
}
