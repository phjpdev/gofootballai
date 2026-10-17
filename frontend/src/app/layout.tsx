import type { Metadata, Viewport } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { PreventMobileZoom } from "@/components/layout/PreventMobileZoom";
import { AppProviders } from "@/components/providers/AppProviders";
import { getServerI18n, getServerLocale } from "@/lib/i18n/server";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerI18n();
  return {
    title: "Go Football AI",
    description: t.layout.metaDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} className={`${workSans.variable} antialiased`}>
      <body className="max-w-full overflow-x-hidden min-h-svh bg-gray-100 text-white lg:min-h-dvh">
        <AppProviders initialLocale={locale}>
          <PreventMobileZoom />
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
