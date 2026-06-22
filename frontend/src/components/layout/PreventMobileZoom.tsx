"use client";

import { useEffect } from "react";

const LOCKED_VIEWPORT =
  "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 1023px)").matches;
}

function lockViewportMeta(): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", LOCKED_VIEWPORT);
}

export function PreventMobileZoom() {
  useEffect(() => {
    if (!isMobileViewport()) return;

    lockViewportMeta();

    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    const preventPinchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventWheelZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const onOrientationChange = () => {
      lockViewportMeta();
    };

    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });
    document.addEventListener("gestureend", preventGesture, { passive: false });
    document.addEventListener("touchmove", preventPinchMove, { passive: false });
    document.addEventListener("wheel", preventWheelZoom, { passive: false });
    window.addEventListener("orientationchange", onOrientationChange);

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("touchmove", preventPinchMove);
      document.removeEventListener("wheel", preventWheelZoom);
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, []);

  return null;
}
