import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { getAnthropicClient, AI_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

const ROUTINE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dayNumber: { type: "integer" },
          name: { type: "string" },
          notes: { type: "string" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                exerciseName: { type: "string" },
                sets: { type: "integer" },
                reps: { type: "string" },
                restSeconds: { type: "integer" },
                notes: { type: "string" },
              },
              required: ["exerciseName", "sets", "reps", "restSeconds"],
              additionalProperties: false,
            },
          },
        },
        required: ["dayNumber", "name", "exercises"],
        additionalProperties: false,
      },
    },
  },
  required: ["name", "description", "days"],
  additionalProperties: false,
};

export async function POST(request: NextRequest) {
  try {
    await requireSession(["admin", "coach"]);
  } catch (e) {
    return e as Response;
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json(
      {
        error: "IA no configurada",
        detail:
          "Falta ANTHROPIC_API_KEY en las variables de entorno. Agrégala en Railway → servicio app → Variables.",
      },
      { status: 503 }
    );
  }

  const body = await request.json();
  const clientId = body.clientId as string | undefined;
  const extraInstructions = (body.instructions as string | undefined) ?? "";
  if (!clientId) {
    return NextResponse.json({ error: "clientId requerido" }, { status: 400 });
  }

  const [profile, exercises] = await Promise.all([
    prisma.clientProfile.findUnique({
      where: { clientId },
      include: { client: { select: { firstName: true, lastName: true } } },
    }),
    prisma.exercise.findMany({
      select: { id: true, name: true, muscleGroup: true, equipment: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!profile) {
    return NextResponse.json(
      { error: "El cliente no tiene ficha fitness" },
      { status: 400 }
    );
  }

  const exerciseList = exercises
    .map((e) => `- ${e.name} (${e.muscleGroup}, ${e.equipment ?? "n/a"})`)
    .join("\n");

  const clientBrief = [
    `Nombre: ${profile.client.firstName} ${profile.client.lastName}`,
    profile.gender && `Sexo: ${profile.gender}`,
    profile.age && `Edad: ${profile.age}`,
    profile.heightCm && `Estatura: ${profile.heightCm} cm`,
    profile.initialWeight && `Peso actual: ${profile.initialWeight} kg`,
    profile.targetWeight && `Peso meta: ${profile.targetWeight} kg`,
    profile.mainGoal && `Objetivo: ${profile.mainGoal}`,
    profile.experienceLevel && `Nivel: ${profile.experienceLevel}`,
    profile.activityLevel && `Actividad actual: ${profile.activityLevel}`,
    profile.daysPerWeek && `Días disponibles: ${profile.daysPerWeek}`,
    profile.minutesPerSession && `Minutos por sesión: ${profile.minutesPerSession}`,
    profile.trainsAt && `Dónde entrena: ${profile.trainsAt}`,
    profile.equipmentAvailable && `Equipo disponible: ${profile.equipmentAvailable}`,
    profile.injuries && `Lesiones: ${profile.injuries}`,
    profile.medicalConditions && `Condiciones médicas: ${profile.medicalConditions}`,
    profile.pregnantOrBreastfeed && "Embarazo/lactancia: sí",
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `Eres Karla Lizeth Merlos, coach fitness certificada y atleta FMFF. Diseñas rutinas de entrenamiento de alta calidad, seguras, progresivas y adaptadas al cliente.

Reglas estrictas:
1. Usa SOLO ejercicios de la biblioteca proporcionada. Escribe el nombre EXACTAMENTE como aparece en la lista.
2. Respeta lesiones, condiciones médicas y equipo disponible.
3. Número de días = días disponibles del cliente.
4. Cada día entre 5-8 ejercicios, agrupados por lógica (empuje, tirón, pierna, etc.) según nivel.
5. Progresión realista. Principiantes: menos volumen, descansos más largos, rangos de reps 10-15.
6. Incluye notas prácticas en ejercicios con técnica difícil.
7. Devuelve estrictamente el JSON del schema, sin texto extra.`;

  const userPrompt = `Diseña una rutina semanal para este miembro de LM Sport Gym:

${clientBrief}

${extraInstructions ? `Notas adicionales de la coach: ${extraInstructions}\n` : ""}

Biblioteca de ejercicios disponibles (usa SOLO nombres de esta lista):
${exerciseList}

Devuelve el JSON con la rutina completa.`;

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      output_config: {
        format: { type: "json_schema", schema: ROUTINE_SCHEMA },
      },
      messages: [{ role: "user", content: userPrompt }],
    });

    // Extrae el JSON del primer bloque de texto
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "La IA no devolvió texto" },
        { status: 500 }
      );
    }
    const parsed = JSON.parse(textBlock.text);

    // Resolver exerciseName → exerciseId
    const exByName = new Map(exercises.map((e) => [e.name.toLowerCase(), e.id]));
    type AiDay = {
      dayNumber: number;
      name: string;
      notes?: string;
      exercises: Array<{
        exerciseName: string;
        sets: number;
        reps: string;
        restSeconds: number;
        notes?: string;
      }>;
    };
    const days = (parsed.days as AiDay[]).map((d) => ({
      dayNumber: d.dayNumber,
      name: d.name,
      notes: d.notes ?? "",
      exercises: d.exercises
        .map((e, idx) => {
          const id = exByName.get(e.exerciseName.toLowerCase());
          return id
            ? {
                exerciseId: id,
                sets: e.sets,
                reps: e.reps,
                restSeconds: e.restSeconds,
                notes: e.notes ?? "",
                order: idx,
              }
            : null;
        })
        .filter((v): v is NonNullable<typeof v> => v !== null),
    }));

    return NextResponse.json({
      name: parsed.name,
      description: parsed.description,
      days,
      usage: message.usage,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    return NextResponse.json(
      { error: "Error al generar rutina", detail: msg },
      { status: 500 }
    );
  }
}
