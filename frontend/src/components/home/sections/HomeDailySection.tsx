"use client";

import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useHomeSection } from "@/context/HomeSectionsContext";
import { resolveHomeSectionImageUrl } from "@/lib/home-sections-api";

type HomeDailySectionProps = {
  reverse?: boolean;
};

export function HomeDailySection({ reverse }: HomeDailySectionProps) {
  const section = useHomeSection("daily");
  const imageUrl = resolveHomeSectionImageUrl(section.imageSrc);

  return (
    <HomeDesktopSectionShell index={1} reverse={reverse} sectionId="daily">
      <HomeSectionHeader
        title={section.title}
        description={section.description}
      />

      <div className="relative min-h-0 w-full flex-1 lg:h-[min(560px,65vh)] lg:flex-none">
        <Image
          src={imageUrl}
          alt="全球聯賽賽事列表預覽"
          fill
          unoptimized={imageUrl.includes("/uploads/")}
          className="object-contain object-center shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)] lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </HomeDesktopSectionShell>
  );
}
