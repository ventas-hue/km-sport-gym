import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import CheckinButton from "./CheckinButton";

export const dynamic = "force-dynamic";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const client = await prisma.client.findUnique({
    where: { qrToken: token },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      memberships: {
        orderBy: { endDate: "desc" },
        take: 1,
        include: { package: true },
      },
    },
  });

  if (!client) notFound();

  const session = await getSession();
  const canCheckin = !!session && (session.role === "admin" || session.role === "coach");
  const membership = client.memberships[0];
  const now = new Date();
  const isActive = membership ? new Date(membership.endDate) >= now : false;

  const lastAttendance = await prisma.attendance.findFirst({
    where: { clientId: client.id },
    orderBy: { checkedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.png" alt="LM Sport Gym" width={44} height={44} className="h-11 w-11 object-contain" />
          <div>
            <div className="text-sm font-semibold tracking-tight">LM Sport Gym</div>
            <div className="text-[11px] uppercase tracking-widest text-orange-400">Check-in</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Miembro</div>
          <div className="text-2xl font-semibold tracking-tight">
            {client.firstName} {client.lastName}
          </div>
        </div>

        <div className={`rounded-2xl p-4 mb-6 border ${
          isActive
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
            : "border-red-500/30 bg-red-500/10 text-red-200"
        }`}>
          <div className="text-[11px] uppercase tracking-wider opacity-70 mb-1">Membresía</div>
          {membership ? (
            <>
              <div className="font-semibold">{membership.package.name}</div>
              <div className="text-sm opacity-80 mt-0.5">
                {isActive ? "Vigente" : "Vencida"} · hasta {new Date(membership.endDate).toLocaleDateString("es-MX")}
              </div>
            </>
          ) : (
            <div className="font-semibold">Sin membresía registrada</div>
          )}
        </div>

        {lastAttendance && (
          <div className="text-xs text-white/50 mb-6 flex items-center justify-between">
            <span>Último check-in</span>
            <span className="text-white/70">
              {new Date(lastAttendance.checkedAt).toLocaleString("es-MX", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
        )}

        {canCheckin ? (
          <CheckinButton token={token} clientName={`${client.firstName} ${client.lastName}`} />
        ) : (
          <div className="text-center text-sm text-white/60 space-y-3">
            <p>
              Para registrar entrada, un administrador o coach debe iniciar sesión.
            </p>
            <Link
              href={`/login?next=/checkin/${token}`}
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-orange-500 text-white text-sm font-medium"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        <p className="text-[10px] text-white/30 text-center mt-6 tracking-wide">
          LM Sport Gym · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
