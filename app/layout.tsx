import { LogoutButton } from "@/components/logout-button";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M5Pro — Gestão de Oficina",
  description: "Sistema de gestão para oficinas mecânicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex bg-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="bg-[#0f1729] text-white px-6 py-3 flex items-center justify-between shadow-md">
            <h1 className="text-sm font-semibold text-slate-300 tracking-wide">
              Sistema de Gestão de Oficina Mecânica
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </span>
              <LogoutButton />
            </div>
          </header>
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}