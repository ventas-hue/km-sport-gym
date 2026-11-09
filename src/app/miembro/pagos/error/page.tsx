import { XCircle } from "lucide-react";
import Link from "next/link";

export default function PagoError() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md text-center space-y-4">
        <XCircle className="mx-auto text-red-400" size={56} />
        <h1 className="text-2xl font-semibold tracking-tight">Pago no completado</h1>
        <p className="text-white/60">
          No se pudo procesar. Intenta de nuevo o usa otro método de pago.
        </p>
        <Link
          href="/miembro/pagos"
          className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-orange-500 text-white font-medium"
        >
          Intentar de nuevo
        </Link>
      </div>
    </div>
  );
}
