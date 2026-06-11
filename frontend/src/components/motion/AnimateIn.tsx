"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type AnimateVariant = "slide-left" | "slide-right" | "flip";

const VARIANT_CLASS: Record<AnimateVariant, string> = {
  "slide-left": "animate-slide-in-left",
  "slide-right": "animate-slide-in-right",
  flip: "animate-flip-in",
};

type AnimateInProps = {
  variant: AnimateVariant;
  delay?: number;
  className?: string;
  children: ReactNode;
  as?: ElementType;
};

export function AnimateIn({
  variant,
  delay = 0,
  className,
  children,
  as: Component = "div",
}: AnimateInProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true);
      return;
    }
    const frame = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const style: CSSProperties | undefined = active
    ? { animationDelay: `${delay}ms` }
    : undefined;

  return (
    <Component
      className={cn(active ? VARIANT_CLASS[variant] : "opacity-0", className)}
      style={style}
    >
      {children}
    </Component>
  );
}
