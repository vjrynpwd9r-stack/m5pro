"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  DollarSign,
  Package,
  Wrench,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { temPermissao } from "@/lib/auth";

const menu = [
  { label: "Início", href: "/", icon: LayoutDashboard, modulo: "dashboard" },
  { label: "Clientes", href: "/clientes", icon: Users, modulo: "clientes" },
  { label: "Veículos", href: "/veiculos", icon: Car, modulo: "veiculos" },
  { label: "OS", href: "/ordens-servico", icon: ClipboardList, modulo: "os" },
  { label: "Financeiro", href: "/financeiro", icon: DollarSign, modulo: "financeiro" },
  { label: "Estoque", href: "/estoque", icon: Package, modulo: "estoque" },
  { label: "Usuários", href: "/usuarios", icon: UserCog, modulo: "usuarios" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <aside className="w-20 min-h-screen bg-[#0f1729]" />
    );
  }

  const menuFiltrado = menu.filter((item) =>
    usuario ? temPermissao(usuario.perfil, item.modulo) : false
  );

  return (
    <aside className="w-20 min-h-screen bg-[#0f1729] text-white flex flex-col items-center py-2 gap-1 overflow-y-auto">
      <div className="flex flex-col items-center justify-center mb-4 mt-0 px-2">
        <img src="/logo.png" alt="M5 Blindados" className="w-14 object-contain" />
      </div>
      {menuFiltrado.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl text-center transition-colors gap-1 ${
              active
                ? "bg-orange-500 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}