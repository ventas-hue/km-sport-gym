import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { getAnthropicClient, AI_MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 300;

const NUTRITION_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    caloriesTarget: { type: "integer" },
    proteinG: { type: "number" },
    carbsG: { type: "number" },
    fatG: { type: "number" },
    waterLiters: { type: "number" },
    notes: { type: "string" },
    meals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          timeOfDay: { type: "string" },
          notes: { type: "string" },
          foods: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                grams: { type: "number" },
                calories: { type: "number" },
                proteinG: { type: "number" },
                carbsG: { type: "number" },
                fatG: { type: "number" },
              },
              required: ["name", "grams", "calories", "proteinG", "carbsG", "fatG"],
              additionalProperties: false,
            },
          },
        },
        required: ["name", "foods"],
        additionalProperties: false,
      },
    },
  },
  required: ["name", "caloriesTarget", "proteinG", "carbsG", "fatG", "waterLiters", "meals"],
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

  const profile = await prisma.clientProfile.findUnique({
    where: { clientId },
    include: { client: { select: { firstName: true, lastName: true } } },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "El cliente no tiene ficha fitness" },
      { status: 400 }
    );
  }

  const clientBrief = [
    `Nombre: ${profile.client.firstName} ${profile.client.lastName}`,
    profile.gender && `Sexo: ${profile.gender}`,
    profile.age && `Edad: ${profile.age}`,
    profile.heightCm && `Estatura: ${profile.heightCm} cm`,
    profile.initialWeight && `Peso actual: ${profile.initialWeight} kg`,
    profile.targetWeight && `Peso meta: ${profile.targetWeight} kg`,
    profile.mainGoal && `Objetivo: ${profile.mainGoal}`,
    profile.activityLevel && `Actividad: ${profile.activityLevel}`,
    profile.daysPerWeek && `Entrenamientos/semana: ${profile.daysPerWeek}`,
    profile.diet && `Tipo de dieta: ${profile.diet}`,
    profile.allergies && `Alergias: ${profile.allergies}`,
    profile.intolerances && `Intolerancias: ${profile.intolerances}`,
    profile.foodsDisliked && `No le gustan: ${profile.foodsDisliked}`,
    profile.foodsPreferred && `Le gustan: ${profile.foodsPreferred}`,
    profile.mealsPerDay && `Comidas/día: ${profile.mealsPerDay}`,
    profile.waterLitersPerDay && `Agua/día actual: ${profile.waterLitersPerDay} L`,
    profile.budgetPerWeek && `Presupuesto semanal: ${profile.budgetPerWeek} MXN`,
    profile.cookingSkill && `Habilidad cocina: ${profile.cookingSkill}`,
    profile.sleepHours && `Sueño: ${profile.sleepHours} h`,
    profile.stressLevel && `Estrés: ${profile.stressLevel}/10`,
    profile.jobActivity && `Trabajo: ${profile.jobActivity}`,
    profile.medicalConditions && `Condiciones médicas: ${profile.medicalConditions}`,
    profile.pregnantOrBreastfeed && "Embarazo/lactancia: sí",
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `Eres Karla Lizeth Merlos, coach fitness y asesora nutricional.
Diseñas planes de alimentación realistas, culturalmente mexicanos, dentro del presupuesto,
y respetando alergias, intolerancias y gustos.

Reglas estrictas:
1. Respeta alergias e intolerancias SIN excepciones.
2. No incluyas alimentos que el cliente marcó como "no le gustan".
3. Prioriza los alimentos que el cliente marcó como "le gustan".
4. Ajusta calorías y macros al objetivo:
   - Bajar grasa: déficit 10-20% de mantenimiento
   - Ganar músculo: superávit 5-15%
   - Mantener/salud: mantenimiento
5. Proteína: 1.6-2.2 g/kg para activos; 1.2-1.5 g/kg sedentarios.
6. Usa alimentos comunes en supermercados mexicanos; nombres en español.
7. Respeta número de comidas por día del cliente.
8. Devuelve estrictamente el JSON del schema, sin texto extra.`;

  const userPrompt = `Diseña un plan nutricional para este miembro de LM Sport Gym:

${clientBrief}

${extraInstructions ? `Notas adicionales de la coach: ${extraInstructions}\n` : ""}

Devuelve el JSON con el plan completo (comidas, alimentos, gramos y macros).`;

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      output_config: {
        format: { type: "json_schema", schema: NUTRITION_SCHEMA },
      },
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "La IA no devolvió texto" }, { status: 500 });
    }
    const parsed = JSON.parse(textBlock.text);

    return NextResponse.json({ ...parsed, usage: message.usage });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "error";
    return NextResponse.json(
      { error: "Error al generar plan nutricional", detail: msg },
      { status: 500 }
    );
  }
}
