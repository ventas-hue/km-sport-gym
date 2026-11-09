import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export function getMpClient() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token });
}

export function getPreferenceClient() {
  const cfg = getMpClient();
  return cfg ? new Preference(cfg) : null;
}

export function getPaymentClient() {
  const cfg = getMpClient();
  return cfg ? new Payment(cfg) : null;
}

export function appUrl(): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}
