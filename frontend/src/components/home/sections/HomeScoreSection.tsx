"use client";

import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useHomeSection } from "@/context/HomeSectionsContext";
import { resolveHomeSectionImageUrl } from "@/lib/home-sections-api";

type HomeScoreSectionProps = {
  reverse?: boolean;
};

export function HomeScoreSection({ reverse }: HomeScoreSectionProps) {
  const section = useHomeSection("score");
  const imageUrl = resolveHomeSectionImageUrl(section.imageSrc);

  return (
    <HomeDesktopSectionShell index={0} reverse={reverse} sectionId="score">
      <HomeSectionHeader
        title={section.title}
        description={section.description}
      />

      <div className="relative min-h-0 w-full flex-1 lg:h-[min(560px,65vh)] lg:flex-none">
        <Image
          src={imageUrl}
          alt="AI 賽事分析預覽"
          fill
          unoptimized={imageUrl.includes("/uploads/")}
          className="object-contain object-center drop-shadow-[0px_9.637px_10.708px_rgba(31,41,55,0.05)] lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </HomeDesktopSectionShell>
  );
}
