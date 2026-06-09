import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GoFootball.ai — AI-Powered Football Analytics",
  description:
    "GoFootball.ai delivers AI-driven match analysis, player performance insights, and football analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${workSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-100 text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
