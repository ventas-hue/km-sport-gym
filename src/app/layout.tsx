import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LM SPORT GYM - Donde se hacen los campeones",
  description: "Coaching fitness profesional por Karla Lizeth Merlos. Gimnasio en Morelia y coaching online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
