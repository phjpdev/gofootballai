"use client";

import { useEffect } from "react";

const LOCKED_VIEWPORT =
  "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

function isMobileViewport(): boolean {
  return window.matchMedia("(max-width: 1023px)").matches;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, button, a, label, [role='button'], [contenteditable='true']",
    ),
  );
}

function lockViewportMeta(): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "viewport";
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", LOCKED_VIEWPORT);
  void document.documentElement.offsetHeight;
  meta.setAttribute("content", `${LOCKED_VIEWPORT}, maximum-scale=1.0`);
  meta.setAttribute("content", LOCKED_VIEWPORT);
}

function resetZoomIfNeeded(): void {
  const viewport = window.visualViewport;
  if (!viewport || viewport.scale <= 1.01) return;
  lockViewportMeta();
  window.scrollTo(0, window.scrollY);
}

export function PreventMobileZoom() {
  useEffect(() => {
    if (!isMobileViewport()) return;

    lockViewportMeta();

    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    const preventMultiTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventPinchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      if (isInteractiveTarget(event.target)) return;

      const now = Date.now();
      if (now - lastTouchEnd <= 320) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    const preventWheelZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const onViewportChange = () => {
      resetZoomIfNeeded();
    };

    const onOrientationChange = () => {
      lockViewportMeta();
      window.setTimeout(resetZoomIfNeeded, 100);
    };

    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("gesturechange", preventGesture, { passive: false });
    document.addEventListener("gestureend", preventGesture, { passive: false });
    document.addEventListener("touchstart", preventMultiTouchStart, { passive: false });
    document.addEventListener("touchmove", preventPinchMove, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });
    document.addEventListener("wheel", preventWheelZoom, { passive: false });
    window.addEventListener("orientationchange", onOrientationChange);
    window.visualViewport?.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("scroll", onViewportChange);

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      document.removeEventListener("touchstart", preventMultiTouchStart);
      document.removeEventListener("touchmove", preventPinchMove);
      document.removeEventListener("touchend", preventDoubleTapZoom);
      document.removeEventListener("wheel", preventWheelZoom);
      window.removeEventListener("orientationchange", onOrientationChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("scroll", onViewportChange);
    };
  }, []);

  return null;
}
