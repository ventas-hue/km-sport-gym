import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PagoExito() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md text-center space-y-4">
        <CheckCircle className="mx-auto text-emerald-400" size={56} />
        <h1 className="text-2xl font-semibold tracking-tight">¡Pago aprobado!</h1>
        <p className="text-white/60">
          Tu membresía está activa. Nos vemos en el gym 💪
        </p>
        <Link
          href="/miembro"
          className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-orange-500 text-white font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
