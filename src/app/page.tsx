import Link from "next/link";
import Image from "next/image";
import {
  Dumbbell,
  CalendarCheck,
  Video,
  TrendingUp,
  Camera,
  Apple,
  MessageCircle,
  Shield,
  Users,
  Trophy,
  Award,
  Star,
  Check,
  Heart,
  BarChart3,
  MapPin,
  Clock,
  Navigation,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import GalleryLightbox from "@/components/GalleryLightbox";
import Reveal from "@/components/Reveal";

const WHATSAPP_URL =
  "https://wa.me/5214431234567?text=Hola%20Karla%2C%20quiero%20informaci%C3%B3n%20sobre%20LM%20Sport%20Gym";

const GYM_LOCATION = {
  lat: 19.7013912,
  lng: -100.4691184,
  mapsLink: "https://maps.app.goo.gl/Mwi93DT5q5vwr9jc9",
  area: "Morelia, Mich.",
};

const features = [
  { icon: Dumbbell, title: "Gimnasio completo", desc: "Peso libre, máquinas, cardio, área funcional." },
  { icon: CalendarCheck, title: "Rutina personalizada", desc: "Diseñada por Karla para tu nivel y objetivo." },
  { icon: Video, title: "Video de cada ejercicio", desc: "Técnica correcta en cada movimiento." },
  { icon: TrendingUp, title: "Progreso medible", desc: "Peso, medidas, grasa. Gráficas en vivo." },
  { icon: Camera, title: "Fotos antes/después", desc: "Comparador frontal, lateral y espalda." },
  { icon: Apple, title: "Asesoría nutricional", desc: "Plan de alimentación realista y mexicano." },
  { icon: MessageCircle, title: "Chat con tu coach", desc: "Preguntas, motivación, ajustes al instante." },
  { icon: Shield, title: "Ambiente seguro", desc: "Limpio, respetuoso y enfocado al resultado." },
];

const plans = [
  {
    name: "Mensual",
    price: "$300",
    tag: "Acceso al gym",
    features: ["Acceso ilimitado al gym", "Equipo completo de fuerza", "Área de cardio", "Vestidores y regaderas"],
    cta: "Inscribirme",
    featured: false,
  },
  {
    name: "Premium + Coaching",
    price: "$899",
    tag: "Lo más elegido",
    features: [
      "Todo el plan Mensual",
      "Rutina personalizada con videos",
      "Fotos y medidas de progreso",
      "Asesoría nutricional",
      "Chat directo con Karla",
    ],
    cta: "Empezar Premium",
    featured: true,
  },
  {
    name: "VIP 1 a 1",
    price: "$1,499",
    tag: "100% personalizado",
    features: [
      "Todo el plan Premium",
      "Videollamadas mensuales",
      "Plan de suplementación",
      "Ajustes semanales",
      "Soporte prioritario",
    ],
    cta: "Quiero VIP",
    featured: false,
  },
];

const testimonials = [
  { name: "Andrea López", result: "Perdió 12 kg en 3 meses", body: "Karla me diseñó una rutina que pude seguir en el gym y desde casa. Los videos me ayudaron a hacer cada ejercicio correctamente. ¡Estoy feliz con mis resultados!", },
  { name: "Sofía Ramírez", result: "Ganó masa muscular", body: "La asesoría de Karla es increíble. Cada rutina está pensada para mi nivel y mis objetivos. Las fotos de progreso me mantienen motivada." },
  { name: "Diana Torres", result: "Transformación total", body: "En 6 meses cambié mi cuerpo y mi mentalidad. El seguimiento de medidas y la comunicación constante con el equipo hicieron toda la diferencia." },
];

const stats = [
  { v: "500+", l: "Transformaciones" },
  { v: "5+", l: "Años" },
  { v: "98%", l: "Satisfacción" },
  { v: "24/7", l: "Soporte" },
];

export const revalidate = 60;

async function loadContent() {
  try {
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { images: { orderBy: { order: "asc" }, include: { upload: { select: { id: true } } } } },
    });
    const galleryRaw = await prisma.post.findMany({
      where: { isPublished: true, tags: { contains: "galeria" } },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: { images: { orderBy: { order: "asc" }, include: { upload: { select: { id: true } } } } },
    });
    const gallery: Array<{ id: string; url: string; title: string | null }> = [];
    for (const p of galleryRaw) {
      for (const pi of p.images) {
        gallery.push({ id: pi.upload.id, url: `/api/uploads/${pi.upload.id}`, title: p.title });
      }
    }
    return {
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        publishedAt: p.publishedAt,
        images: p.images.map((pi) => ({ id: pi.upload.id, url: `/api/uploads/${pi.upload.id}` })),
      })),
      gallery: gallery.slice(0, 12),
    };
  } catch {
    return { posts: [], gallery: [] };
  }
}

export default async function LandingPage() {
  const { posts, gallery } = await loadContent();

  return (
    <div className="bg-black text-white antialiased selection:bg-orange-500/30">
      {/* Nav flotante estilo Apple */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="LM Sport Gym" width={24} height={24} className="h-6 w-6 object-contain" />
            <span className="text-[13px] font-medium tracking-tight text-white/90">LM Sport Gym</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-[12px] text-white/70">
            <a href="#historia" className="hover:text-white transition">Historia</a>
            <a href="#funciones" className="hover:text-white transition">Funciones</a>
            <a href="#galeria" className="hover:text-white transition">Galería</a>
            <a href="#planes" className="hover:text-white transition">Planes</a>
            <a href="#ubicacion" className="hover:text-white transition">Ubicación</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-8 items-center rounded-full px-3 text-[12px] font-medium text-white/80 hover:text-white transition"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="inline-flex h-8 items-center rounded-full bg-white text-black px-3 text-[12px] font-semibold hover:bg-white/90 active:scale-[0.97] transition"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO — a pantalla completa estilo "Think different" */}
      <section className="section-full relative overflow-hidden pt-16 sm:pt-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-orange-500/[0.12] blur-[180px]" />
        </div>
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-20 sm:py-28 text-center">
          <Reveal delay={0}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-orange-300">
              <Trophy className="h-3 w-3" /> Atleta y Coach Certificada FMFF
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="display-h mt-8 text-[48px] leading-[1.02] sm:text-[80px] lg:text-[112px]">
              Entrena.
              <br />
              <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                Transforma.
              </span>
              <br />
              <span className="gradient-text">Repite.</span>
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="display-sub mx-auto mt-8 max-w-2xl text-lg text-white/70 sm:text-xl">
              Soy Karla Lizeth Merlos. Atleta de wellness fitness y tu coach personal.
              Entrena en nuestro gimnasio o desde casa, con rutinas y nutrición diseñadas para ti.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <button className="group inline-flex h-12 items-center gap-2 rounded-full bg-orange-500 px-7 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(249,115,22,0.6)] hover:bg-orange-500/90 active:scale-[0.97] transition">
                  Comenzar mi transformación
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </a>
              <a href="#funciones">
                <button className="inline-flex h-12 items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-6 text-[15px] font-medium text-white/90 backdrop-blur-xl hover:bg-white/[0.08] active:scale-[0.97] transition">
                  Ver más <ChevronRight className="h-4 w-4" />
                </button>
              </a>
            </div>
          </Reveal>
          <Reveal delay={600}>
            <div className="mt-10 flex items-center justify-center gap-6 text-[12px] text-white/50">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-orange-400" />Morelia, Mich.</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-orange-400" />Lun–Sáb · 5:30–22:00</span>
            </div>
          </Reveal>
        </div>

        {/* Hero image a pantalla completa debajo */}
        <Reveal variant="scale" delay={200}>
          <div className="mx-auto mt-4 max-w-[1200px] px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgba(249,115,22,0.3)]">
              <Image
                src="/karla-hero.jpg"
                alt="Karla Lizeth Merlos"
                width={1400}
                height={800}
                priority
                className="h-[400px] sm:h-[560px] w-full object-cover object-top"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <div className="flex items-end justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-orange-400 font-medium uppercase tracking-widest">Coach y Atleta</p>
                    <h3 className="text-2xl sm:text-4xl font-semibold tracking-tight mt-1">Karla Lizeth Merlos</h3>
                  </div>
                  <span className="rounded-full bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1 text-xs font-medium">
                    Wellness Fitness
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* STATS — fila grande blanca sobre negro */}
      <section className="border-y border-white/5 bg-[#0a0a0a]">
        <div className="mx-auto max-w-[1400px] grid grid-cols-2 md:grid-cols-4 px-5 sm:px-8 py-14">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 80} className="text-center">
              <div className="text-5xl sm:text-6xl font-semibold tracking-tighter gradient-text">{s.v}</div>
              <div className="mt-2 text-[11px] uppercase tracking-widest text-white/50">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HISTORIA — grid 2 cols con headline grande */}
      <section id="historia" className="section-full bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Historia</p>
            <h2 className="display-h mt-4 text-[40px] sm:text-[72px] max-w-4xl">
              De atleta de competencia a tu <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">coach personal</span>.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-12 lg:grid-cols-2 items-center">
            <Reveal variant="left">
              <div className="grid grid-cols-2 gap-4">
                <PhotoTile src="/karla-competition-front.jpg" alt="Competencia FMFF" tag="Competencia FMFF" icon={Trophy} aspect="aspect-[3/4]" />
                <PhotoTile src="/karla-competition-back.jpg" alt="Pose de espalda" tag="Wellness" icon={Award} aspect="aspect-[3/4] translate-y-6" />
                <PhotoTile src="/karla-competition-stage.jpg" alt="En tarima" tag="Tarima" icon={Star} aspect="aspect-[4/3]" />
                <PhotoTile src="/karla-hero.jpg" alt="Sesión" tag="Coach" icon={Heart} aspect="aspect-[4/3] translate-y-6" />
              </div>
            </Reveal>
            <Reveal variant="right" delay={160}>
              <div className="space-y-6 text-lg leading-relaxed text-white/70">
                <p>
                  Atleta de <strong className="text-white font-semibold">wellness fitness</strong> con experiencia en competencias nacionales FMFF, y coach certificada apasionada por ayudar a mujeres y hombres a alcanzar su mejor versión.
                </p>
                <p>
                  Mi enfoque combina <strong className="text-white font-semibold">entrenamiento inteligente</strong> con nutrición personalizada. No creo en dietas extremas ni rutinas genéricas. Cada programa que diseño está pensado para tu cuerpo, tu nivel y tus metas.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[
                    { icon: Trophy, title: "FMFF", desc: "Atleta activa" },
                    { icon: Award, title: "Certificada", desc: "Coach pro" },
                    { icon: Users, title: "500+", desc: "Vidas cambiadas" },
                  ].map((b) => (
                    <div key={b.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-xl">
                      <b.icon className="mx-auto mb-2 h-5 w-5 text-orange-400" />
                      <p className="text-sm font-semibold">{b.title}</p>
                      <p className="text-[11px] text-white/50">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FEATURES — grid con hover lift */}
      <section id="funciones" className="bg-[#0f0f10] py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Qué incluye</p>
            <h2 className="display-h mt-4 text-[40px] sm:text-[64px] max-w-4xl mx-auto">
              Todo lo que necesitas,<br />en un solo lugar.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <Reveal key={f.title} variant="scale" delay={(i % 4) * 100}>
                <div className="group h-full rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-white/[0.04]">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 transition group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110">
                    <f.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      {gallery.length > 0 && (
        <section id="galeria" className="bg-black py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <Reveal className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Galería</p>
              <h2 className="display-h mt-4 text-[40px] sm:text-[64px]">LM Sport Gym por dentro.</h2>
            </Reveal>
            <Reveal delay={120}>
              <GalleryLightbox items={gallery} />
            </Reveal>
          </div>
        </section>
      )}

      {/* POSTS */}
      {posts.length > 0 && (
        <section id="posts" className="bg-[#0a0a0a] py-24 sm:py-32">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <Reveal className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Novedades</p>
              <h2 className="display-h mt-4 text-[40px] sm:text-[64px]">Lo último en el gym.</h2>
            </Reveal>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100} variant="scale">
                  <article className="group h-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] transition-all duration-500 hover:-translate-y-1 hover:border-orange-500/30">
                    {p.images[0] && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.images[0].url} alt={p.title ?? "Post"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="text-[11px] uppercase tracking-widest text-orange-400/80 mb-2">
                        {new Date(p.publishedAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                      {p.title && <h3 className="text-lg font-semibold tracking-tight mb-2 line-clamp-2">{p.title}</h3>}
                      {p.body && <p className="text-sm text-white/55 leading-relaxed line-clamp-4 whitespace-pre-line">{p.body}</p>}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING */}
      <section id="planes" className="bg-[#0f0f10] py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Planes</p>
            <h2 className="display-h mt-4 text-[40px] sm:text-[64px]">Invierte en ti.</h2>
            <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
              Tres formas de entrenar con nosotros. Elige la que mejor se adapte a tu vida.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 120} variant="scale">
                <div
                  className={`relative h-full flex flex-col overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 ${
                    plan.featured
                      ? "border border-orange-500/40 bg-gradient-to-b from-orange-500/[0.08] to-white/[0.01] md:scale-105 shadow-[0_30px_80px_-30px_rgba(249,115,22,0.35)]"
                      : "border border-white/[0.08] bg-white/[0.02]"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                      Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{plan.tag}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-semibold tracking-tighter">{plan.price}</span>
                    <span className="text-white/50 text-sm">MXN/mes</span>
                  </div>
                  <ul className="mt-8 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-8 block">
                    <button
                      className={`w-full h-11 rounded-full text-sm font-semibold transition active:scale-[0.97] ${
                        plan.featured
                          ? "bg-orange-500 text-white hover:bg-orange-500/90 shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)]"
                          : "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Resultados reales</p>
            <h2 className="display-h mt-4 text-[40px] sm:text-[64px]">Historias de transformación.</h2>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <figure className="h-full rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl">
                  <div className="mb-5 flex gap-1 text-orange-400">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-orange-400 mb-3">{t.result}</p>
                  <blockquote className="text-[15px] text-white/80 leading-relaxed mb-6">
                    &ldquo;{t.body}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-400 ring-1 ring-orange-500/20">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-white/50">Miembro LM Sport Gym</div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section id="ubicacion" className="bg-[#0a0a0a] py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Ubicación</p>
            <h2 className="display-h mt-4 text-[40px] sm:text-[64px]">Ven a entrenar con nosotros.</h2>
          </Reveal>
          <div className="grid gap-10 lg:grid-cols-2 items-stretch">
            <Reveal variant="left">
              <div className="h-full flex flex-col justify-center space-y-6">
                <p className="text-lg text-white/70 leading-relaxed">
                  Estamos en {GYM_LOCATION.area}. Instalaciones limpias, equipo profesional y un ambiente para que des tu mejor versión.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">LM Sport Gym</div>
                      <div className="text-sm text-white/60">{GYM_LOCATION.area}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold">Horario</div>
                      <div className="text-sm text-white/60">Lunes a Sábado · 5:30 – 22:00</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4">
                  <a href={GYM_LOCATION.mapsLink} target="_blank" rel="noopener noreferrer">
                    <button className="inline-flex h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-500/90 active:scale-[0.97] transition shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)]">
                      <Navigation className="h-4 w-4" /> Cómo llegar
                    </button>
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <button className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-white hover:bg-white/[0.08] active:scale-[0.97] transition">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </button>
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal variant="right" delay={160}>
              <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl aspect-square lg:aspect-auto lg:h-[520px]">
                <iframe
                  src={`https://www.google.com/maps?q=${GYM_LOCATION.lat},${GYM_LOCATION.lng}&z=17&output=embed`}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="border-0"
                  title="Ubicación de LM Sport Gym"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-black py-28 sm:py-40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[160px]" />
        </div>
        <Reveal>
          <div className="mx-auto max-w-[1000px] px-5 sm:px-8 text-center">
            <Image src="/logo.png" alt="LM Sport Gym" width={72} height={72} className="mx-auto mb-10 h-18 w-18 animate-float" />
            <h2 className="display-h text-[42px] sm:text-[80px]">
              Tu mejor versión<br />
              <span className="gradient-text">te está esperando.</span>
            </h2>
            <p className="mt-8 text-lg text-white/60 max-w-2xl mx-auto">
              Únete a más de 500 personas que ya transformaron su vida con LM Sport Gym.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <button className="group inline-flex h-12 items-center gap-2 rounded-full bg-orange-500 px-8 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(249,115,22,0.6)] hover:bg-orange-500/90 active:scale-[0.97] transition">
                  Quiero comenzar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </a>
              <Link href="/login">
                <button className="inline-flex h-12 items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-7 text-[15px] font-medium text-white/90 hover:bg-white/[0.08] active:scale-[0.97] transition">
                  Ya soy miembro <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/40">
              <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Datos seguros</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Cancela cuando quieras</span>
              <span className="hidden sm:inline-flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Progreso real</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#060607]">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-14">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="LM Sport Gym" width={28} height={28} className="h-7 w-7 object-contain" />
                <span className="text-sm font-semibold tracking-tight">LM Sport Gym</span>
              </Link>
              <p className="mt-4 text-sm text-white/50 leading-relaxed">
                Coaching fitness profesional por Karla Lizeth Merlos. Transformando vidas a través del ejercicio y la nutrición.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold text-white/80 uppercase tracking-widest">Plataforma</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#funciones" className="hover:text-white transition">Funciones</a></li>
                <li><a href="#planes" className="hover:text-white transition">Planes</a></li>
                <li><a href="#galeria" className="hover:text-white transition">Galería</a></li>
                <li><Link href="/login" className="hover:text-white transition">Iniciar sesión</Link></li>
                <li><Link href="/registro" className="hover:text-white transition">Registro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold text-white/80 uppercase tracking-widest">Contacto</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">WhatsApp</a></li>
                <li><a href={GYM_LOCATION.mapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Cómo llegar</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold text-white/80 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} LM Sport Gym · Karla Lizeth Merlos. Todos los derechos reservados.</p>
            <p className="text-xs text-white/30">Donde se hacen los campeones</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PhotoTile({
  src,
  alt,
  tag,
  icon: Icon,
  aspect,
}: {
  src: string;
  alt: string;
  tag: string;
  icon: React.ElementType;
  aspect: string;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl ${aspect}`}>
      <Image src={src} alt={alt} fill className="object-cover object-top transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-orange-400" />
          <span className="text-[10px] font-medium uppercase tracking-widest">{tag}</span>
        </div>
      </div>
    </div>
  );
}
