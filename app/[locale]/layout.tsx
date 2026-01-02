import type React from "react";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "../globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Virtuoso - Aprende Violín Online",
  description:
    "Plataforma elegante para aprender a tocar el violín con lecciones interactivas y práctica en tiempo real",
  generator: "v0.app",
};

/**
 * Generates the static parameters for the layout.
 * @returns {Array<{locale: string}>} - The static parameters.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * The root layout for the application.
 * @param {Readonly<{children: React.ReactNode, params: Promise<{ locale: string }>}>} props - The props for the component.
 * @returns {Promise<JSX.Element>} - The rendered root layout component.
 */
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  /*
  if (!routing.locales.includes(locale)) {
    notFound()
  }
*/
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
