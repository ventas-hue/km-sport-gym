import { randomBytes } from "crypto";
import { prisma } from "./prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/1/I

function makeToken(size = 10): string {
  const bytes = randomBytes(size);
  let out = "";
  for (let i = 0; i < size; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Devuelve el token QR del cliente, creándolo si no tiene. */
export async function ensureQrToken(clientId: string): Promise<string> {
  const current = await prisma.client.findUnique({
    where: { id: clientId },
    select: { qrToken: true },
  });
  if (current?.qrToken) return current.qrToken;

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = makeToken(10);
    try {
      const updated = await prisma.client.update({
        where: { id: clientId },
        data: { qrToken: token },
        select: { qrToken: true },
      });
      return updated.qrToken!;
    } catch {
      // token colisión, reintenta
    }
  }
  throw new Error("No se pudo generar token QR único");
}

/** URL pública del check-in a partir del request o de APP_URL. */
export function checkinUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/$/, "")}/checkin/${token}`;
}
