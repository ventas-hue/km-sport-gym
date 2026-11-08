"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  User,
  Target,
  Dumbbell,
  Heart,
  Apple,
  Clock,
  Save,
  CheckCircle,
} from "lucide-react";

type Form = Record<string, string | number | boolean | null>;

const SECTIONS = [
  {
    key: "personal",
    title: "Datos personales",
    icon: User,
    desc: "Lo básico que necesita tu coach.",
  },
  {
    key: "goal",
    title: "Objetivo y experiencia",
    icon: Target,
    desc: "¿Qué quieres lograr y de dónde partes?",
  },
  {
    key: "availability",
    title: "Disponibilidad y lugar",
    icon: Dumbbell,
    desc: "Días, tiempo y dónde entrenas.",
  },
  {
    key: "health",
    title: "Salud y lesiones",
    icon: Heart,
    desc: "Para que tu rutina sea segura.",
  },
  {
    key: "nutrition",
    title: "Nutrición",
    icon: Apple,
    desc: "Para armarte una dieta realista.",
  },
  {
    key: "habits",
    title: "Hábitos diarios",
    icon: Clock,
    desc: "Sueño, estrés y actividad del día a día.",
  },
] as const;

export default function FichaFitnessPage() {
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/client-profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setForm(d.profile);
      })
      .catch(() => setError("No se pudo cargar tu ficha"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string | number | boolean | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/client-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("save failed");
      setSavedAt(new Date());
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 lg:pt-0 space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium tracking-tight mb-4">
          <ClipboardList size={12} />
          Ficha fitness
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Cuéntame todo sobre ti
        </h1>
        <p className="text-white/50 mt-2 text-sm leading-relaxed">
          Entre más completa esté tu ficha, mejor podré diseñar tu rutina y tu
          plan nutricional. Puedes volver y actualizarla cuando quieras.
        </p>
      </div>

      {/* Personal */}
      <Section def={SECTIONS[0]}>
        <Grid cols={3}>
          <Select
            label="Sexo"
            value={form.gender}
            onChange={(v) => set("gender", v)}
            options={[
              ["F", "Femenino"],
              ["M", "Masculino"],
              ["other", "Otro"],
            ]}
          />
          <NumberInput
            label="Edad"
            value={form.age}
            onChange={(v) => set("age", v)}
            unit="años"
          />
          <NumberInput
            label="Estatura"
            value={form.heightCm}
            onChange={(v) => set("heightCm", v)}
            unit="cm"
            step={0.5}
          />
          <NumberInput
            label="Peso actual"
            value={form.initialWeight}
            onChange={(v) => set("initialWeight", v)}
            unit="kg"
            step={0.1}
          />
          <NumberInput
            label="Peso meta"
            value={form.targetWeight}
            onChange={(v) => set("targetWeight", v)}
            unit="kg"
            step={0.1}
          />
        </Grid>
      </Section>

      {/* Goal */}
      <Section def={SECTIONS[1]}>
        <Grid cols={2}>
          <Select
            label="Objetivo principal"
            value={form.mainGoal}
            onChange={(v) => set("mainGoal", v)}
            options={[
              ["lose_fat", "Bajar grasa / peso"],
              ["gain_muscle", "Ganar masa muscular"],
              ["tone", "Tonificar"],
              ["maintain", "Mantener"],
              ["performance", "Rendimiento deportivo"],
              ["health", "Salud general"],
            ]}
          />
          <Select
            label="Objetivo secundario"
            value={form.secondaryGoal}
            onChange={(v) => set("secondaryGoal", v)}
            options={[
              ["", "Ninguno"],
              ["lose_fat", "Bajar grasa / peso"],
              ["gain_muscle", "Ganar masa muscular"],
              ["tone", "Tonificar"],
              ["performance", "Rendimiento"],
              ["flexibility", "Flexibilidad / movilidad"],
            ]}
          />
          <Select
            label="Nivel de experiencia"
            value={form.experienceLevel}
            onChange={(v) => set("experienceLevel", v)}
            options={[
              ["beginner", "Principiante (< 6 meses)"],
              ["intermediate", "Intermedio (6 meses - 2 años)"],
              ["advanced", "Avanzado (2+ años)"],
            ]}
          />
          <NumberInput
            label="Años entrenando"
            value={form.trainingYears}
            onChange={(v) => set("trainingYears", v)}
            unit="años"
            step={0.5}
          />
          <Select
            label="Actividad física actual"
            value={form.activityLevel}
            onChange={(v) => set("activityLevel", v)}
            options={[
              ["sedentary", "Sedentario (casi nada)"],
              ["light", "Ligero (1-2 días/semana)"],
              ["moderate", "Moderado (3-4 días/semana)"],
              ["active", "Activo (5-6 días/semana)"],
              ["very_active", "Muy activo (diario + extra)"],
            ]}
          />
        </Grid>
      </Section>

      {/* Availability */}
      <Section def={SECTIONS[2]}>
        <Grid cols={3}>
          <NumberInput
            label="Días por semana"
            value={form.daysPerWeek}
            onChange={(v) => set("daysPerWeek", v)}
            unit="días"
            min={1}
            max={7}
          />
          <NumberInput
            label="Minutos por sesión"
            value={form.minutesPerSession}
            onChange={(v) => set("minutesPerSession", v)}
            unit="min"
            min={15}
            max={180}
            step={5}
          />
          <Select
            label="Horario preferido"
            value={form.preferredTime}
            onChange={(v) => set("preferredTime", v)}
            options={[
              ["morning", "Mañana"],
              ["afternoon", "Tarde"],
              ["evening", "Noche"],
            ]}
          />
          <Select
            label="Dónde entrenas"
            value={form.trainsAt}
            onChange={(v) => set("trainsAt", v)}
            options={[
              ["gym", "En el gym"],
              ["home", "En casa"],
              ["both", "Ambos"],
            ]}
          />
          <TextInput
            label="Equipo disponible"
            value={form.equipmentAvailable}
            onChange={(v) => set("equipmentAvailable", v)}
            placeholder="mancuernas, liga, barra…"
            className="col-span-3 sm:col-span-2"
          />
        </Grid>
      </Section>

      {/* Health */}
      <Section def={SECTIONS[3]}>
        <Grid cols={2}>
          <TextArea
            label="Lesiones o molestias"
            value={form.injuries}
            onChange={(v) => set("injuries", v)}
            placeholder="¿Rodilla? ¿Hombro? Especifica cuál y desde cuándo."
            className="col-span-2"
          />
          <TextArea
            label="Condiciones médicas"
            value={form.medicalConditions}
            onChange={(v) => set("medicalConditions", v)}
            placeholder="Diabetes, hipertensión, tiroides, etc."
          />
          <TextArea
            label="Medicamentos"
            value={form.medications}
            onChange={(v) => set("medications", v)}
            placeholder="Nombres de medicamentos que tomas."
          />
          <Toggle
            label="¿Embarazo o lactancia?"
            value={form.pregnantOrBreastfeed}
            onChange={(v) => set("pregnantOrBreastfeed", v)}
          />
          <Toggle
            label="¿Fumas?"
            value={form.smokes}
            onChange={(v) => set("smokes", v)}
          />
          <Select
            label="Alcohol"
            value={form.alcoholFreq}
            onChange={(v) => set("alcoholFreq", v)}
            options={[
              ["none", "No tomo"],
              ["social", "Social (ocasional)"],
              ["weekly", "Fines de semana"],
              ["daily", "Diario"],
            ]}
          />
        </Grid>
      </Section>

      {/* Nutrition */}
      <Section def={SECTIONS[4]}>
        <Grid cols={2}>
          <Select
            label="Tipo de alimentación"
            value={form.diet}
            onChange={(v) => set("diet", v)}
            options={[
              ["omnivore", "Omnívora"],
              ["vegetarian", "Vegetariana"],
              ["vegan", "Vegana"],
              ["keto", "Keto / baja en carbos"],
              ["paleo", "Paleo"],
              ["other", "Otra"],
            ]}
          />
          <Select
            label="Nivel para cocinar"
            value={form.cookingSkill}
            onChange={(v) => set("cookingSkill", v)}
            options={[
              ["none", "No cocino"],
              ["basic", "Básico"],
              ["intermediate", "Intermedio"],
              ["advanced", "Avanzado"],
            ]}
          />
          <TextArea
            label="Alergias"
            value={form.allergies}
            onChange={(v) => set("allergies", v)}
            placeholder="Nueces, mariscos…"
          />
          <TextArea
            label="Intolerancias"
            value={form.intolerances}
            onChange={(v) => set("intolerances", v)}
            placeholder="Lactosa, gluten…"
          />
          <TextArea
            label="Alimentos que NO te gustan"
            value={form.foodsDisliked}
            onChange={(v) => set("foodsDisliked", v)}
            placeholder="Para evitarlos en tu plan."
          />
          <TextArea
            label="Alimentos que sí disfrutas"
            value={form.foodsPreferred}
            onChange={(v) => set("foodsPreferred", v)}
            placeholder="Los que te motivan a comer bien."
          />
          <NumberInput
            label="Comidas al día"
            value={form.mealsPerDay}
            onChange={(v) => set("mealsPerDay", v)}
            unit="comidas"
            min={2}
            max={8}
          />
          <NumberInput
            label="Agua al día"
            value={form.waterLitersPerDay}
            onChange={(v) => set("waterLitersPerDay", v)}
            unit="L"
            step={0.25}
          />
          <NumberInput
            label="Presupuesto semanal"
            value={form.budgetPerWeek}
            onChange={(v) => set("budgetPerWeek", v)}
            unit="MXN"
          />
          <TextInput
            label="Suplementos actuales"
            value={form.currentSupplements}
            onChange={(v) => set("currentSupplements", v)}
            placeholder="Proteína, creatina, multivitamínico…"
            className="col-span-2"
          />
        </Grid>
      </Section>

      {/* Habits */}
      <Section def={SECTIONS[5]}>
        <Grid cols={3}>
          <NumberInput
            label="Horas de sueño"
            value={form.sleepHours}
            onChange={(v) => set("sleepHours", v)}
            unit="h"
            step={0.5}
          />
          <NumberInput
            label="Nivel de estrés"
            value={form.stressLevel}
            onChange={(v) => set("stressLevel", v)}
            unit="1-10"
            min={1}
            max={10}
          />
          <Select
            label="Actividad en el trabajo"
            value={form.jobActivity}
            onChange={(v) => set("jobActivity", v)}
            options={[
              ["sedentary", "Sentado todo el día"],
              ["mixed", "Mixto (sentado + movimiento)"],
              ["active", "Mayormente de pie"],
              ["very_active", "Físicamente demandante"],
            ]}
          />
        </Grid>
        <TextArea
          label="Algo más que Karla deba saber"
          value={form.notes}
          onChange={(v) => set("notes", v)}
          placeholder="Observaciones, dudas o cualquier contexto extra."
          className="mt-4"
        />
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10">
        <div className="glass-strong rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="text-xs text-white/60 min-w-0 flex-1">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : savedAt ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle size={13} /> Guardado{" "}
                {savedAt.toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : (
              "Tus datos se guardan solo cuando presionas Guardar."
            )}
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-orange-500 text-white text-sm font-medium tracking-tight shadow-[0_6px_20px_-6px_rgba(249,115,22,0.6)] hover:bg-orange-500/90 active:scale-[0.97] transition disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Guardando…" : "Guardar ficha"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----- Reusable UI bits (Apple-style) ----- */

function Section({
  def,
  children,
}: {
  def: { title: string; desc: string; icon: React.ElementType };
  children: React.ReactNode;
}) {
  const Icon = def.icon;
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{def.title}</h2>
          <p className="text-xs text-white/50 mt-0.5">{def.desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  const map = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;
  return <div className={`grid grid-cols-1 ${map[cols]} gap-3`}>{children}</div>;
}

function fieldCls(extra = "") {
  return (
    "h-10 w-full px-3 rounded-xl bg-white/[0.04] border border-white/10 " +
    "text-sm text-white placeholder:text-white/30 " +
    "focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-orange-500/15 " +
    "transition " +
    extra
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1.5">
      {children}
    </span>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: Form[string];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <Label>{label}</Label>
      <input
        type="text"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldCls()}
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: Form[string];
  onChange: (v: number | null) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label>
      <Label>
        {label} {unit && <span className="text-white/30 normal-case tracking-normal">· {unit}</span>}
      </Label>
      <input
        type="number"
        value={(value as number) ?? ""}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={fieldCls()}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: Form[string];
  onChange: (v: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <label>
      <Label>{label}</Label>
      <select
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={fieldCls("appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22white%22 opacity=%220.5%22><path d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z%22/></svg>')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:16px] pr-9")}
      >
        <option value="" className="bg-neutral-900">
          — selecciona —
        </option>
        {options.map(([val, labelText]) => (
          <option key={val} value={val} className="bg-neutral-900">
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  value: Form[string];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <Label>{label}</Label>
      <textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={fieldCls("h-auto py-2.5 resize-none min-h-[64px]")}
      />
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Form[string];
  onChange: (v: boolean) => void;
}) {
  const on = value === true;
  return (
    <div>
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => onChange(!on)}
        className={`relative h-10 w-full px-3 rounded-xl border text-sm font-medium transition flex items-center justify-between ${
          on
            ? "bg-orange-500/15 border-orange-500/40 text-orange-200"
            : "bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.07]"
        }`}
      >
        <span>{on ? "Sí" : "No"}</span>
        <span
          className={`h-5 w-9 rounded-full relative transition ${
            on ? "bg-orange-500" : "bg-white/15"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
              on ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
}
