"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dumbbell, TrendingUp, Apple as AppleIcon, LucideIcon } from "lucide-react";

interface Scene {
  eyebrow: string;
  title: string;
  desc: string;
  image: string;
  icon: LucideIcon;
  accent: string;
}

const SCENES: Scene[] = [
  {
    eyebrow: "Entrena",
    title: "Rutinas pensadas para ti.",
    desc: "Cada ejercicio con video. Series, repeticiones y descansos ajustados a tu nivel por Karla.",
    image: "/karla-competition-stage.jpg",
    icon: Dumbbell,
    accent: "from-orange-500/40 to-transparent",
  },
  {
    eyebrow: "Mide",
    title: "Tu progreso, en vivo.",
    desc: "Peso, medidas, grasa y fotos antes/después. Gráficas que confirman que vas por buen camino.",
    image: "/karla-competition-front.jpg",
    icon: TrendingUp,
    accent: "from-amber-400/40 to-transparent",
  },
  {
    eyebrow: "Transforma",
    title: "Nutrición que funciona.",
    desc: "Plan de alimentación mexicano, realista y ajustado a tus metas. Chat directo con tu coach.",
    image: "/karla-competition-back.jpg",
    icon: AppleIcon,
    accent: "from-rose-500/40 to-transparent",
  },
];

export default function StickyShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const reduced = !!mql?.matches;

    let ticking = false;
    let raf = 0;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = scrolled / total;
      setProgress(p);
      const idx = Math.min(SCENES.length - 1, Math.floor(p * SCENES.length * 0.999));
      setActive(idx);
    };

    if (reduced) {
      setActive(0);
      setProgress(0);
      return;
    }

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
  }, []);

  // Progress dentro de la escena actual (0..1)
  const localProgress = (progress * SCENES.length) - active;
  const clampedLocal = Math.min(1, Math.max(0, localProgress));

  return (
    <section
      ref={containerRef}
      aria-label="Experiencia LM Sport Gym"
      className="relative"
      style={{ height: `${SCENES.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* Capa de imágenes apiladas con crossfade */}
        <div className="absolute inset-0">
          {SCENES.map((s, i) => {
            const diff = i - active;
            const isActive = i === active;
            const opacity = isActive ? 1 : 0;
            // Zoom suave y ligero desplazamiento
            const scale = isActive ? 1 + clampedLocal * 0.04 : 1.02;
            const translateY = isActive ? -clampedLocal * 24 : diff > 0 ? 48 : -48;
            return (
              <div
                key={s.image}
                className="absolute inset-0 transition-opacity duration-[900ms] will-change-[opacity,transform]"
                style={{
                  opacity,
                  transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <Image
                  src={s.image}
                  alt=""
                  fill
                  priority={i === 0}
                  className="object-cover object-top"
                  sizes="100vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} mix-blend-overlay`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
              </div>
            );
          })}
        </div>

        {/* Contenido textual sobrepuesto */}
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="max-w-2xl">
            {SCENES.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              return (
                <div
                  key={s.title}
                  aria-hidden={!isActive}
                  className="absolute bottom-20 left-5 right-5 sm:bottom-28 sm:left-8 sm:right-8 max-w-2xl transition-all duration-[900ms] will-change-[opacity,transform]"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translate3d(0, ${isActive ? 0 : 24}px, 0)`,
                    filter: isActive ? "blur(0px)" : "blur(8px)",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-xl">
                    <Icon className="h-3.5 w-3.5 text-orange-400" />
                    {s.eyebrow}
                  </div>
                  <h2 className="display-h mt-5 text-[40px] leading-[1.05] sm:text-[72px] lg:text-[88px]">
                    {s.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-lg text-white/75 sm:text-xl">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Indicadores (dots) */}
          <div className="relative z-20 mt-8 flex items-center gap-2">
            {SCENES.map((_, i) => (
              <span
                key={i}
                className="h-[3px] rounded-full bg-white/20 transition-all duration-500 ease-out"
                style={{
                  width: active === i ? 48 : 20,
                  background:
                    active === i
                      ? `linear-gradient(90deg, rgba(249,115,22,1) ${clampedLocal * 100}%, rgba(255,255,255,0.2) ${clampedLocal * 100}%)`
                      : undefined,
                }}
              />
            ))}
            <span className="ml-3 text-[11px] uppercase tracking-widest text-white/50">
              {String(active + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
