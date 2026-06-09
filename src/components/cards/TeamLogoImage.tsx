"use client";

import { useEffect, useState } from "react";
import { TeamInitialBadge } from "@/components/cards/TeamInitialBadge";
import { fetchTeamLogo } from "@/lib/team-logos/client-cache";

type TeamLogoImageProps = {
  src?: string;
  name: string;
};

export function TeamLogoImage({ src, name }: TeamLogoImageProps) {
  const [logoUrl, setLogoUrl] = useState(src ?? "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (src) {
      setLogoUrl(src);
      setFailed(false);
      return;
    }

    let cancelled = false;

    async function loadLogo() {
      const url = await fetchTeamLogo(name);
      if (!cancelled && url) {
        setLogoUrl(url);
        setFailed(false);
      }
    }

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, [src, name]);

  if (!logoUrl || failed) {
    return <TeamInitialBadge name={name} />;
  }

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={name}
        className="absolute inset-0 m-auto max-h-[85%] max-w-[85%] object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
