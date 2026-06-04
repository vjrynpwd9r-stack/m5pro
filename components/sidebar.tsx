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
} from "lucide-react";

const menu = [
  { label: "Início", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Veículos", href: "/veiculos", icon: Car },
  { label: "OS", href: "/ordens-servico", icon: ClipboardList },
  { label: "Financeiro", href: "/financeiro", icon: DollarSign },
  { label: "Estoque", href: "/estoque", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 min-h-screen bg-[#0f1729] text-white flex flex-col items-center py-4 gap-1">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center mb-6 mt-2">
        <div className="bg-orange-500 rounded-xl p-2">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <span className="text-[10px] font-bold text-orange-400 mt-1 tracking-widest">M5PRO</span>
      </div>

      {/* Menu */}
      {menu.map((item) => {
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