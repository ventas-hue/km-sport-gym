import Link from "next/link";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  Video,
  CalendarCheck,
  Shield,
  ChevronRight,
  Star,
  BarChart3,
  Camera,
  MessageCircle,
  ArrowRight,
  Check,
  Heart,
  Apple,
  Trophy,
  Award,
  Dumbbell,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Dumbbell,
    title: "Gimnasio Completo",
    description:
      "Instalaciones modernas con equipo profesional: peso libre, maquinas, cardio y area funcional. Todo lo que necesitas para entrenar.",
  },
  {
    icon: CalendarCheck,
    title: "Rutinas Personalizadas",
    description:
      "Programas disenados por Karla especificamente para ti, con series, repeticiones y videos demostrativos de cada ejercicio.",
  },
  {
    icon: Video,
    title: "Videos de Cada Ejercicio",
    description:
      "Aprende la tecnica correcta con videos de cada movimiento. Entrena con confianza dentro o fuera del gym.",
  },
  {
    icon: TrendingUp,
    title: "Seguimiento de Progreso",
    description:
      "Graficos interactivos de peso, medidas corporales y porcentaje de grasa. Mira tu evolucion en tiempo real.",
  },
  {
    icon: Camera,
    title: "Fotos de Progreso",
    description:
      "Comparador antes/despues con fotos frontales, laterales y de espalda. Tu transformacion visible.",
  },
  {
    icon: Apple,
    title: "Asesoria Nutricional",
    description:
      "Planes de alimentacion personalizados que complementan tu entrenamiento para resultados optimos.",
  },
  {
    icon: MessageCircle,
    title: "Comunicacion Directa",
    description:
      "Chat directo con tu coach. Resuelve dudas, recibe motivacion y retroalimentacion al instante.",
  },
  {
    icon: Shield,
    title: "Ambiente Seguro",
    description:
      "Espacio limpio, respetuoso y enfocado al resultado. Entrena a tu ritmo con el apoyo de nuestro equipo.",
  },
];

const plans = [
  {
    name: "Mensual Basico",
    price: "$300",
    period: "/mes",
    description: "Acceso al gimnasio 30 dias",
    features: [
      "Acceso ilimitado al gym",
      "Equipo completo de fuerza",
      "Area de cardio",
      "Vestidores y regaderas",
      "Horario extendido",
    ],
    cta: "Inscribirme",
    popular: false,
  },
  {
    name: "Premium + Coaching",
    price: "$899",
    period: "/mes",
    description: "Gym + coaching online con Karla",
    features: [
      "Todo el plan Mensual",
      "Rutina personalizada con videos",
      "Fotos y medidas de progreso",
      "Asesoria nutricional",
      "Chat directo con Karla",
      "Ajustes quincenales",
    ],
    cta: "Empezar Premium",
    popular: true,
  },
  {
    name: "VIP 1 a 1",
    price: "$1,499",
    period: "/mes",
    description: "Atencion 100% personalizada",
    features: [
      "Todo el plan Premium",
      "Videollamadas mensuales con Karla",
      "Plan de suplementacion",
      "Ajustes semanales",
      "Grupo exclusivo VIP",
      "Soporte prioritario 24/7",
    ],
    cta: "Quiero VIP",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Andrea Lopez",
    result: "Perdio 12 kg en 3 meses",
    content:
      "Karla me diseno una rutina que pude seguir en el gym y desde casa. Los videos me ayudaron a hacer cada ejercicio correctamente. Estoy feliz con mis resultados!",
    rating: 5,
  },
  {
    name: "Sofia Ramirez",
    result: "Gano masa muscular",
    content:
      "La asesoria de Karla es increible. Cada rutina esta pensada para mi nivel y mis objetivos. Las fotos de progreso me mantienen motivada.",
    rating: 5,
  },
  {
    name: "Diana Torres",
    result: "Transformacion total",
    content:
      "En 6 meses cambie mi cuerpo y mi mentalidad. El seguimiento de medidas y la comunicacion constante con el equipo hicieron toda la diferencia.",
    rating: 5,
  },
];

const stats = [
  { value: "500+", label: "Transformaciones" },
  { value: "5+", label: "Anos de experiencia" },
  { value: "98%", label: "Clientes satisfechos" },
  { value: "24/7", label: "Soporte disponible" },
];

const WHATSAPP_URL =
  "https://wa.me/5214431234567?text=Hola%20Karla%2C%20quiero%20informacion%20sobre%20LM%20Sport%20Gym";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="LM Sport Gym"
              width={40}
              height={40}
              className="h-10 w-10 object-contain transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight">
                LM Sport Gym
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-orange-400">
                By Karla Lizeth
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#conoceme" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
              Conoceme
            </a>
            <a href="#funciones" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
              Funciones
            </a>
            <a href="#planes" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
              Planes
            </a>
            <a href="#testimonios" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">
              Resultados
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Iniciar Sesion
              </Button>
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1 font-semibold">
                Unirme Ahora
                <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]" />
            <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-yellow-500/5 blur-[100px]" />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="animate-fade-in-up">
                <Badge variant="secondary" className="mb-6 border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  <Trophy className="h-3.5 w-3.5" />
                  Atleta y Coach Certificada FMFF
                </Badge>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  Transforma tu cuerpo
                  <span className="mt-2 block gradient-text">con LM Sport Gym</span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl">
                  Soy <strong className="text-orange-400">Karla Lizeth Merlos</strong>,
                  atleta de wellness fitness y tu coach personal. Entrena en nuestro
                  gimnasio o desde casa con rutinas personalizadas, videos y
                  seguimiento real de tu progreso.
                </p>
                <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="gap-2 px-8 font-semibold animate-pulse-glow">
                      Comenzar Mi Transformacion
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                  <a href="#conoceme">
                    <Button variant="outline" size="lg" className="px-8 text-white">
                      Conocer a Karla
                    </Button>
                  </a>
                </div>
                <div className="mt-8 flex items-center gap-6 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    Morelia, Mich.
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-orange-400" />
                    Lun a Sab 5:30 - 22:00
                  </span>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block animate-fade-in-up">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-orange-500/30 via-orange-500/10 to-transparent blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10">
                  <Image
                    src="/karla-hero.jpg"
                    alt="Karla Lizeth Merlos - Coach de LM Sport Gym"
                    width={500}
                    height={650}
                    className="h-[640px] w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/logo.png"
                        alt="LM"
                        width={36}
                        height={36}
                        className="h-9 w-9"
                      />
                      <div>
                        <p className="text-lg font-bold">Karla Lizeth Merlos</p>
                        <p className="text-sm text-orange-400">Coach y Atleta Wellness Fitness</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-white/5 bg-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="text-4xl font-extrabold gradient-text sm:text-5xl transition-transform group-hover:scale-110">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Karla */}
        <section id="conoceme" className="scroll-mt-16 bg-[#0f0f0f]">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Competition photos collage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                    <Image
                      src="/karla-competition-front.jpg"
                      alt="Karla Lizeth en competencia - pose frontal"
                      width={400}
                      height={550}
                      className="h-[320px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-orange-400" />
                        <span className="text-xs font-medium">Competencia FMFF</span>
                      </div>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                    <Image
                      src="/karla-hero.jpg"
                      alt="Karla Lizeth - sesion profesional"
                      width={400}
                      height={300}
                      className="h-[200px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                    <Image
                      src="/karla-competition-back.jpg"
                      alt="Karla Lizeth en competencia - pose espalda"
                      width={400}
                      height={550}
                      className="h-[280px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-orange-400" />
                        <span className="text-xs font-medium">Wellness Fitness</span>
                      </div>
                    </div>
                  </div>
                  <div className="group relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
                    <Image
                      src="/karla-competition-stage.jpg"
                      alt="Karla Lizeth en tarima"
                      width={400}
                      height={300}
                      className="h-[240px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                        <span className="text-xs font-medium">En tarima</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About text */}
              <div>
                <Badge variant="secondary" className="mb-4 border border-orange-500/30 bg-orange-500/10 text-orange-300">
                  Tu Coach
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Conoce a Karla Lizeth Merlos
                </h2>
                <div className="mt-6 space-y-4 text-gray-300">
                  <p>
                    Atleta de <strong className="text-white">wellness fitness</strong> con
                    experiencia en competencias nacionales FMFF, y coach certificada
                    apasionada por ayudar a otras mujeres y hombres a alcanzar su mejor version.
                  </p>
                  <p>
                    Mi enfoque combina entrenamiento inteligente con nutricion
                    personalizada. No creo en dietas extremas ni rutinas genericas.
                    Cada programa que diseno esta pensado para{" "}
                    <strong className="text-white">tu cuerpo, tu nivel y tus metas</strong>.
                  </p>
                  <p>
                    En LM Sport Gym podras entrenar en sitio con equipo profesional o
                    llevar tu programa desde cualquier lugar con rutinas en video,
                    seguimiento de progreso y comunicacion directa conmigo.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { icon: Trophy, title: "Atleta FMFF", desc: "Competidora activa" },
                    { icon: Award, title: "Certificada", desc: "Coach profesional" },
                    { icon: Users, title: "500+", desc: "Transformaciones" },
                  ].map((b) => (
                    <div
                      key={b.title}
                      className="rounded-xl border border-white/10 bg-white/5 p-4 text-center transition-all hover:border-orange-500/40 hover:bg-orange-500/5 hover:-translate-y-1"
                    >
                      <b.icon className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                      <p className="text-sm font-semibold">{b.title}</p>
                      <p className="text-xs text-gray-400">{b.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="gap-2 font-semibold">
                      Entrenar con Karla
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="funciones" className="scroll-mt-16 bg-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 border border-orange-500/30 bg-orange-500/10 text-orange-300">
                Que Incluye
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Todo lo que necesitas para alcanzar tus metas
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Un sistema completo disenado por Karla Lizeth para guiarte hacia tu mejor version.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden border-white/10 bg-white/[0.02] backdrop-blur transition-all hover:-translate-y-1 hover:border-orange-500/40 hover:bg-orange-500/[0.03]"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-all group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[#0f0f0f]">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 border border-orange-500/30 bg-orange-500/10 text-orange-300">
                Como Funciona
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tu transformacion en 3 pasos
              </h2>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Heart,
                  title: "Cuentame tu objetivo",
                  desc: "Escribeme por WhatsApp y dime que quieres lograr: bajar de peso, tonificar, ganar masa muscular o mejorar tu salud.",
                },
                {
                  step: "02",
                  icon: CalendarCheck,
                  title: "Recibe tu programa",
                  desc: "Diseno tu rutina personalizada con videos, series y repeticiones adaptadas a tu nivel y disponibilidad.",
                },
                {
                  step: "03",
                  icon: BarChart3,
                  title: "Mide tu progreso",
                  desc: "Sube fotos, registra medidas y mira tus graficos. Ajusto tu rutina segun tus resultados.",
                },
              ].map((item) => (
                <div key={item.step} className="group relative text-center">
                  <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-2xl shadow-orange-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <item.icon className="h-10 w-10" />
                  </div>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-8xl font-extrabold text-white/[0.04] select-none">
                    {item.step}
                  </span>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="planes" className="scroll-mt-16 bg-[#0a0a0a]">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 border border-orange-500/30 bg-orange-500/10 text-orange-300">
                Planes
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Invierte en ti
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                Elige el plan que mejor se adapte a tus metas. Todos incluyen atencion personalizada.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative overflow-hidden transition-all hover:-translate-y-1 ${
                    plan.popular
                      ? "border-orange-500 bg-gradient-to-b from-orange-500/10 to-white/[0.02] shadow-2xl shadow-orange-500/10 md:scale-105"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute right-4 top-4">
                      <Badge className="bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                        Mas Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold">{plan.price}</span>
                      <span className="text-gray-400">MXN{plan.period}</span>
                    </div>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 block"
                    >
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </a>
                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonios" className="scroll-mt-16 bg-[#0f0f0f]">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-4 border border-orange-500/30 bg-orange-500/10 text-orange-300">
                Resultados Reales
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Historias de transformacion
              </h2>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card
                  key={t.name}
                  className="border-white/10 bg-white/[0.02] transition-all hover:-translate-y-1 hover:border-orange-500/30"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-orange-400 text-orange-400"
                        />
                      ))}
                    </div>
                    <p className="mb-2 text-sm font-semibold text-orange-400">
                      {t.result}
                    </p>
                    <p className="mb-6 text-sm leading-relaxed text-gray-300">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-bold text-orange-400">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-xs text-gray-500">
                          Miembro LM Sport Gym
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-[#0a0a0a]">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <Image
                  src="/logo.png"
                  alt="LM Sport Gym"
                  width={64}
                  height={64}
                  className="mx-auto mb-6 animate-float lg:mx-0"
                />
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  Tu mejor version te esta esperando
                </h2>
                <p className="mt-4 text-lg text-gray-400">
                  Unete a mas de 500 personas que ya transformaron su vida con
                  LM Sport Gym. Da el primer paso hoy con Karla.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="gap-2 px-8 font-semibold animate-pulse-glow">
                      Quiero Comenzar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 lg:justify-start">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    Datos seguros
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Cancela cuando quieras
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex lg:justify-center">
                <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10">
                  <Image
                    src="/karla-competition-front.jpg"
                    alt="Karla Lizeth Merlos"
                    width={400}
                    height={500}
                    className="h-[500px] w-auto object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                    <p className="text-lg font-bold">Karla Lizeth Merlos</p>
                    <p className="text-sm text-orange-400">Tu coach en LM Sport Gym</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="LM Sport Gym"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-bold">LM Sport Gym</span>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                Coaching fitness profesional por Karla Lizeth Merlos.
                Transformando vidas a traves del ejercicio y la nutricion.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-300">Plataforma</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#funciones" className="hover:text-white transition-colors">Funciones</a></li>
                <li><a href="#planes" className="hover:text-white transition-colors">Planes</a></li>
                <li><a href="#testimonios" className="hover:text-white transition-colors">Resultados</a></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Iniciar Sesion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-300">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    WhatsApp
                  </a>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-300">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terminos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-6 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} LM Sport Gym by Karla Lizeth Merlos. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
