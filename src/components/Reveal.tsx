"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** "", "left", "right", "scale" */
  variant?: "" | "left" | "right" | "scale";
  /** delay en ms */
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  /** Si true, añade .reveal-stagger — hijos con .reveal-child se animan en serie con --i */
  stagger?: boolean;
  /** Umbral de visibilidad para disparar (0..1) */
  threshold?: number;
}

/**
 * Apple-style scroll reveal (fade + blur-to-focus). El primer scroll
 * hacia el elemento lo hace aparecer; luego permanece visible aunque
 * salga de la vista.
 */
export default function Reveal({
  children,
  className = "",
  variant = "",
  delay = 0,
  as: Tag = "div",
  stagger = false,
  threshold = 0.12,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const classes = [
    stagger ? "reveal-stagger" : "reveal",
    !stagger && variant === "left" && "reveal-left",
    !stagger && variant === "right" && "reveal-right",
    !stagger && variant === "scale" && "reveal-scale",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const style: React.CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};

  // Type-safe render via dynamic tag
  const Component = Tag as unknown as React.ElementType;
  return (
    <Component ref={ref} className={classes} style={style}>
      {children}
    </Component>
  );
}
