import type { Metadata, Viewport } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { PreventMobileZoom } from "@/components/layout/PreventMobileZoom";
import { AppProviders } from "@/components/providers/AppProviders";

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

export const metadata: Metadata = {
  title: "世界盃 AI — 2026 世界盃賽事分析平台",
  description:
    "專為香港球迷而設的 2026 世界盃 AI 分析平台，提供賽事預測、戰術拆解、球隊數據及會員最新資訊。",
  icons: {
    icon: "/images/go-football-logo.png",
    shortcut: "/images/go-football-logo.png",
    apple: "/images/go-football-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" className={`${workSans.variable} antialiased`}>
      <body className="max-w-full overflow-x-hidden min-h-svh bg-gray-100 text-white lg:min-h-dvh">
        <AppProviders>
          <PreventMobileZoom />
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
