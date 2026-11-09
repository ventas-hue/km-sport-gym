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
}

/**
 * Apple-style scroll reveal. El primer scroll hacia el elemento lo hace
 * aparecer con fade+slide; luego permanece visible aunque salga de la vista.
 */
export default function Reveal({
  children,
  className = "",
  variant = "",
  delay = 0,
  as: Tag = "div",
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const classes = [
    "reveal",
    variant === "left" && "reveal-left",
    variant === "right" && "reveal-right",
    variant === "scale" && "reveal-scale",
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
