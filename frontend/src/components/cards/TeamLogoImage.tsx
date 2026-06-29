"use client";

import { useEffect, useState } from "react";
import { TeamInitialBadge } from "@/components/cards/TeamInitialBadge";
import { fetchTeamLogo } from "@/lib/team-logos/client-cache";

type TeamLogoImageProps = {
  src?: string;
  name: string;
  /** English team name used for external logo lookup when `src` is empty */
  lookupName?: string;
  fit?: "default" | "triangle";
};

export function TeamLogoImage({
  src,
  name,
  lookupName,
  fit = "default",
}: TeamLogoImageProps) {
  const [logoUrl, setLogoUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [usedLookupFallback, setUsedLookupFallback] = useState(false);
  const queryName = lookupName?.trim() || name;

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setUsedLookupFallback(false);

    async function loadLogo() {
      if (src) {
        setLogoUrl(src);
        return;
      }

      const url = await fetchTeamLogo(queryName);
      if (!cancelled && url) {
        setLogoUrl(url);
      }
    }

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, [src, queryName]);

  const handleError = () => {
    if (!usedLookupFallback && lookupName?.trim() && lookupName !== name) {
      setUsedLookupFallback(true);
      void fetchTeamLogo(name).then((url) => {
        if (url) {
          setLogoUrl(url);
          setFailed(false);
        } else {
          setFailed(true);
        }
      });
      return;
    }

    if (!usedLookupFallback && queryName) {
      setUsedLookupFallback(true);
      void fetchTeamLogo(queryName).then((url) => {
        if (url) {
          setLogoUrl(url);
          setFailed(false);
        } else {
          setFailed(true);
        }
      });
      return;
    }

    setFailed(true);
  };

  if (!logoUrl || failed) {
    return <TeamInitialBadge name={name} compact={fit === "triangle"} />;
  }

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={name}
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
