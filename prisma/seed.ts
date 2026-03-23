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
