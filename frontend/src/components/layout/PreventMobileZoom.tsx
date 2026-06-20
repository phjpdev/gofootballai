"use client";

import { useEffect } from "react";

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function PreventMobileZoom() {
  useEffect(() => {
    if (!isMobileViewport()) return;

    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });
    document.addEventListener("gestureend", preventGesture, { passive: false });
    document.addEventListener("touchmove", preventPinchZoom, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("touchmove", preventPinchZoom);
    };
  }, []);

  return null;
}
