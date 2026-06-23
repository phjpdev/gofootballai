"use client";

import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useHomeSection } from "@/context/HomeSectionsContext";
import { resolveHomeSectionImageUrl } from "@/lib/home-sections-api";

type HomeMetricsSectionProps = {
  reverse?: boolean;
};

export function HomeMetricsSection({ reverse }: HomeMetricsSectionProps) {
  const section = useHomeSection("metrics");
  const imageUrl = resolveHomeSectionImageUrl(section.imageSrc);

  return (
    <HomeDesktopSectionShell index={2} reverse={reverse} sectionId="metrics">
      <HomeSectionHeader
        title={section.title}
        description={section.description}
      />

      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center lg:h-[min(560px,65vh)] lg:flex-none">
        <div className="relative h-full w-full max-w-[343px] lg:max-w-none">
          <Image
            src={imageUrl}
            alt="賽事數據分析預覽"
            fill
            unoptimized={imageUrl.includes("/uploads/")}
            className="object-contain object-center lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </HomeDesktopSectionShell>
  );
}
