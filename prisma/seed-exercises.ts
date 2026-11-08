import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedExercise = {
  name: string;
  muscleGroup:
    | "chest"
    | "back"
    | "legs"
    | "shoulders"
    | "arms"
    | "core"
    | "full_body"
    | "cardio";
  equipment:
    | "barbell"
    | "dumbbell"
    | "machine"
    | "cable"
    | "bodyweight"
    | "band"
    | "kettlebell"
    | "other";
  description?: string;
  instructions?: string;
};

const EXERCISES: SeedExercise[] = [
  // ============================================================
  // PECHO (chest) — 12
  // ============================================================
  { name: "Press de banca con barra", muscleGroup: "chest", equipment: "barbell",
    description: "Ejercicio compuesto principal para pecho.",
    instructions: "Acuéstate en banco plano, baja la barra al pecho controlado y empuja hasta extender los brazos sin bloquear codos." },
  { name: "Press de banca con mancuernas", muscleGroup: "chest", equipment: "dumbbell",
    description: "Permite mayor rango de movimiento que la barra.",
    instructions: "Siéntate con mancuernas en muslos, acuéstate llevándolas a los lados del pecho y empuja arriba." },
  { name: "Press inclinado con barra", muscleGroup: "chest", equipment: "barbell",
    description: "Enfoca la parte superior del pectoral.",
    instructions: "Banco inclinado 30–45°, baja barra al pecho alto y presiona." },
  { name: "Press inclinado con mancuernas", muscleGroup: "chest", equipment: "dumbbell",
    description: "Pecho superior con mayor amplitud.",
    instructions: "Banco inclinado 30°, mancuernas al nivel del pecho, presiona verticalmente." },
  { name: "Press declinado con barra", muscleGroup: "chest", equipment: "barbell",
    description: "Trabaja la parte inferior del pectoral.",
    instructions: "Banco declinado, baja barra al pecho bajo y presiona." },
  { name: "Aperturas con mancuernas", muscleGroup: "chest", equipment: "dumbbell",
    description: "Ejercicio de aislamiento para pecho.",
    instructions: "Acostado, brazos semi-flexionados, abre en arco y cierra sintiendo el pectoral." },
  { name: "Aperturas inclinadas con mancuernas", muscleGroup: "chest", equipment: "dumbbell",
    description: "Aislamiento de pecho superior.",
    instructions: "Banco inclinado, brazos semi-flexionados, abre y cierra controladamente." },
  { name: "Cruce en polea (cable crossover)", muscleGroup: "chest", equipment: "cable",
    description: "Tensión constante en el pectoral.",
    instructions: "De pie entre poleas, trae los cables al frente cruzando ligeramente." },
  { name: "Fondos en paralelas", muscleGroup: "chest", equipment: "bodyweight",
    description: "Compuesto con peso corporal.",
    instructions: "Incline el torso hacia adelante para enfatizar pecho, baja hasta sentir estiramiento." },
  { name: "Press en máquina de pecho", muscleGroup: "chest", equipment: "machine",
    description: "Opción segura para principiantes.",
    instructions: "Siéntate, ajusta el asiento al pecho, presiona hacia el frente." },
  { name: "Pullover con mancuerna", muscleGroup: "chest", equipment: "dumbbell",
    description: "Trabaja pectoral y serratos.",
    instructions: "Acostado atravesado en banco, baja mancuerna detrás de la cabeza y sube." },
  { name: "Flexiones (push-ups)", muscleGroup: "chest", equipment: "bodyweight",
    description: "Peso corporal, cero equipo.",
    instructions: "Cuerpo recto, baja hasta el pecho casi tocar el piso y empuja." },

  // ============================================================
  // ESPALDA (back) — 14
  // ============================================================
  { name: "Dominadas pronas", muscleGroup: "back", equipment: "bodyweight",
    description: "El rey para espalda.",
    instructions: "Agarre prono, sube hasta que la barbilla pase la barra." },
  { name: "Dominadas asistidas en máquina", muscleGroup: "back", equipment: "machine",
    description: "Para quienes aún no logran dominadas libres.",
    instructions: "Apoya rodillas en la plataforma y realiza dominadas." },
  { name: "Jalón al pecho (agarre amplio)", muscleGroup: "back", equipment: "cable",
    description: "Dorsales con agarre abierto.",
    instructions: "Siéntate, jala la barra al pecho alto con codos abiertos." },
  { name: "Jalón al pecho (agarre neutro)", muscleGroup: "back", equipment: "cable",
    description: "Más énfasis en dorsal bajo.",
    instructions: "Agarre neutro, jala barra a la clavícula." },
  { name: "Jalón al pecho (agarre cerrado)", muscleGroup: "back", equipment: "cable",
    description: "Mayor activación de bíceps y espalda baja.",
    instructions: "Agarre cerrado supino, jala al pecho." },
  { name: "Remo con barra inclinado", muscleGroup: "back", equipment: "barbell",
    description: "Compuesto para toda la espalda.",
    instructions: "Torso 45°, jala la barra al abdomen con codos pegados." },
  { name: "Remo con mancuerna a una mano", muscleGroup: "back", equipment: "dumbbell",
    description: "Unilateral, corrige asimetrías.",
    instructions: "Apoya rodilla y mano en banco, jala mancuerna hacia la cadera." },
  { name: "Remo sentado en polea", muscleGroup: "back", equipment: "cable",
    description: "Trabajo de media espalda.",
    instructions: "Sentado, tira del agarre al abdomen manteniendo el pecho alto." },
  { name: "Remo en máquina", muscleGroup: "back", equipment: "machine",
    description: "Opción estable para principiantes.",
    instructions: "Siéntate y jala las manijas pegando los omóplatos." },
  { name: "Remo T-bar", muscleGroup: "back", equipment: "barbell",
    description: "Grosor de espalda.",
    instructions: "De pie sobre la barra, torso inclinado, jala al pecho bajo." },
  { name: "Face pulls", muscleGroup: "back", equipment: "cable",
    description: "Hombros posteriores y romboides.",
    instructions: "Polea a la altura de la cara, tira hacia la frente con codos altos." },
  { name: "Peso muerto convencional", muscleGroup: "back", equipment: "barbell",
    description: "El compuesto por excelencia.",
    instructions: "Pies al ancho de caderas, espalda neutra, levanta extendiendo caderas y rodillas." },
  { name: "Peso muerto rumano", muscleGroup: "back", equipment: "barbell",
    description: "Enfoca femorales y glúteo.",
    instructions: "Rodillas suaves, baja barra pegada al cuerpo flexionando caderas." },
  { name: "Hiperextensiones (good mornings)", muscleGroup: "back", equipment: "bodyweight",
    description: "Lumbares y glúteos.",
    instructions: "Banco de hiperextensión, flexiona cadera y sube controlado." },

  // ============================================================
  // PIERNA (legs) — 18
  // ============================================================
  { name: "Sentadilla trasera con barra", muscleGroup: "legs", equipment: "barbell",
    description: "El rey de la pierna.",
    instructions: "Barra en trapecios, baja hasta que caderas pasen rodillas y sube." },
  { name: "Sentadilla frontal con barra", muscleGroup: "legs", equipment: "barbell",
    description: "Más énfasis en cuádriceps y core.",
    instructions: "Barra apoyada en hombros frontales, baja y sube manteniendo torso vertical." },
  { name: "Sentadilla goblet", muscleGroup: "legs", equipment: "dumbbell",
    description: "Ideal para principiantes.",
    instructions: "Sostén mancuerna/kettlebell al pecho, baja en sentadilla profunda." },
  { name: "Sentadilla búlgara", muscleGroup: "legs", equipment: "dumbbell",
    description: "Unilateral, muy efectiva.",
    instructions: "Pie trasero en banco, baja flexionando pierna delantera." },
  { name: "Prensa de pierna 45°", muscleGroup: "legs", equipment: "machine",
    description: "Alta carga con menos exigencia técnica.",
    instructions: "Pies al ancho de hombros, baja hasta 90° y empuja." },
  { name: "Hack squat", muscleGroup: "legs", equipment: "machine",
    description: "Cuádriceps con espalda apoyada.",
    instructions: "Apoya espalda en la máquina, baja flexionando rodillas y empuja." },
  { name: "Zancadas (lunges)", muscleGroup: "legs", equipment: "dumbbell",
    description: "Trabaja pierna y glúteo.",
    instructions: "Da un paso adelante y baja la rodilla trasera cerca del piso." },
  { name: "Zancadas caminando", muscleGroup: "legs", equipment: "dumbbell",
    description: "Dinámico, pierna completa.",
    instructions: "Avanza alternando pierna manteniendo torso erguido." },
  { name: "Peso muerto rumano con mancuernas", muscleGroup: "legs", equipment: "dumbbell",
    description: "Isquios y glúteo.",
    instructions: "Rodillas suaves, baja mancuernas pegadas a las piernas." },
  { name: "Peso muerto sumo", muscleGroup: "legs", equipment: "barbell",
    description: "Más énfasis en aductores y glúteo.",
    instructions: "Pies muy abiertos, agarre entre piernas, levanta." },
  { name: "Peso muerto a una pierna", muscleGroup: "legs", equipment: "dumbbell",
    description: "Equilibrio y glúteo unilateral.",
    instructions: "Una pierna de apoyo, flexiona cadera llevando la otra atrás." },
  { name: "Curl femoral acostado", muscleGroup: "legs", equipment: "machine",
    description: "Aislamiento de isquios.",
    instructions: "Acostado boca abajo, flexiona rodillas llevando pies a glúteos." },
  { name: "Curl femoral sentado", muscleGroup: "legs", equipment: "machine",
    description: "Variante sentada de isquios.",
    instructions: "Sentado, flexiona rodillas hacia abajo controladamente." },
  { name: "Extensión de cuádriceps", muscleGroup: "legs", equipment: "machine",
    description: "Aislamiento de cuádriceps.",
    instructions: "Sentado, extiende rodillas hasta arriba, aprieta cuádriceps." },
  { name: "Elevación de talones de pie", muscleGroup: "legs", equipment: "machine",
    description: "Gemelos.",
    instructions: "De pie en máquina, sube sobre la punta de los pies." },
  { name: "Elevación de talones sentado", muscleGroup: "legs", equipment: "machine",
    description: "Sóleo.",
    instructions: "Sentado con peso en rodillas, sube los talones." },
  { name: "Hip thrust con barra", muscleGroup: "legs", equipment: "barbell",
    description: "El mejor para glúteos.",
    instructions: "Espalda apoyada en banco, barra en cadera, empuja arriba apretando glúteos." },
  { name: "Glute bridge", muscleGroup: "legs", equipment: "bodyweight",
    description: "Versión en suelo del hip thrust.",
    instructions: "Acostado, pies en piso, sube cadera apretando glúteos." },
  { name: "Abducción en máquina", muscleGroup: "legs", equipment: "machine",
    description: "Glúteo medio.",
    instructions: "Sentado, abre piernas contra la resistencia." },
  { name: "Aducción en máquina", muscleGroup: "legs", equipment: "machine",
    description: "Aductores internos.",
    instructions: "Sentado, cierra piernas contra la resistencia." },

  // ============================================================
  // HOMBROS (shoulders) — 12
  // ============================================================
  { name: "Press militar con barra", muscleGroup: "shoulders", equipment: "barbell",
    description: "Compuesto para hombro completo.",
    instructions: "De pie, barra a la clavícula, presiona arriba sin arquear la espalda." },
  { name: "Press militar con mancuernas", muscleGroup: "shoulders", equipment: "dumbbell",
    description: "Permite rango libre.",
    instructions: "Sentado o de pie, mancuernas a los hombros y presiona arriba." },
  { name: "Press Arnold", muscleGroup: "shoulders", equipment: "dumbbell",
    description: "Trabaja deltoide anterior y lateral.",
    instructions: "Palmas al frente abajo, rota mientras subes hasta terminar con palmas afuera." },
  { name: "Elevaciones laterales", muscleGroup: "shoulders", equipment: "dumbbell",
    description: "Aísla deltoide medio.",
    instructions: "De pie, eleva brazos a los lados hasta hombros, controla la bajada." },
  { name: "Elevaciones frontales", muscleGroup: "shoulders", equipment: "dumbbell",
    description: "Deltoide anterior.",
    instructions: "Eleva mancuerna al frente hasta altura de hombros." },
  { name: "Pájaros (rear delt fly)", muscleGroup: "shoulders", equipment: "dumbbell",
    description: "Deltoide posterior.",
    instructions: "Torso inclinado, abre los brazos en arco." },
  { name: "Encogimientos (shrugs)", muscleGroup: "shoulders", equipment: "dumbbell",
    description: "Trapecio superior.",
    instructions: "De pie con mancuernas, encoge hombros hacia las orejas." },
  { name: "Press en máquina de hombro", muscleGroup: "shoulders", equipment: "machine",
    description: "Opción estable.",
    instructions: "Siéntate y presiona las manijas hacia arriba." },
  { name: "Elevaciones laterales en polea", muscleGroup: "shoulders", equipment: "cable",
    description: "Tensión constante en deltoide medio.",
    instructions: "Polea baja, eleva un brazo al lado hasta hombro." },
  { name: "Upright row con barra", muscleGroup: "shoulders", equipment: "barbell",
    description: "Trapecio y deltoide.",
    instructions: "Barra al frente, sube los codos hasta altura del pecho." },
  { name: "Face pulls (hombro posterior)", muscleGroup: "shoulders", equipment: "cable",
    description: "Salud del hombro.",
    instructions: "Polea alta con cuerda, tira hacia la cara con codos arriba." },
  { name: "Y-raises con mancuerna", muscleGroup: "shoulders", equipment: "dumbbell",
    description: "Fortalece el manguito rotador.",
    instructions: "Inclinado, sube brazos en forma de Y con pulgares arriba." },

  // ============================================================
  // BRAZOS (arms) — 16
  // ============================================================
  { name: "Curl con barra", muscleGroup: "arms", equipment: "barbell",
    description: "Bíceps clásico.",
    instructions: "Codos pegados al cuerpo, sube la barra controlado." },
  { name: "Curl con mancuernas alterno", muscleGroup: "arms", equipment: "dumbbell",
    description: "Bíceps con rotación.",
    instructions: "Alterna brazos, rotando la muñeca al subir." },
  { name: "Curl martillo", muscleGroup: "arms", equipment: "dumbbell",
    description: "Bíceps braquial y antebrazo.",
    instructions: "Agarre neutro, sube sin rotar la muñeca." },
  { name: "Curl concentrado", muscleGroup: "arms", equipment: "dumbbell",
    description: "Pico del bíceps.",
    instructions: "Sentado, codo apoyado en muslo interno, sube la mancuerna." },
  { name: "Curl predicador (Scott)", muscleGroup: "arms", equipment: "barbell",
    description: "Elimina el impulso.",
    instructions: "Brazos apoyados en banco Scott, sube barra hasta el pecho." },
  { name: "Curl en polea", muscleGroup: "arms", equipment: "cable",
    description: "Tensión constante en bíceps.",
    instructions: "De pie, codos pegados al cuerpo, sube la barra." },
  { name: "Curl 21s", muscleGroup: "arms", equipment: "barbell",
    description: "7 medias abajo + 7 medias arriba + 7 completas.",
    instructions: "Divide el movimiento en 3 rangos de 7 reps cada uno." },
  { name: "Dominadas supinas (chin-ups)", muscleGroup: "arms", equipment: "bodyweight",
    description: "Bíceps y dorsal.",
    instructions: "Agarre supino, sube hasta que la barbilla pase la barra." },
  { name: "Press francés con barra EZ", muscleGroup: "arms", equipment: "barbell",
    description: "Tríceps clásico.",
    instructions: "Acostado, baja la barra a la frente y extiende codos." },
  { name: "Patada de tríceps", muscleGroup: "arms", equipment: "dumbbell",
    description: "Aislamiento de tríceps.",
    instructions: "Torso inclinado, brazo pegado al cuerpo, extiende el codo atrás." },
  { name: "Extensión de tríceps en polea (pushdown)", muscleGroup: "arms", equipment: "cable",
    description: "Tríceps lateral.",
    instructions: "De pie, codos pegados, empuja la barra hacia abajo." },
  { name: "Extensión de tríceps con cuerda", muscleGroup: "arms", equipment: "cable",
    description: "Variante con mayor contracción.",
    instructions: "Empuja la cuerda abriendo al final del movimiento." },
  { name: "Fondos en banco (triceps dips)", muscleGroup: "arms", equipment: "bodyweight",
    description: "Tríceps con peso corporal.",
    instructions: "Manos en banco detrás, baja flexionando codos." },
  { name: "Fondos en paralelas (tríceps)", muscleGroup: "arms", equipment: "bodyweight",
    description: "Compuesto para tríceps.",
    instructions: "Torso vertical, baja hasta 90° y empuja." },
  { name: "Extensión de tríceps sobre la cabeza", muscleGroup: "arms", equipment: "dumbbell",
    description: "Trabaja cabeza larga del tríceps.",
    instructions: "Sostén mancuerna arriba, baja detrás de la cabeza y sube." },
  { name: "Close-grip bench press", muscleGroup: "arms", equipment: "barbell",
    description: "Tríceps con peso pesado.",
    instructions: "Agarre cerrado al ancho de hombros, codos pegados al bajar." },

  // ============================================================
  // CORE (abs/core) — 12
  // ============================================================
  { name: "Plancha abdominal", muscleGroup: "core", equipment: "bodyweight",
    description: "Estabilidad y core profundo.",
    instructions: "Antebrazos y puntas de pies, cuerpo recto, mantén." },
  { name: "Plancha lateral", muscleGroup: "core", equipment: "bodyweight",
    description: "Oblicuos.",
    instructions: "Apoyo lateral en antebrazo, cadera arriba, mantén." },
  { name: "Crunches", muscleGroup: "core", equipment: "bodyweight",
    description: "Abdominal superior.",
    instructions: "Acostado, flexiona el tronco llevando pecho a rodillas." },
  { name: "Crunch inverso", muscleGroup: "core", equipment: "bodyweight",
    description: "Abdominal inferior.",
    instructions: "Acostado, lleva rodillas al pecho subiendo caderas." },
  { name: "Elevación de piernas colgado", muscleGroup: "core", equipment: "bodyweight",
    description: "Abdomen completo.",
    instructions: "Colgado de barra, eleva piernas controladamente." },
  { name: "Russian twists", muscleGroup: "core", equipment: "dumbbell",
    description: "Oblicuos.",
    instructions: "Sentado inclinado, rota torso tocando el suelo a cada lado." },
  { name: "Ab wheel rollout", muscleGroup: "core", equipment: "other",
    description: "Core extremo.",
    instructions: "Arrodillado, rueda la rueda adelante y regresa." },
  { name: "Dead bug", muscleGroup: "core", equipment: "bodyweight",
    description: "Estabilidad lumbar.",
    instructions: "Acostado, brazo y pierna opuestos bajan alternando." },
  { name: "Bird dog", muscleGroup: "core", equipment: "bodyweight",
    description: "Core y espalda baja.",
    instructions: "En cuatro apoyos, extiende brazo y pierna opuestos." },
  { name: "Mountain climbers", muscleGroup: "core", equipment: "bodyweight",
    description: "Core + cardio.",
    instructions: "En plancha alta, alterna rodillas al pecho rápido." },
  { name: "Hollow hold", muscleGroup: "core", equipment: "bodyweight",
    description: "Core profundo.",
    instructions: "Acostado, levanta piernas y hombros formando banana." },
  { name: "Cable crunch", muscleGroup: "core", equipment: "cable",
    description: "Abdominal con carga.",
    instructions: "De rodillas, cuerda detrás del cuello, flexiona tronco." },

  // ============================================================
  // CARDIO — 10
  // ============================================================
  { name: "Trote continuo", muscleGroup: "cardio", equipment: "other",
    description: "Cardio base aeróbico.",
    instructions: "Mantén un ritmo constante y respiración controlada." },
  { name: "Caminata inclinada en caminadora", muscleGroup: "cardio", equipment: "machine",
    description: "Baja impacto, alta exigencia.",
    instructions: "Inclinación 10–15%, velocidad moderada 5–6 km/h." },
  { name: "Bicicleta estática", muscleGroup: "cardio", equipment: "machine",
    description: "Cardio articulación-friendly.",
    instructions: "Ajusta asiento a la cadera, mantén cadencia constante." },
  { name: "Spinning (bici indoor)", muscleGroup: "cardio", equipment: "machine",
    description: "Alta intensidad.",
    instructions: "Varía carga y cadencia según rutina." },
  { name: "Elíptica", muscleGroup: "cardio", equipment: "machine",
    description: "Cuerpo completo bajo impacto.",
    instructions: "Usa brazos y piernas de forma coordinada." },
  { name: "Máquina de remo", muscleGroup: "cardio", equipment: "machine",
    description: "Cardio y fuerza.",
    instructions: "Empuja con piernas, luego jala con brazos." },
  { name: "Escaladora", muscleGroup: "cardio", equipment: "machine",
    description: "Cardio intenso para pierna.",
    instructions: "Paso completo, no te apoyes en los pasamanos." },
  { name: "Saltar la cuerda", muscleGroup: "cardio", equipment: "other",
    description: "Coordinación y cardio.",
    instructions: "Salta ligero sobre las puntas, muñecas hacen el giro." },
  { name: "Burpees", muscleGroup: "cardio", equipment: "bodyweight",
    description: "Cuerpo completo + cardio.",
    instructions: "Plancha, flexión, salta y aterriza en sentadilla, salta arriba." },
  { name: "Sprints", muscleGroup: "cardio", equipment: "other",
    description: "HIIT para quemar grasa.",
    instructions: "20–30s al máximo, descansa 60–90s, repite." },

  // ============================================================
  // FULL BODY / FUNCTIONAL — 8
  // ============================================================
  { name: "Thrusters (sentadilla + press)", muscleGroup: "full_body", equipment: "barbell",
    description: "Compuesto cuerpo entero.",
    instructions: "Sentadilla frontal y al subir empuja la barra arriba." },
  { name: "Clean and press", muscleGroup: "full_body", equipment: "barbell",
    description: "Potencia y coordinación.",
    instructions: "Cargada al pecho + press militar en un movimiento." },
  { name: "Snatch con mancuerna", muscleGroup: "full_body", equipment: "dumbbell",
    description: "Explosivo.",
    instructions: "Del piso directo a sobre la cabeza en un movimiento." },
  { name: "Turkish get-up", muscleGroup: "full_body", equipment: "kettlebell",
    description: "Estabilidad total.",
    instructions: "Desde acostado hasta de pie sosteniendo pesa sobre cabeza." },
  { name: "Kettlebell swing", muscleGroup: "full_body", equipment: "kettlebell",
    description: "Potencia de cadera.",
    instructions: "Impulso de cadera lleva la pesa hasta altura de pecho." },
  { name: "Farmer's walk (carga pesada)", muscleGroup: "full_body", equipment: "dumbbell",
    description: "Core, grip y cardio.",
    instructions: "Carga mancuernas pesadas y camina erguido." },
  { name: "Man makers", muscleGroup: "full_body", equipment: "dumbbell",
    description: "Burpee + remo + press.",
    instructions: "Burpee con mancuernas, remo en plancha, salta y press arriba." },
  { name: "Wall ball shots", muscleGroup: "full_body", equipment: "other",
    description: "CrossFit clásico.",
    instructions: "Sentadilla + lanza el balón a un punto alto en la pared." },
];

async function main() {
  let created = 0;
  let skipped = 0;
  for (const ex of EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { name: ex.name },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.exercise.create({ data: ex });
    created++;
  }
  console.log(
    `✔ Biblioteca de ejercicios: ${created} creados, ${skipped} ya existían (total en el seed: ${EXERCISES.length})`
  );
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
