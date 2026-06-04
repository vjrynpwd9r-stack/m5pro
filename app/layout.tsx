import { Header } from "@/components/header";
import { AuthProvider } from "@/lib/auth-context";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({
  variable: "--font-inter",
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
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex bg-slate-100">
        <AuthProvider>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </AuthProvider>
      </body>
    </html>
  );
}