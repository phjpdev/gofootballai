"use client";

import Image from "next/image";
import { HomeDesktopSectionShell } from "@/components/home/HomeDesktopSectionShell";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useLocalizedHomeSection } from "@/context/HomeSectionsContext";
import { resolveHomeSectionImageUrl } from "@/lib/home-sections-api";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type HomeCoachSectionProps = {
  reverse?: boolean;
};

export function HomeCoachSection({ reverse = true }: HomeCoachSectionProps) {
  const { t } = useI18n();
  const section = useLocalizedHomeSection("rating");
  const imageUrl = resolveHomeSectionImageUrl(section.imageSrc);

  return (
    <HomeDesktopSectionShell index={4} reverse={reverse} sectionId="rating">
      <div className="relative flex h-[min(36dvh,280px)] w-full shrink-0 items-center justify-center lg:h-[min(420px,55vh)] lg:flex-none">
        <div className="relative h-full w-full max-w-[320px] lg:max-w-none">
          <Image
            src={imageUrl}
            alt={t.home.imageAlt.rating}
            fill
            unoptimized={imageUrl.includes("/uploads/")}
            className="object-contain object-center lg:drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
            sizes="(max-width: 1024px) 80vw, 50vw"
          />
        </div>
      </div>

      <HomeSectionHeader
        title={section.title}
        description={section.description}
      />
    </HomeDesktopSectionShell>
  );
}
