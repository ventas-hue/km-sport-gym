"use client";

import { useEffect, useState } from "react";
import { Apple, Droplet, Flame } from "lucide-react";

interface Food {
  id: string;
  name: string;
  grams: number | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

interface Meal {
  id: string;
  name: string;
  timeOfDay: string | null;
  notes: string | null;
  foods: Food[];
}

interface Plan {
  id: string;
  name: string;
  caloriesTarget: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  waterLiters: number | null;
  notes: string | null;
  isActive: boolean;
  meals: Meal[];
}

export default function NutricionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/nutrition-plans")
      .then((r) => r.json())
      .then((d) => setPlans(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const active = plans.find((p) => p.isActive) ?? plans[0];

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Apple className="text-emerald-500" /> Nutricion
        </h1>
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Apple size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Sin plan nutricional</p>
          <p className="text-sm text-gray-400 mt-1">
            Karla te preparara un plan personalizado. Si ya lo hablaron, escribele por mensajes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Apple className="text-emerald-500" /> Mi Plan Nutricional
        </h1>
        <p className="text-gray-500 mt-1">{active.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MacroCard
          icon={Flame}
          label="Calorias"
          value={active.caloriesTarget}
          unit="kcal"
          color="orange"
        />
        <MacroCard
          icon={Flame}
          label="Proteina"
          value={active.proteinG}
          unit="g"
          color="red"
        />
        <MacroCard icon={Flame} label="Carbos" value={active.carbsG} unit="g" color="amber" />
        <MacroCard icon={Flame} label="Grasa" value={active.fatG} unit="g" color="yellow" />
        <MacroCard
          icon={Droplet}
          label="Agua"
          value={active.waterLiters}
          unit="L"
          color="blue"
        />
      </div>

      {active.notes && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-900">
          {active.notes}
        </div>
      )}

      <div className="space-y-4">
        {active.meals.map((m) => {
          const totalCal = m.foods.reduce((s, f) => s + (f.calories ?? 0), 0);
          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{m.name}</h3>
                  {m.timeOfDay && <p className="text-xs text-gray-500 mt-0.5">{m.timeOfDay}</p>}
                </div>
                {totalCal > 0 && (
                  <span className="text-sm font-bold text-orange-600">{Math.round(totalCal)} kcal</span>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {m.foods.map((f) => (
                  <div key={f.id} className="p-3 flex items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{f.name}</p>
                      {f.grams && <p className="text-xs text-gray-500">{f.grams}g</p>}
                    </div>
                    <div className="flex gap-2 text-xs text-gray-500">
                      {f.calories != null && (
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                          {f.calories} kcal
                        </span>
                      )}
                      {f.proteinG != null && (
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">
                          P {f.proteinG}g
                        </span>
                      )}
                      {f.carbsG != null && (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                          C {f.carbsG}g
                        </span>
                      )}
                      {f.fatG != null && (
                        <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                          G {f.fatG}g
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {m.notes && <p className="p-3 text-xs text-gray-500 italic bg-gray-50">{m.notes}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  orange: "bg-orange-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
};

function MacroCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | null;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div
        className={`${COLOR_MAP[color] ?? "bg-gray-500"} w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2`}
      >
        <Icon size={16} />
      </div>
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">
        {value != null ? value : "-"}
        <span className="text-xs text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}
