"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** 0 = no parallax, 1 = moves at scroll speed. Typical 0.1-0.3. */
  strength?: number;
  className?: string;
}

/**
 * Wraps content and translates it vertically a fraction of the window scroll.
 * Uses rAF + transform (no layout) so it stays smooth at 60fps.
 */
export default function ParallaxImage({ children, strength = 0.18, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect reduced motion
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mql?.matches) return;

    let ticking = false;
    let raf = 0;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: -1 (above viewport) to +1 (below viewport); 0 at centered
      const center = rect.top + rect.height / 2;
      const progress = (center - vh / 2) / (vh / 2);
      // Translate opposite to progress to create depth effect
      const translate = -progress * strength * 60; // 60px max
      el.style.transform = `translate3d(0, ${translate.toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
