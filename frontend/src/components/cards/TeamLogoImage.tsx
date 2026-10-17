"use client";

import { useEffect, useState } from "react";
import { TeamInitialBadge } from "@/components/cards/TeamInitialBadge";
import { resolveEnglishTeamName } from "@/lib/hkjc/team-names";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { localizedTeamName } from "@/lib/i18n/localized";
import { fetchTeamLogo } from "@/lib/team-logos/client-cache";

type TeamLogoImageProps = {
  src?: string;
  name: string;
  /** English team name used for external logo lookup when `src` is empty */
  lookupName?: string;
  fit?: "default" | "triangle";
};

function buildLookupCandidates(name: string, lookupName?: string): string[] {
  const english = lookupName?.trim() || resolveEnglishTeamName(name);
  const candidates = [english, lookupName?.trim(), name.trim()].filter(
    (value, index, arr): value is string =>
      Boolean(value) && arr.indexOf(value) === index,
  );
  return candidates;
}

export function TeamLogoImage({
  src,
  name,
  lookupName,
  fit = "default",
}: TeamLogoImageProps) {
  const { locale } = useI18n();
  const [logoUrl, setLogoUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const candidates = buildLookupCandidates(name, lookupName);
  const displayName = localizedTeamName(locale, name, lookupName);

  useEffect(() => {
    let cancelled = false;

    async function loadLogo() {
      setFailed(false);

      if (src) {
        setLogoUrl(src);
        return;
      }

      for (const candidate of candidates) {
        const url = await fetchTeamLogo(candidate);
        if (!cancelled && url) {
          setLogoUrl(url);
          return;
        }
      }
    }

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, [src, candidates.join("|")]);

  const handleError = () => {
    void (async () => {
      for (const candidate of candidates) {
        const url = await fetchTeamLogo(candidate);
        if (url) {
          setLogoUrl(url);
          setFailed(false);
          return;
        }
      }
      setFailed(true);
    })();
  };

  if (!logoUrl || failed) {
    return (
      <TeamInitialBadge
        name={name}
        label={displayName}
        compact={fit === "triangle"}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={displayName}
        className={
          fit === "triangle"
            ? "absolute inset-0 m-auto max-h-full max-w-full object-contain"
            : "absolute inset-0 m-auto max-h-[85%] max-w-[85%] object-contain"
        }
        onError={handleError}
      />
    </div>
  );
}
