"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame } from "lucide-react";

interface PR {
  id: string;
  exerciseId: string;
  type: string;
  value: number;
  date: string;
  exercise: { name: string; muscleGroup: string };
}

const TYPE_LABEL: Record<string, string> = {
  "1RM": "1RM estimado",
  "3RM": "3RM estimado",
  "5RM": "5RM estimado",
  volume: "Volumen maximo",
  reps: "Reps maximas",
};

const GROUP_LABEL: Record<string, string> = {
  chest: "Pecho",
  back: "Espalda",
  legs: "Piernas",
  shoulders: "Hombros",
  arms: "Brazos",
  core: "Core",
  cardio: "Cardio",
  full_body: "Cuerpo completo",
};

export default function RecordsPage() {
  const [records, setRecords] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/records")
      .then((r) => r.json())
      .then((d) => setRecords(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  // Group by muscle group
  const byGroup = records.reduce((acc, r) => {
    const g = r.exercise.muscleGroup;
    if (!acc[g]) acc[g] = [];
    acc[g].push(r);
    return acc;
  }, {} as { [key: string]: PR[] });

  return (
    <div className="pt-8 lg:pt-0 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="text-amber-500" /> Mis Records
        </h1>
        <p className="text-gray-500 mt-1">
          Tus mejores marcas — se actualizan automaticamente cuando finalizas un entrenamiento
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Trophy size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-semibold">Aun no tienes records</p>
          <p className="text-sm text-gray-400 mt-1">
            Entrena y finaliza sesiones para generar tus marcas personales
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byGroup).map(([group, items]) => (
            <div key={group}>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                {GROUP_LABEL[group] ?? group}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{r.exercise.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{TYPE_LABEL[r.type] ?? r.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {r.value.toFixed(1)}
                        <span className="text-sm text-gray-400 ml-0.5">
                          {r.type === "volume" ? "kg" : r.type === "reps" ? "" : "kg"}
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(r.date).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
