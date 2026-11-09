import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentClient } from "@/lib/mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook de Mercado Pago. MP envía notificaciones tipo:
 *   { type: "payment", data: { id: "123456" }, ... }
 * Consultamos el pago y actualizamos nuestro Payment + Membership.
 */
export async function POST(request: NextRequest) {
  const paymentClient = getPaymentClient();
  if (!paymentClient) {
    return NextResponse.json({ ok: false, reason: "not configured" }, { status: 200 });
  }

  const body = await request.json().catch(() => ({}));
  const type = body.type ?? body.topic;
  const mpId: string | undefined = body.data?.id ?? body.resource?.split?.("/").pop();

  if (type !== "payment" || !mpId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const mp = await paymentClient.get({ id: mpId });
    const externalRef = mp.external_reference;
    if (!externalRef) return NextResponse.json({ ok: true });

    const payment = await prisma.payment.findUnique({ where: { id: externalRef } });
    if (!payment) return NextResponse.json({ ok: true });

    const normalized = normalizeStatus(mp.status);
    const method = (mp.payment_type_id ?? mp.payment_method_id) as string | undefined;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerRef: String(mp.id),
        status: normalized,
        method,
        payerEmail: mp.payer?.email ?? payment.payerEmail,
        paidAt: normalized === "approved" ? new Date() : null,
        metadata: {
          ...(typeof payment.metadata === "object" && payment.metadata !== null
            ? payment.metadata
            : {}),
          mpStatus: mp.status,
          mpStatusDetail: mp.status_detail,
        },
      },
    });

    // Si aprobado y aún no tiene membresía, créala a partir del paquete en metadata
    if (normalized === "approved" && !payment.membershipId) {
      const md = payment.metadata as { packageId?: string; durationDays?: number } | null;
      const packageId = md?.packageId;
      if (packageId && payment.clientId) {
        const pkg = await prisma.package.findUnique({ where: { id: packageId } });
        if (pkg) {
          const now = new Date();
          const end = new Date(now);
          end.setDate(end.getDate() + pkg.durationDays);
          const membership = await prisma.membership.create({
            data: {
              clientId: payment.clientId,
              packageId: pkg.id,
              startDate: now,
              endDate: end,
              amountPaid: payment.amount,
              paymentMethod: method ?? "mercadopago",
              status: "active",
            },
          });
          await prisma.payment.update({
            where: { id: payment.id },
            data: { membershipId: membership.id },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 200 }); // 200 para que MP no reintente eternamente en bug nuestro
  }
}

function normalizeStatus(s: string | undefined): string {
  switch (s) {
    case "approved":
      return "approved";
    case "rejected":
    case "cancelled":
      return s;
    case "refunded":
    case "charged_back":
      return "refunded";
    default:
      return "pending";
  }
}
