import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import PrintControls from "./PrintControls";

export const dynamic = "force-dynamic";

const GYM = {
  name: "LM Sport Gym",
  tagline: "By Karla Lizeth Merlos · Donde se hacen los campeones",
  address: "Irimbo, Michoacán, C.P. 61285, México",
  phone: "+52 786 139 4708",
  whatsapp: "+52 786 139 4708",
  email: "karlalizethmerlosguzman@gmail.com",
  web: "lmsportgym.com",
};

async function loadWorkout(id: string) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return null;
  }
  const w = await prisma.workout.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          user: true,
          profile: true,
        },
      },
      coach: true,
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
  if (!w) return null;
  if (
    session.role !== "admin" &&
    !(session.role === "coach" && w.coachId === session.userId) &&
    !(session.role === "member" && w.client?.user?.id === session.userId)
  ) {
    return null;
  }
  return w;
}

export default async function RoutinePdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const w = await loadWorkout(id);
  if (!w) notFound();

  const clientName = w.client
    ? `${w.client.firstName} ${w.client.lastName}`
    : "Cliente";
  const clientPhone = w.client?.phone ?? "";
  const coachName = w.coach
    ? `${w.coach.firstName} ${w.coach.lastName}`
    : "LM Sport Gym";
  const createdAt = new Date(w.createdAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pdf-shell min-h-screen bg-white text-neutral-900 print:bg-white">
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm 12mm; }
          .no-print { display: none !important; }
          .pdf-day { break-inside: avoid; page-break-inside: avoid; }
          body { background: white !important; }
        }
      `}</style>

      <PrintControls
        clientName={clientName}
        clientPhone={clientPhone}
        workoutName={w.name}
      />

      {/* Printable area */}
      <div className="mx-auto max-w-[800px] px-6 py-8 print:py-0">
        {/* Header profesional */}
        <header className="pb-5 border-b-2 border-orange-500">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-neutral-900 flex items-center justify-center ring-1 ring-orange-500/40 shrink-0">
                <Image
                  src="/logo.png"
                  alt={GYM.name}
                  width={80}
                  height={80}
                  className="h-14 w-14 object-contain"
                />
              </div>
              <div>
                <div className="text-[22px] font-bold tracking-tight text-neutral-900 leading-none">
                  {GYM.name}
                </div>
                <div className="text-[10.5px] uppercase tracking-widest text-orange-600 font-semibold mt-1">
                  {GYM.tagline}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-neutral-600">
                  <span>📍 {GYM.address}</span>
                  <span>📱 {GYM.phone}</span>
                  <span>✉ {GYM.email}</span>
                </div>
              </div>
            </div>
            <div className="text-right text-[10.5px] text-neutral-500 shrink-0">
              <div className="inline-block rounded-md bg-orange-500 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                Plan de entrenamiento
              </div>
              <div className="mt-2 text-neutral-700 font-medium">
                Folio: {w.id.slice(-8).toUpperCase()}
              </div>
              <div className="mt-0.5">Emitido: {createdAt}</div>
              <div className="mt-0.5 text-neutral-400">{GYM.web}</div>
            </div>
          </div>
        </header>

        {/* Client card */}
        <section className="mt-6 grid grid-cols-2 gap-4 text-[12.5px]">
          <InfoBlock label="Cliente" value={clientName} />
          {w.client?.phone && (
            <InfoBlock label="Teléfono" value={w.client.phone} />
          )}
          {w.client?.email && (
            <InfoBlock label="Email" value={w.client.email} />
          )}
          <InfoBlock label="Coach" value={coachName} />
          {w.client?.profile?.mainGoal && (
            <InfoBlock
              label="Objetivo"
              value={labelGoal(w.client.profile.mainGoal)}
            />
          )}
          {w.client?.profile?.experienceLevel && (
            <InfoBlock
              label="Nivel"
              value={labelLevel(w.client.profile.experienceLevel)}
            />
          )}
          {w.client?.profile?.daysPerWeek && (
            <InfoBlock
              label="Frecuencia"
              value={`${w.client.profile.daysPerWeek} días/semana`}
            />
          )}
          {w.client?.profile?.minutesPerSession && (
            <InfoBlock
              label="Duración objetivo"
              value={`${w.client.profile.minutesPerSession} min/sesión`}
            />
          )}
          {w.client?.profile?.heightCm && w.client.profile.initialWeight && (
            <InfoBlock
              label="Antropometría"
              value={`${w.client.profile.heightCm} cm · ${w.client.profile.initialWeight} kg`}
            />
          )}
        </section>

        {/* Title */}
        <div className="mt-8 mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {w.name}
          </h1>
          {w.description && (
            <p className="text-[13px] text-neutral-600 mt-1 leading-relaxed">
              {w.description}
            </p>
          )}
        </div>

        {/* Health alerts from profile */}
        {(w.client?.profile?.injuries ||
          w.client?.profile?.medicalConditions) && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-[11.5px] text-amber-900 leading-relaxed">
            <div className="font-semibold uppercase text-[10px] tracking-wider text-amber-700 mb-1">
              Considerar
            </div>
            {w.client.profile.injuries && (
              <div>
                <span className="font-semibold">Lesiones:</span>{" "}
                {w.client.profile.injuries}
              </div>
            )}
            {w.client.profile.medicalConditions && (
              <div>
                <span className="font-semibold">Condiciones:</span>{" "}
                {w.client.profile.medicalConditions}
              </div>
            )}
          </div>
        )}

        {/* Days */}
        <div className="space-y-5">
          {w.days.map((day) => (
            <section
              key={day.id}
              className="pdf-day rounded-xl border border-neutral-200 overflow-hidden"
            >
              <div className="bg-neutral-900 text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {day.dayNumber}
                  </div>
                  <div className="text-sm font-semibold tracking-tight">
                    {day.name}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400">
                  {day.exercises.length} ejercicios
                </div>
              </div>
              {day.notes && (
                <div className="px-4 py-2 bg-neutral-50 text-[11.5px] text-neutral-600 italic border-b border-neutral-200">
                  {day.notes}
                </div>
              )}
              <table className="w-full text-[11.5px]">
                <thead className="bg-neutral-100 text-neutral-500">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium tracking-wide uppercase text-[9.5px]">
                      #
                    </th>
                    <th className="text-left px-3 py-2 font-medium tracking-wide uppercase text-[9.5px]">
                      Ejercicio
                    </th>
                    <th className="text-center px-2 py-2 font-medium tracking-wide uppercase text-[9.5px]">
                      Sets
                    </th>
                    <th className="text-center px-2 py-2 font-medium tracking-wide uppercase text-[9.5px]">
                      Reps
                    </th>
                    <th className="text-center px-2 py-2 font-medium tracking-wide uppercase text-[9.5px]">
                      Peso
                    </th>
                    <th className="text-center px-2 py-2 font-medium tracking-wide uppercase text-[9.5px]">
                      Descanso
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((e, idx) => (
                    <tr
                      key={e.id}
                      className="border-t border-neutral-100 align-top"
                    >
                      <td className="px-3 py-2 text-neutral-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-neutral-900">
                          {e.exercise.name}
                        </div>
                        {e.exercise.muscleGroup && (
                          <div className="text-[10px] uppercase tracking-wider text-neutral-500 mt-0.5">
                            {labelMuscle(e.exercise.muscleGroup)}
                          </div>
                        )}
                        {e.notes && (
                          <div className="text-[10.5px] text-neutral-600 italic mt-1">
                            {e.notes}
                          </div>
                        )}
                      </td>
                      <td className="text-center px-2 py-2 font-medium">
                        {e.sets}
                      </td>
                      <td className="text-center px-2 py-2 font-medium">
                        {e.reps}
                      </td>
                      <td className="text-center px-2 py-2">
                        {e.weight ? `${e.weight} kg` : "—"}
                      </td>
                      <td className="text-center px-2 py-2 text-neutral-500">
                        {e.restSeconds ? `${e.restSeconds}s` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>

        {/* Footer profesional con datos del gym */}
        <footer className="mt-10 pt-5 border-t-2 border-neutral-900">
          <div className="grid grid-cols-3 gap-4 text-[10px] text-neutral-600">
            <div>
              <div className="font-bold uppercase tracking-widest text-neutral-900 text-[9px] mb-1.5">
                {GYM.name}
              </div>
              <div className="text-neutral-500 leading-snug">{GYM.tagline}</div>
            </div>
            <div>
              <div className="font-bold uppercase tracking-widest text-neutral-900 text-[9px] mb-1.5">
                Contacto
              </div>
              <div>WhatsApp: {GYM.whatsapp}</div>
              <div>{GYM.email}</div>
              <div>{GYM.web}</div>
            </div>
            <div className="text-right">
              <div className="font-bold uppercase tracking-widest text-neutral-900 text-[9px] mb-1.5">
                Ubicación
              </div>
              <div>{GYM.address}</div>
              <div className="mt-1 text-neutral-400">
                Coach: {coachName}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[9px] text-neutral-400 uppercase tracking-widest">
            <span>© {new Date().getFullYear()} {GYM.name}</span>
            <span>Documento confidencial — exclusivo para {clientName}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-[9.5px] uppercase tracking-wider text-neutral-500 font-medium">
        {label}
      </div>
      <div className="text-[12.5px] font-semibold text-neutral-900 mt-0.5">
        {value}
      </div>
    </div>
  );
}

function labelGoal(g: string) {
  const map: Record<string, string> = {
    lose_fat: "Bajar grasa / peso",
    gain_muscle: "Ganar masa muscular",
    tone: "Tonificar",
    maintain: "Mantener",
    performance: "Rendimiento",
    health: "Salud general",
  };
  return map[g] ?? g;
}
function labelLevel(l: string) {
  const map: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  };
  return map[l] ?? l;
}
function labelMuscle(m: string) {
  const map: Record<string, string> = {
    chest: "Pecho",
    back: "Espalda",
    legs: "Pierna",
    shoulders: "Hombro",
    arms: "Brazo",
    core: "Core",
    full_body: "Full body",
    cardio: "Cardio",
  };
  return map[m] ?? m;
}
