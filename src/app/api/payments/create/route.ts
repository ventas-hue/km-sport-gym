import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPreferenceClient, appUrl } from "@/lib/mercadopago";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const pref = getPreferenceClient();
  if (!pref) {
    return NextResponse.json(
      {
        error: "pagos no configurados",
        detail:
          "Falta MP_ACCESS_TOKEN en las variables de entorno. Agrégalo en Railway → servicio app → Variables.",
      },
      { status: 503 }
    );
  }

  const body = await request.json();
  const packageId = body.packageId as string | undefined;
  const clientId = body.clientId as string | undefined;
  if (!packageId || !clientId) {
    return NextResponse.json({ error: "packageId y clientId requeridos" }, { status: 400 });
  }

  const [pkg, client] = await Promise.all([
    prisma.package.findUnique({ where: { id: packageId } }),
    prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);
  if (!pkg || !client) {
    return NextResponse.json({ error: "paquete o cliente no encontrado" }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      clientId: client.id,
      provider: "mercadopago",
      amount: pkg.price,
      currency: "MXN",
      status: "pending",
      description: `Membresía ${pkg.name} - ${client.firstName} ${client.lastName}`,
      payerName: `${client.firstName} ${client.lastName}`,
      payerEmail: client.email ?? undefined,
      metadata: { packageId: pkg.id, durationDays: pkg.durationDays },
    },
  });

  const base = appUrl();
  try {
    const result = await pref.create({
      body: {
        items: [
          {
            id: pkg.id,
            title: `Membresía ${pkg.name}`,
            description: pkg.description ?? undefined,
            quantity: 1,
            currency_id: "MXN",
            unit_price: pkg.price,
          },
        ],
        payer: client.email
          ? { email: client.email, name: client.firstName, surname: client.lastName }
          : undefined,
        external_reference: payment.id,
        back_urls: {
          success: `${base}/miembro/pagos/exito`,
          failure: `${base}/miembro/pagos/error`,
          pending: `${base}/miembro/pagos/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${base}/api/payments/webhook`,
        metadata: { paymentRecordId: payment.id },
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { preferenceId: result.id, providerRef: result.id },
    });

    return NextResponse.json({
      paymentId: payment.id,
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (err) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "cancelled" },
    });
    const msg = err instanceof Error ? err.message : "error";
    return NextResponse.json(
      { error: "Mercado Pago rechazó la preferencia", detail: msg },
      { status: 500 }
    );
  }
}
