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

    // Grid previews must stay silent: a dozen of them autoplay at once, and
    // browsers refuse unmuted autoplay anyway. The modal player is opened by a
    // click, so it has user activation and can start with sound.
    video.muted = isPreview;
    let decodeCheckTimer: number | undefined;

    function tryPlay() {
      void video?.play().catch(() => {
        // Unmuted playback can still be refused -- no prior interaction with
        // the page, or iOS's stricter policy. Retry muted so the video plays
        // instead of sitting frozen; the controls let the viewer unmute.
        if (video && !video.muted) {
          video.muted = true;
          void video.play().catch(() => {
            // Controls remain available in player mode.
          });
        }
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
  }, [src, isPreview, onDecodeIssue]);

  return (
    <video
      ref={videoRef}
      key={src}
      src={src}
      autoPlay
      muted={isPreview}
      playsInline
      loop={isPreview}
      controls={!isPreview}
      preload="auto"
      onError={onError}
      className={className}
    />
  );
}
