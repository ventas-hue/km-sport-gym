import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.package.upsert({
    where: { id: "pkg-mensual" },
    update: {},
    create: {
      id: "pkg-mensual",
      name: "Mensual Basico",
      description: "Acceso al gimnasio por 30 dias",
      price: 300.0,
      durationDays: 30,
    },
  });

  await prisma.package.upsert({
    where: { id: "pkg-mensual-premium" },
    update: {},
    create: {
      id: "pkg-mensual-premium",
      name: "Mensual Premium",
      description: "Acceso completo al gimnasio y clases por 30 dias",
      price: 400.0,
      durationDays: 30,
    },
  });

  await prisma.package.upsert({
    where: { id: "pkg-trimestral" },
    update: {},
    create: {
      id: "pkg-trimestral",
      name: "Trimestral",
      description: "Acceso al gimnasio por 90 dias",
      price: 800.0,
      durationDays: 90,
    },
  });

  await prisma.package.upsert({
    where: { id: "pkg-semestral" },
    update: {},
    create: {
      id: "pkg-semestral",
      name: "Semestral",
      description: "Acceso al gimnasio por 180 dias",
      price: 1500.0,
      durationDays: 180,
    },
  });

  await prisma.package.upsert({
    where: { id: "pkg-anual" },
    update: {},
    create: {
      id: "pkg-anual",
      name: "Anual",
      description: "Acceso al gimnasio por 365 dias",
      price: 2800.0,
      durationDays: 365,
    },
  });

  await prisma.product.upsert({
    where: { id: "prod-agua" },
    update: {},
    create: {
      id: "prod-agua",
      name: "Agua 600ml",
      description: "Agua natural",
      price: 15.0,
      stock: 50,
      category: "bebidas",
    },
  });

  await prisma.product.upsert({
    where: { id: "prod-proteina" },
    update: {},
    create: {
      id: "prod-proteina",
      name: "Proteina Whey (servicio)",
      description: "Batido de proteina whey",
      price: 45.0,
      stock: 30,
      category: "suplementos",
    },
  });

  await prisma.product.upsert({
    where: { id: "prod-bebida-deportiva" },
    update: {},
    create: {
      id: "prod-bebida-deportiva",
      name: "Bebida Deportiva",
      description: "Bebida isotonica",
      price: 25.0,
      stock: 40,
      category: "bebidas",
    },
  });

  await prisma.product.upsert({
    where: { id: "prod-barra-proteina" },
    update: {},
    create: {
      id: "prod-barra-proteina",
      name: "Barra de Proteina",
      description: "Barra energetica con proteina",
      price: 35.0,
      stock: 25,
      category: "suplementos",
    },
  });

  // Exercise library - basic foundation
  const exercises = [
    // Chest
    { name: "Press de banca con barra", muscleGroup: "chest", equipment: "barbell" },
    { name: "Press inclinado con mancuernas", muscleGroup: "chest", equipment: "dumbbell" },
    { name: "Aperturas con mancuernas", muscleGroup: "chest", equipment: "dumbbell" },
    { name: "Fondos en paralelas", muscleGroup: "chest", equipment: "bodyweight" },
    { name: "Press en maquina", muscleGroup: "chest", equipment: "machine" },
    // Back
    { name: "Dominadas", muscleGroup: "back", equipment: "bodyweight" },
    { name: "Remo con barra", muscleGroup: "back", equipment: "barbell" },
    { name: "Jalon al pecho", muscleGroup: "back", equipment: "machine" },
    { name: "Remo en polea baja", muscleGroup: "back", equipment: "machine" },
    { name: "Peso muerto", muscleGroup: "back", equipment: "barbell" },
    // Legs
    { name: "Sentadilla con barra", muscleGroup: "legs", equipment: "barbell" },
    { name: "Prensa", muscleGroup: "legs", equipment: "machine" },
    { name: "Extension de cuadriceps", muscleGroup: "legs", equipment: "machine" },
    { name: "Curl femoral", muscleGroup: "legs", equipment: "machine" },
    { name: "Hip thrust", muscleGroup: "legs", equipment: "barbell" },
    { name: "Zancadas con mancuernas", muscleGroup: "legs", equipment: "dumbbell" },
    { name: "Sentadilla bulgara", muscleGroup: "legs", equipment: "dumbbell" },
    { name: "Elevacion de gemelos", muscleGroup: "legs", equipment: "machine" },
    // Shoulders
    { name: "Press militar", muscleGroup: "shoulders", equipment: "barbell" },
    { name: "Press Arnold", muscleGroup: "shoulders", equipment: "dumbbell" },
    { name: "Elevaciones laterales", muscleGroup: "shoulders", equipment: "dumbbell" },
    { name: "Pajaros", muscleGroup: "shoulders", equipment: "dumbbell" },
    { name: "Face pulls", muscleGroup: "shoulders", equipment: "machine" },
    // Arms
    { name: "Curl de biceps con barra", muscleGroup: "arms", equipment: "barbell" },
    { name: "Curl con mancuernas alterno", muscleGroup: "arms", equipment: "dumbbell" },
    { name: "Curl martillo", muscleGroup: "arms", equipment: "dumbbell" },
    { name: "Extension de triceps polea", muscleGroup: "arms", equipment: "machine" },
    { name: "Fondos de triceps", muscleGroup: "arms", equipment: "bodyweight" },
    { name: "Press frances", muscleGroup: "arms", equipment: "barbell" },
    // Core
    { name: "Plancha", muscleGroup: "core", equipment: "bodyweight" },
    { name: "Abdominales en polea", muscleGroup: "core", equipment: "machine" },
    { name: "Elevaciones de piernas colgado", muscleGroup: "core", equipment: "bodyweight" },
    { name: "Russian twist", muscleGroup: "core", equipment: "bodyweight" },
    { name: "Ab wheel", muscleGroup: "core", equipment: "other" },
    // Cardio
    { name: "Caminadora", muscleGroup: "cardio", equipment: "machine" },
    { name: "Bicicleta", muscleGroup: "cardio", equipment: "machine" },
    { name: "Eliptica", muscleGroup: "cardio", equipment: "machine" },
    { name: "Escaladora", muscleGroup: "cardio", equipment: "machine" },
    { name: "Cuerda para saltar", muscleGroup: "cardio", equipment: "other" },
  ];

  for (const ex of exercises) {
    await prisma.exercise.upsert({
      where: { id: `ex-${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: {},
      create: {
        id: `ex-${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ...ex,
      },
    });
  }

  console.log("Seed completado exitosamente");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
