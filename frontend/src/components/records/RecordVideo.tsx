"use client";

import { useEffect, useRef } from "react";

type RecordVideoProps = {
  src: string;
  className?: string;
  mode?: "preview" | "player";
  onError?: () => void;
};

export function RecordVideo({
  src,
  className,
  mode = "player",
  onError,
}: RecordVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPreview = mode === "preview";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    function tryPlay() {
      void video?.play().catch(() => {
        // Autoplay may be blocked; controls remain available in player mode.
      });
    }

    if (video.readyState >= 2) {
      tryPlay();
      return;
    }

    video.addEventListener("loadeddata", tryPlay, { once: true });
    return () => video.removeEventListener("loadeddata", tryPlay);
  }, [src, mode]);

  return (
    <video
      ref={videoRef}
      key={src}
      src={src}
      autoPlay
      muted
      playsInline
      loop={isPreview}
      controls={!isPreview}
      preload="auto"
      onError={onError}
      className={className}
    />
  );
}
