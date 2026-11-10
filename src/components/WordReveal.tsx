"use client";

import { useEffect, useRef } from "react";

interface Props {
  /** Text to split into words. Line breaks (\n) become <br/>. */
  text: string;
  /** Element to render as. */
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  /** ms delay per word (default 60). */
  stagger?: number;
  /** ms delay before the first word (default 0). */
  startDelay?: number;
}

/** Word-by-word blurred fade-up reveal driven by IntersectionObserver. */
export default function WordReveal({
  text,
  as: Tag = "span",
  className = "",
  stagger = 60,
  startDelay = 0,
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
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Split by lines first, then words. Preserve line breaks as <br/>.
  const lines = text.split("\n");
  let wordIndex = 0;
  const Component = Tag as unknown as React.ElementType;

  return (
    <Component
      ref={ref}
      className={`word-reveal ${className}`}
      style={{ "--word-stagger": `${stagger}ms` } as React.CSSProperties}
    >
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block" }}>
          {line.split(/(\s+)/).map((token, ti) => {
            if (/^\s+$/.test(token)) return <span key={`s-${li}-${ti}`} style={{ opacity: 1, transform: "none", filter: "none", transition: "none" }}>{" "}</span>;
            if (token === "") return null;
            const i = wordIndex++;
            const delay = startDelay + i * stagger;
            return (
              <span
                key={`w-${li}-${ti}`}
                style={{ "--i": i, transitionDelay: `${delay}ms` } as React.CSSProperties}
              >
                {token}
              </span>
            );
          })}
        </span>
      ))}
    </Component>
  );
}
