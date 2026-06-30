"use client";

import { useEffect, useRef } from "react";

type RecordVideoProps = {
  src: string;
  className?: string;
  mode?: "preview" | "player";
  onError?: () => void;
  onDecodeIssue?: () => void;
};

export function RecordVideo({
  src,
  className,
  mode = "player",
  onError,
  onDecodeIssue,
}: RecordVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPreview = mode === "preview";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    let decodeCheckTimer: number | undefined;

    function tryPlay() {
      void video?.play().catch(() => {
        // Autoplay may be blocked; controls remain available in player mode.
      });
    }

    function scheduleDecodeCheck() {
      window.clearTimeout(decodeCheckTimer);
      decodeCheckTimer = window.setTimeout(() => {
        if (!video) return;
        const isPlaying = !video.paused && !video.ended && video.currentTime > 0;
        if (isPlaying && video.videoWidth === 0) {
          onDecodeIssue?.();
        }
      }, 1200);
    }

    function handleLoadedData() {
      tryPlay();
      scheduleDecodeCheck();
    }

    function handlePlaying() {
      scheduleDecodeCheck();
    }

    if (video.readyState >= 2) {
      handleLoadedData();
    } else {
      video.addEventListener("loadeddata", handleLoadedData, { once: true });
    }

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", scheduleDecodeCheck);

    return () => {
      window.clearTimeout(decodeCheckTimer);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", scheduleDecodeCheck);
    };
  }, [src, mode, onDecodeIssue]);

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
