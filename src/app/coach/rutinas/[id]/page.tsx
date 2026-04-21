"use client";

import { use } from "react";
import RoutineEditor from "@/components/RoutineEditor";

export default function CoachRoutineEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <RoutineEditor workoutId={id} backHref="/coach/rutinas" />;
}
